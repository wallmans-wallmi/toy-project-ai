import type { SupabaseClient } from "@supabase/supabase-js";
import { phoneComparableKey } from "@/lib/portal/phone";
import { isPostgrestMissingResourceError } from "@/lib/portal/postgrest-missing-resource";
import type { DonationSelectRow } from "@/lib/portal/types";

const DONATION_SYNC_FIELDS =
  "id,created_at,first_name,last_name,phone,email,address,street_name,house_number,apartment_number,floor,door_code,address_notes,pickup_city,payment_status,pickup_status,letter_status,scheduled_region,scheduled_slot,child_name,journey_type,amount_paid";

export type PortalSyncResult =
  | { ok: true; linkedDonations: number; profileCreated: boolean }
  | { ok: false; error: string };

function pickLatestByPhone(rows: DonationSelectRow[], key: string): DonationSelectRow | null {
  if (!key) return null;
  const matches = rows.filter((r) => phoneComparableKey(r.phone) === key);
  if (matches.length === 0) return null;
  return matches.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0] ?? null;
}

export async function runPortalCustomerSync(
  admin: SupabaseClient,
  userId: string,
  phoneE164: string,
): Promise<PortalSyncResult> {
  try {
    return await runPortalCustomerSyncInner(admin, userId, phoneE164);
  } catch {
    return { ok: false, error: "שגיאה לא צפויה בסנכרון" };
  }
}

async function runPortalCustomerSyncInner(
  admin: SupabaseClient,
  userId: string,
  phoneE164: string,
): Promise<PortalSyncResult> {
  const targetKey = phoneComparableKey(phoneE164);

  const { data: batch, error: fetchErr } = await admin
    .from("donations")
    .select(DONATION_SYNC_FIELDS)
    .order("created_at", { ascending: false })
    .limit(200);

  if (fetchErr) {
    if (isPostgrestMissingResourceError(fetchErr)) {
      return {
        ok: false,
        error:
          "חסרה טבלה או עמודה ב־donations בפרויקט Supabase: הריצו מיגרציות (כולל customer_user_id) או את customer_profiles_portal_bootstrap.sql",
      };
    }
    return { ok: false, error: "לא ניתן לטעון תרומות לסנכרון" };
  }

  const rows = (batch ?? []) as DonationSelectRow[];
  const latest = pickLatestByPhone(rows, targetKey);
  const idsToLink = rows.filter((r) => phoneComparableKey(r.phone) === targetKey).map((r) => r.id);

  const { data: existing, error: existingErr } = await admin
    .from("customer_profiles")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (existingErr) {
    if (isPostgrestMissingResourceError(existingErr)) {
      return {
        ok: false,
        error:
          "חסרה טבלת customer_profiles בפרויקט Supabase: פתחו SQL Editor והריצו את supabase/manual/customer_profiles_portal_bootstrap.sql",
      };
    }
    return { ok: false, error: "לא ניתן לבדוק פרופיל לקוח" };
  }

  const profileCreated = !existing;

  const nowIso = new Date().toISOString();

  if (!existing) {
    const sn = (latest?.street_name ?? "").trim();
    const hn = (latest?.house_number ?? "").trim();
    const an = (latest?.apartment_number ?? "").trim();
    const fl = (latest?.floor ?? "").trim();
    const addrLine = (latest?.address ?? "").trim();
    const insertPayload = {
      user_id: userId,
      phone: phoneE164,
      first_name: (latest?.first_name ?? "").trim(),
      last_name: (latest?.last_name ?? "").trim(),
      email: (latest?.email ?? "").trim(),
      street_name: sn || addrLine,
      house_number: hn,
      apartment_number: an,
      floor: fl,
      door_code: (latest?.door_code ?? "").trim(),
      address_notes: (latest?.address_notes ?? "").trim(),
      pickup_city: (latest?.pickup_city ?? "").trim(),
      updated_at: nowIso,
    };
    const { error: insErr } = await admin.from("customer_profiles").insert(insertPayload);
    if (insErr) {
      const code = "code" in insErr ? String((insErr as { code?: string }).code) : "";
      if (code === "23505") {
        const { error: upAfterDup } = await admin
          .from("customer_profiles")
          .update({ phone: phoneE164, updated_at: nowIso })
          .eq("user_id", userId);
        if (upAfterDup) {
          return { ok: false, error: "לא ניתן לעדכן פרופיל לאחר יצירה כפולה" };
        }
      } else {
        if (isPostgrestMissingResourceError(insErr)) {
          return {
            ok: false,
            error:
              "חסרה טבלת customer_profiles בפרויקט Supabase: הריצו את supabase/manual/customer_profiles_portal_bootstrap.sql",
          };
        }
        return { ok: false, error: "לא ניתן ליצור פרופיל לקוח" };
      }
    }
  } else {
    const sn = (latest?.street_name ?? "").trim();
    const hn = (latest?.house_number ?? "").trim();
    const an = (latest?.apartment_number ?? "").trim();
    const fl = (latest?.floor ?? "").trim();
    const addrLine = (latest?.address ?? "").trim();
    const mergeFromDonation = latest
      ? {
          phone: phoneE164,
          first_name: (latest.first_name ?? "").trim(),
          last_name: (latest.last_name ?? "").trim(),
          email: (latest.email ?? "").trim(),
          street_name: sn || addrLine,
          house_number: hn,
          apartment_number: an,
          floor: fl,
          door_code: (latest.door_code ?? "").trim(),
          address_notes: (latest.address_notes ?? "").trim(),
          pickup_city: (latest.pickup_city ?? "").trim(),
          updated_at: nowIso,
        }
      : { phone: phoneE164, updated_at: nowIso };

    const { error: phoneErr } = await admin.from("customer_profiles").update(mergeFromDonation).eq("user_id", userId);
    if (phoneErr) {
      if (isPostgrestMissingResourceError(phoneErr)) {
        return {
          ok: false,
          error:
            "חסרה טבלת customer_profiles בפרויקט Supabase: הריצו את supabase/manual/customer_profiles_portal_bootstrap.sql",
        };
      }
      return { ok: false, error: "לא ניתן לעדכן את הפרופיל מהתרומה" };
    }
  }

  const linkChunkSize = 80;
  for (let i = 0; i < idsToLink.length; i += linkChunkSize) {
    const chunk = idsToLink.slice(i, i + linkChunkSize);
    const { error: linkErr } = await admin.from("donations").update({ customer_user_id: userId }).in("id", chunk);
    if (linkErr) {
      if (isPostgrestMissingResourceError(linkErr)) {
        return {
          ok: false,
          error:
            "חסרה עמודה customer_user_id ב־donations או טבלה לא זמינה: הריצו מיגרציות Supabase",
        };
      }
      return { ok: false, error: "לא ניתן לקשר הזמנות לחשבון" };
    }
  }

  return { ok: true, linkedDonations: idsToLink.length, profileCreated };
}

