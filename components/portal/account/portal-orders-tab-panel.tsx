"use client";

import { useState } from "react";
import { PortalOrderCard, type PortalSchedulePanelState } from "@/components/portal/portal-order-card";
import type { PortalDonationOrder } from "@/lib/portal/types";

type PortalOrdersTabPanelProps = {
  orders: PortalDonationOrder[];
  onOrdersRefresh: () => void;
};

export function PortalOrdersTabPanel({ orders, onOrdersRefresh }: PortalOrdersTabPanelProps) {
  const [panel, setPanel] = useState<PortalSchedulePanelState>(null);

  if (orders.length === 0) {
    return (
      <p
        className="rounded-2xl border border-dashed border-violet-200 bg-[#F9F5FF]/60 p-6 text-center text-sm text-slate-600"
        dir="rtl"
        lang="he"
      >
        עדיין אין הזמנות מקושרות לחשבון. ודאו שהתחברתם עם אותו מספר טלפון כמו בבקשת האיסוף
      </p>
    );
  }

  const current = orders[0];
  const past = orders.slice(1);

  return (
    <div className="space-y-6" dir="rtl" lang="he">
      <section>
        <h2 className="mb-3 text-[0.72rem] font-bold uppercase tracking-wide text-neutral-500">הזמנה פעילה</h2>
        <ul className="space-y-4">
          <PortalOrderCard
            order={current}
            activePanel={panel}
            onOpenPanel={(id, mode) => setPanel({ donationId: id, mode })}
            onClosePanel={() => setPanel(null)}
            onOrdersRefresh={onOrdersRefresh}
          />
        </ul>
      </section>

      {past.length > 0 ? (
        <section>
          <details className="group rounded-2xl border border-violet-100 bg-white p-4 shadow-sm">
            <summary className="cursor-pointer text-[0.82rem] font-bold text-[#9333EA] marker:text-[#9333EA]">
              הזמנות קודמות ({past.length})
            </summary>
            <ul className="mt-2 divide-y divide-violet-50">
              {past.map((o) => (
                <PortalOrderCard
                  key={o.id}
                  order={o}
                  activePanel={panel}
                  onOpenPanel={(id, mode) => setPanel({ donationId: id, mode })}
                  onClosePanel={() => setPanel(null)}
                  onOrdersRefresh={onOrdersRefresh}
                  variant="compact"
                />
              ))}
            </ul>
          </details>
        </section>
      ) : null}
    </div>
  );
}
