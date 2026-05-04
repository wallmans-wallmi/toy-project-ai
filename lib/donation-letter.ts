import { after } from "next/server";
import {
  getDonationJourneyLabel,
  isToyDropoffJourney,
  isWeaningJourneyId,
} from "@/lib/donation-journey";
import { createServiceRoleClient } from "@/lib/supabase/service";

/** ערכים נתמכים לעמודת letter_status */
export const LETTER_STATUSES = ["pending", "completed", "failed"] as const;
export type LetterStatus = (typeof LETTER_STATUSES)[number];

export function isLetterStatus(value: unknown): value is LetterStatus {
  return typeof value === "string" && LETTER_STATUSES.includes(value as LetterStatus);
}

/** שדות רלוונטיים לשאילתת מכתב / תעודה (תואם ל-Supabase) */
export type DonationLetterSource = {
  child_name: string | null;
  toy_description: string | null;
  toy_items: unknown;
  journey_type: string | null;
  letter_status: string | null;
  destination_name: string | null;
};

function toyItemsSummary(items: unknown): string {
  if (!Array.isArray(items)) return "";
  const lines: string[] = [];
  for (const entry of items) {
    if (!entry || typeof entry !== "object") continue;
    const o = entry as Record<string, unknown>;
    const t = o.type;
    if (t === "toy") {
      const itemName = typeof o.itemName === "string" ? o.itemName.trim() : "";
      const color = typeof o.color === "string" ? o.color.trim() : "";
      const size = typeof o.size === "string" ? o.size.trim() : "";
      const child = typeof o.childName === "string" ? o.childName.trim() : "";
      if (itemName) {
        const base = [itemName, color, size].filter(Boolean).join(" · ");
        lines.push(child ? `${child}: ${base}` : base);
      }
      continue;
    }
    if (t === "pacifier") {
      const q = typeof o.quantity === "number" ? o.quantity : "";
      const child = typeof o.childName === "string" ? o.childName.trim() : "";
      lines.push([child && `ילד/ה: ${child}`, q && `כמות ${q}`].filter(Boolean).join(" · "));
      continue;
    }
    if (t === "bottles_formula") {
      const sub = o.subType === "formula" ? "פורמולה" : o.subType === "bottles" ? "בקבוקים" : "";
      const note = typeof o.note === "string" ? o.note.trim() : "";
      lines.push([sub, note].filter(Boolean).join(" · "));
      continue;
    }
    if (t === "diapers") {
      const status = typeof o.status === "string" ? o.status.trim() : "";
      if (status) lines.push(`חיתולים · ${status}`);
      continue;
    }
    const name = typeof o.name === "string" ? o.name.trim() : "";
    const color = typeof o.color === "string" ? o.color.trim() : "";
    const size = typeof o.size === "string" ? o.size.trim() : "";
    if (name) lines.push([name, color, size].filter(Boolean).join(" · "));
  }
  return lines.join("\n");
}

async function openAiChatCompletion(system: string, user: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("Missing OPENAI_API_KEY");
  }

  const model = process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini";

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.82,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`OpenAI error ${res.status}: ${errText.slice(0, 500)}`);
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string | null } }[];
  };
  const content = data.choices?.[0]?.message?.content?.trim();
  if (!content) {
    throw new Error("OpenAI returned empty content");
  }
  return content;
}

/**
 * מכתב בעברית חמה **מילדי היעד** (המקבלים) **אל ילד/ת התורם/ת** — מסלול צעצועים.
 * `destination_name` יכול להיות null עד עדכון אדמין; במקרה כזה המכתב נשאר חם בלי שם מוסד קונקרטי.
 */
export async function generateToyDropoffRecipientLetter(input: {
  donorChildName: string;
  toyDescription: string | null;
  toyItems: unknown;
  destinationName: string | null;
}): Promise<string> {
  const itemsSummary = toyItemsSummary(input.toyItems);
  const dest = input.destinationName?.trim() || null;

  const system = `את/ה כותב/ת מכתב קצר וחם בעברית.
הקול הוא של "הילדים אצלנו" / הילדים במקום שקיבלו את הצעצועים — הם כותבים לילד או לילדה שתרמו/תרמה את הצעצועים (שם ילד התורם יינתן).
הטון: חמים, מזמינים, לא פורמליים — כמו מכתב אמיתי מחברים חדשים.
אל תכללו מידע על תשלום או לוגיסטיקה. אל תבקשו מידע אישי נוסף.
אורך כ-120–220 מילים. סיום עם משפט חם או חיבוק מילולי.
אם לא ניתן שם מדויק ליעד (מוסד/מקום), אל תמציאו שם — כתבו בגוף רך ("אצלנו", "כאן קיבלנו...") בלי לשקר על שם מוסד.`;

  const destBlock = dest
    ? `שם היעד / המקום שאליו הגיעו הצעצועים (לשילוב במכתב): ${dest}`
    : "שם היעד המדויק עדיין לא עודכן — כתבו בלי לציין שם מוסד ספציפי, בגוף חם וכללי.";

  const user = `שם ילד/ת התורם/ת (אליהם/ן המכתב מופנה): ${input.donorChildName.trim()}

${destBlock}

${input.toyDescription?.trim() ? `תיאור נוסף מההורים:\n${input.toyDescription.trim()}\n\n` : ""}${itemsSummary ? `רשימת צעצועים שהגיעו:\n${itemsSummary}` : "(לא צורפה רשימת פריטים מפורטת.)"}

כתבו את גוף המכתב בלבד, בעברית, בלי שורת נושא ובלי חתימה טכנית.`;

  return openAiChatCompletion(system, user);
}

