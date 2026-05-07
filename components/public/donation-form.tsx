"use client";

import { DonationFormDefaultCard } from "@/components/public/donation-form-default-card";
import { DonationFormPickupClaudeFlow } from "@/components/public/donation-form-pickup-claude-flow";
import { PostCheckoutPortalRedirect } from "@/components/public/post-checkout-portal-redirect";
import { useDonationIntake } from "@/hooks/use-donation-intake";
import type { DonationJourneyId } from "@/lib/donation-journey";

export type DonationFormVariant = "default" | "pickupPage";

type DonationFormProps = {
  variant?: DonationFormVariant;
  initialJourneyType?: DonationJourneyId;
};

export function DonationForm({ variant = "default", initialJourneyType }: DonationFormProps) {
  const isPickup = variant === "pickupPage";
  const intake = useDonationIntake({
    pickupSplitSteps: isPickup,
    initialJourneyType,
  });

  if (intake.flow.pickupSplitSteps) {
    return (
      <>
        <PostCheckoutPortalRedirect
          key={intake.checkoutSuccess?.id ?? "idle"}
          checkoutSuccess={intake.checkoutSuccess}
          enabled
        />
        <DonationFormPickupClaudeFlow
          flow={intake.flow}
          draftSaving={intake.draftSaving}
          checkoutLoading={intake.checkoutLoading}
          checkoutError={intake.checkoutError}
          checkoutSuccess={intake.checkoutSuccess}
          onStartNewDonationForm={intake.onStartNewDonationForm}
          onRunCheckout={intake.onRunCheckout}
        />
      </>
    );
  }

  return (
    <DonationFormDefaultCard
      flow={intake.flow}
      draftSaving={intake.draftSaving}
      checkoutLoading={intake.checkoutLoading}
      checkoutError={intake.checkoutError}
      checkoutSuccess={intake.checkoutSuccess}
      onStartNewDonationForm={intake.onStartNewDonationForm}
      onRunCheckout={intake.onRunCheckout}
    />
  );
}
