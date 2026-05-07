"use client";

import { PortalPersonalForms } from "@/components/portal/portal-personal-forms";
import { PortalAccountDeleteSection } from "@/components/portal/account/portal-account-delete-section";
import type { PortalCustomerProfile } from "@/lib/portal/types";

type PortalProfileTabPanelProps = {
  profile: PortalCustomerProfile;
  userId: string;
  saveProfile: (patch: Partial<PortalCustomerProfile>, userId: string) => Promise<{ ok: boolean }>;
  onSaved: () => void;
};

export function PortalProfileTabPanel({ profile, userId, saveProfile, onSaved }: PortalProfileTabPanelProps) {
  return (
    <div className="space-y-8" dir="rtl" lang="he">
      <section>
        <h2 className="mb-3 text-[0.72rem] font-bold uppercase tracking-wide text-neutral-500">פרטים מהחשבון</h2>
        <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-stone-50">
          <dl className="text-[0.88rem]">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-100 px-4 py-3">
              <dt className="font-medium text-neutral-500">שם מלא</dt>
              <dd className="font-semibold text-neutral-900">
                {profile.firstName} {profile.lastName}
              </dd>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-100 px-4 py-3">
              <dt className="font-medium text-neutral-500">טלפון</dt>
              <dd className="font-semibold text-neutral-900" dir="ltr">
                {profile.phone}
              </dd>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
              <dt className="font-medium text-neutral-500">מייל</dt>
              <dd className="font-semibold text-neutral-900" dir="ltr">
                {profile.email || "לא צוין"}
              </dd>
            </div>
          </dl>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-[0.72rem] font-bold uppercase tracking-wide text-neutral-500">כתובת לאיסוף ועריכה</h2>
        <PortalPersonalForms profile={profile} userId={userId} saveProfile={saveProfile} onSaved={onSaved} />
      </section>

      <PortalAccountDeleteSection />
    </div>
  );
}
