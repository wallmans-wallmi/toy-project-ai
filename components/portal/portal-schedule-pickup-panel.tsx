"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { DonationFormRegionSlotFields } from "@/components/public/donation-form-region-legal";
import { RequiredFieldStar } from "@/components/public/donation-form-progress";
import { createEmptyDonationFormStateForPortalPickup, type DonationFormState } from "@/hooks/use-donation-form";
import { PORTAL_SCHEDULABLE_REGION_IDS } from "@/lib/portal/schedulable-pickup-regions";
import { getSlotsForRegion, isDeferredPickupSchedulingRegion } from "@/lib/pickup-regions";
import type { PortalDonationOrder } from "@/lib/portal/types";
import { cn } from "@/lib/utils";

type PortalSchedulePickupPanelProps = {
  donationId: string;
  order: PortalDonationOrder;
  mode: "schedule" | "edit";
  onClose: () => void;
  onSuccess: () => void;
};

export function PortalSchedulePickupPanel({ donationId, order, mode, onClose, onSuccess }: PortalSchedulePickupPanelProps) {
  const [form, setForm] = useState<DonationFormState>(() => createEmptyDonationFormStateForPortalPickup());
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateField = useCallback(<K extends keyof DonationFormState>(key: K, value: DonationFormState[K]) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "region") {
        next.pickupSlotId = null;
        next.pickupDate = "";
      }
      return next;
    });
  }, []);

  useEffect(() => {
    setError(null);
    if (
      mode === "edit" &&
      order.pickupSlotId &&
      order.scheduledRegion &&
      !isDeferredPickupSchedulingRegion(order.scheduledRegion)
    ) {
      const base = createEmptyDonationFormStateForPortalPickup();
      setForm({
        ...base,
        region: order.scheduledRegion,
        pickupSlotId: order.pickupSlotId,
        pickupDate: order.pickupDate ?? "",
        pickupCity: order.pickupCity?.trim() ?? "",
      });
    } else {
      setForm(createEmptyDonationFormStateForPortalPickup());
    }
  }, [donationId, mode, order.pickupCity, order.pickupDate, order.pickupSlotId, order.scheduledRegion]);

  const slots = useMemo(() => getSlotsForRegion(form.region), [form.region]);

  const submit = async () => {
    setError(null);
    if (!form.region || !form.pickupSlotId) {
      setError("נא לבחור אזור וחלון איסוף");
      return;
    }
    if (!form.termsAccepted) {
      setError("נא לאשר את תנאי השירות");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/portal/donations/${donationId}/schedule-pickup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          region: form.region,
          pickupSlotId: form.pickupSlotId,
          termsAccepted: true,
          pickupCity: form.pickupCity.trim() || undefined,
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "שגיאה בשמירה");
        return;
      }
      onSuccess();
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  const title = mode === "edit" ? "עריכת מועד איסוף" : "תיאום איסוף מהבית";

  return (
    <div className="mt-3 space-y-4 rounded-2xl border border-violet-100 bg-[#F9F5FF]/50 p-4" dir="rtl" lang="he">
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-bold text-slate-900">{title}</h3>
        <button
          type="button"
          className="shrink-0 rounded-lg px-2 py-1 text-xs font-medium text-slate-600 hover:bg-white"
          onClick={onClose}
        >
          סגירה
        </button>
      </div>

      <DonationFormRegionSlotFields
        form={form}
        pickupSplitSteps={false}
        fieldLabelClass="text-sm font-semibold text-slate-800"
        sectionSubClass="text-xs text-slate-500"
        selectClassName="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900"
        slots={slots}
        updateField={updateField}
        allowedRegionIds={PORTAL_SCHEDULABLE_REGION_IDS}
      />

      <div className="space-y-2">
        <label htmlFor={`portal-pickup-city-${donationId}`} className="text-sm font-semibold text-slate-800">
          עיר לאיסוף (אופציונלי)
        </label>
        <input
          id={`portal-pickup-city-${donationId}`}
          type="text"
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900"
          value={form.pickupCity}
          onChange={(e) => updateField("pickupCity", e.target.value)}
          placeholder="למשל תל אביב"
          autoComplete="address-level2"
        />
      </div>

      <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4">
        <input
          type="checkbox"
          className="mt-1 size-5 shrink-0 rounded border-slate-300 text-[#9333EA] accent-[#9333EA]"
          checked={form.termsAccepted}
          onChange={(e) => updateField("termsAccepted", e.target.checked)}
        />
        <span className="text-start text-sm leading-relaxed text-slate-800">
          <RequiredFieldStar className="me-1 ms-0 inline" />
          מאשרים כי קראנו והסכמנו ל
          <Link href="/terms" className="mx-1 font-semibold text-[#9333EA] underline-offset-2 hover:underline">
            תנאי השירות
          </Link>
          של האתר
        </span>
      </label>

      {error ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800" role="status">
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={submitting}
          className={cn(
            "rounded-xl bg-[#9333EA] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-opacity",
            submitting && "opacity-60",
          )}
          onClick={() => void submit()}
        >
          {submitting ? "שומרים…" : "שמירת מועד"}
        </button>
        <button type="button" className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700" onClick={onClose}>
          ביטול
        </button>
      </div>
    </div>
  );
}