/**
 * טקסט לתעודת "בוגר/ת" — חגיגת גמילה (מוצץ / חיתול / בקבוק).
 * נשמר באותה עמודת ai_generated_letter כמו המכתב במסלול צעצועים.
 */
export async function generateWeaningCertificateText(input: {
  childName: string;
  journeyType: string;
}): Promise<string> {
  const journeyLabel = getDonationJourneyLabel(input.journeyType);

  const system = `את/ה מנסח/ת בעברית טקסט קצר לתעודת "בוגר/ת" (תעודת גאווה) — לא מכתב חופשי.
סגנון: חגיגי, חם, גאה בילד/ה — מתאים להדפסה על גבי תעודה יפה.
אורך כ-80–150 מילים. אפשר שורת פתיחה כמו "תעודת בוגר/ת" או "תעודת גאווה" ואז גוף הטקסט.
בלי אזכור תשלום או אתר. בלי בקשות למידע נוסף.`;

  const user = `שם הילד/הילדה: ${input.childName.trim()}
נושא הגמילה (לשילוב בטקסט): ${journeyLabel}

כתבו את נוסח התעודה בלבד — טקסט רציף או עם שורות קצרות, בעברית, מתאים להדפסה.`;

  return openAiChatCompletion(system, user);
}

/**
 * נקרא אחרי תשלום מוצלח: יוצר מכתב (צעצועים) או נוסח תעודה (גמילה), ומעדכן ai_generated_letter + letter_status.
 */
export async function processDonationLetterAfterPayment(donationId: string): Promise<void> {
  const supabase = createServiceRoleClient();

  const { data: row, error: fetchError } = await supabase
    .from("donations")
    .select(
      "child_name, toy_description, toy_items, journey_type, letter_status, destination_name",
    )
    .eq("id", donationId)
    .maybeSingle();

  if (fetchError || !row) {
    console.error("donation-letter: fetch failed", fetchError?.message ?? "no row");
    return;
  }

  if (row.letter_status === "completed") {
    return;
  }

  const childName = typeof row.child_name === "string" ? row.child_name.trim() : "";
  if (!childName) {
    await supabase.from("donations").update({ letter_status: "failed" }).eq("id", donationId);
    console.error("donation-letter: missing child_name", donationId);
    return;
  }

  const journeyType = typeof row.journey_type === "string" ? row.journey_type : null;
  if (!journeyType || (!isToyDropoffJourney(journeyType) && !isWeaningJourneyId(journeyType))) {
    await supabase.from("donations").update({ letter_status: "failed" }).eq("id", donationId);
    console.error("donation-letter: unsupported journey_type", journeyType);
    return;
  }

  try {
    let output: string;

    if (isToyDropoffJourney(journeyType)) {
      output = await generateToyDropoffRecipientLetter({
        donorChildName: childName,
        toyDescription: typeof row.toy_description === "string" ? row.toy_description : null,
        toyItems: row.toy_items,
        destinationName:
          typeof row.destination_name === "string" ? row.destination_name : null,
      });
    } else {
      output = await generateWeaningCertificateText({
        childName,
        journeyType,
      });
    }

    const { error: updateError } = await supabase
      .from("donations")
      .update({
        ai_generated_letter: output,
        letter_status: "completed",
      })
      .eq("id", donationId);

    if (updateError) {
      console.error("donation-letter: save failed", updateError.message);
      await supabase.from("donations").update({ letter_status: "failed" }).eq("id", donationId);
    }
  } catch (e) {
    console.error("donation-letter: generation failed", e);
    await supabase.from("donations").update({ letter_status: "failed" }).eq("id", donationId);
  }
}

/** לאחר שמירת ליד (עגלה נטושה) — יצירת מכתב/תעודה ברקע בלי לחסום את תשובת ה-API */
export function scheduleDonationLetterAfterLeadCapture(donationId: string): void {
  after(() =>
    processDonationLetterAfterPayment(donationId).catch((err) =>
      console.error("donation-letter after lead capture:", err),
    ),
  );
}
