"use client";

import { ClaudePickupStepIndicator } from "@/components/public/donation-form-progress";
import { DonationFormSummary } from "@/components/public/donation-form-summary";
import {
  canAdvanceToNextStep,
  displayPrimaryChildName,
} from "@/components/public/donation-form-validation";
import { DonationFormContactFields } from "@/components/public/donation-form-contact-fields";
import { DonationFormAgreementBlocks } from "@/components/public/donation-form-region-legal";
import {
  DonationCheckoutLoadingPanel,
  DonationCheckoutSuccessPanel,
} from "@/components/public/donation-checkout-feedback";
import { DonationFormPackingKitsStep } from "@/components/public/donation-form-packing-kits-step";
import type { CheckoutSuccessPayload } from "@/hooks/use-donation-checkout";
import type { DonationFormState } from "@/hooks/use-donation-form";
import type { ToyItemRow } from "@/lib/toy-donation";
import { EXTRA_BAG_FEE_ILS, PICKUP_FEE_ILS, PICKUP_FEE_LABEL, pickupCheckoutTotalIls } from "@/lib/constants/pricing";
import { sumPackingExtraBags } from "@/lib/donation-packing-kits";
import { getRegionById, getSlotForRegion } from "@/lib/pickup-regions";
import { cn } from "@/lib/utils";
import { PickupSimulatedPaymentStep } from "@/components/forms/PickupSimulatedPaymentStep";
import { Loader2 } from "lucide-react";

export type DonationPickupFlowBundle = {
  stepIndex: number;
  stepCount: number;
  maxStepReached: number;
  stepLabel: string;
  stepTitle: string;
  form: DonationFormState;
  isFirst: boolean;
  isPaymentStep: boolean;
  goNext: () => void;
  goBack: () => void;
  goToStep: (i: number) => void;
  updateField: <K extends keyof DonationFormState>(key: K, value: DonationFormState[K]) => void;
  updateChildCount: (n: 1 | 2 | 3 | 4) => void;
  updatePackingChildName: (index: number, value: string) => void;
  updatePackingExtraBag: (index: number, value: number) => void;
  updateToyItem: (id: string, patch: Partial<Omit<ToyItemRow, "id">>) => void;
  addToyItem: () => void;
  removeToyItem: (id: string) => void;
  resetFlow: () => void;
};

type DonationFormPickupClaudeFlowProps = {
  flow: DonationPickupFlowBundle;
  draftSaving: boolean;
  checkoutLoading: boolean;
  checkoutError: string | null;
  checkoutSuccess: CheckoutSuccessPayload | null;
  onStartNewDonationForm: () => void;
  onRunCheckout: () => void;
};

export function DonationFormPickupClaudeFlow({
  flow,
  draftSaving,
  checkoutLoading,
  checkoutError,
  checkoutSuccess,
  onStartNewDonationForm,
  onRunCheckout,
}: DonationFormPickupClaudeFlowProps) {
  const regionMeta = getRegionById(flow.form.region);
  const selectedSlot =
    flow.form.pickupSlotId && flow.form.region
      ? getSlotForRegion(flow.form.region, flow.form.pickupSlotId)
      : undefined;

  const inputClassName = cn("h-12 min-h-[48px] rounded-2xl ps-4 pe-4 text-base md:text-base");
  const textareaClassName = cn("min-h-[120px] rounded-2xl ps-4 pe-4 py-3 text-base");
  const sectionSubClass = cn("text-xs text-slate-500");
  const fieldLabelClass = cn("text-xs font-semibold text-slate-700");

  const okNext = canAdvanceToNextStep(flow.stepIndex, flow.form, { pickupSplitSteps: true });

  const contactFieldsBlock = (
    <DonationFormContactFields
      form={flow.form}
      pickupSplitSteps
      fieldLabelClass={fieldLabelClass}
      sectionSubClass={sectionSubClass}
      inputClassName={cn(inputClassName, "pickup-native-field")}
      textareaClassName={textareaClassName}
      isPickup
      updateField={flow.updateField}
      showAccountPrepHint
    />
  );

  const summaryCheckboxes = (
    <DonationFormAgreementBlocks
      form={flow.form}
      pickupSplitSteps
      isPickup
      updateField={flow.updateField}
    />
  );

  const pickupNextLabel = flow.stepIndex === 2 ? "מעבר לתשלום ←" : "המשך ←";

  const stepHeadline: Record<number, { title: string; desc: string }> = {
    0: {
      title: "עבור כמה ילדים או ילדות?",
      desc: "כל ילד או ילדה מקבלים שקית אריזה משלהם. אחרי הבחירה ממלאים שם לכל ילד או ילדה כדי שהמעטפת תהיה מסודרת וברורה",
    },
    1: {
      title: "פרטים וכתובת",
      desc: "שם מלא, טלפון, מייל וכתובת מלאה למשלוח החזרה והעדכונים. תיאום חלון איסוף יתבצע איתכם אחרי ההרשמה",
    },
    2: {
      title: "סיכום",
      desc: "עוברים על הפרטים, מאשרים את תנאי השירות — ובשלב הבא מסך תשלום בהדמה עד לחיבור חברת סליקה",
    },
    3: {
      title: checkoutSuccess
        ? "יאס! נשמר בסטייל"
        : checkoutLoading
          ? "רגע קטן, שומרים…"
          : "תשלום (הדמה)",
      desc: checkoutSuccess
        ? "הכל אצלנו — עכשיו רק להתרווח ולחכות לשיחה החמה שלנו."
        : checkoutLoading
          ? "שולחות את הפרטים לשרת — עוד רגע זה שם."
          : "כאן תופיע סליקה אמיתית. כרגע אפשר ללחוץ למטה כדי לשמור את הבקשה במסד הנתונים כמו שצריך",
    },
  };

  const meta = stepHeadline[flow.stepIndex] ?? stepHeadline[0];
  const extraBagCount = sumPackingExtraBags(flow.form.childCount, flow.form.packingExtraBags);
  const checkoutTotalIls = pickupCheckoutTotalIls(extraBagCount);

  return (
    <div className="pickup-form-claude w-full flex-1 pb-4" dir="rtl" lang="he">
      <div className="form-card">
        <div className="form-steps-header">
          <ClaudePickupStepIndicator
            stepIndex={flow.stepIndex}
            stepCount={flow.stepCount}
            maxStepReached={flow.maxStepReached}
            onStepClick={flow.goToStep}
          />
          <p className="step-label">
            שלב <strong>{flow.stepIndex + 1}</strong> מתוך {flow.stepCount}: {flow.stepLabel}
          </p>
        </div>

        <div className="form-body">
          <section
            key={flow.stepIndex}
            className="pickup-step-animate pickup-step-panel"
            aria-labelledby="pickup-step-heading"
          >
            <h3 id="pickup-step-heading" className="pickup-step-title">
              {meta.title}
            </h3>
            <p className="pickup-step-desc">{meta.desc}</p>

            {flow.stepIndex === 0 ? (
              <div className="space-y-4">
                <DonationFormPackingKitsStep
                  form={flow.form}
                  fieldLabelClass={fieldLabelClass}
                  sectionSubClass={sectionSubClass}
                  inputClassName={inputClassName}
                  isPickup
                  updateChildCount={flow.updateChildCount}
                  updatePackingChildName={flow.updatePackingChildName}
                  updatePackingExtraBag={flow.updatePackingExtraBag}
                />
                <p
                  className="rounded-2xl border border-violet-200 bg-white px-4 py-3 text-center text-sm font-bold text-[#9333EA]"
                  aria-live="polite"
                >
                  סה״כ משוער כולל שקיות נוספות: ₪{checkoutTotalIls}
                  {extraBagCount > 0 ? (
                    <span className="mt-1 block text-xs font-medium text-neutral-600">
                      ({PICKUP_FEE_ILS}₪ בסיס + {extraBagCount} שקיות × {EXTRA_BAG_FEE_ILS}₪)
                    </span>
                  ) : null}
                </p>
              </div>
            ) : null}

            {flow.stepIndex === 1 ? <div className="space-y-4">{contactFieldsBlock}</div> : null}

            {flow.stepIndex === 2 ? (
              <div className="space-y-5">
                <DonationFormSummary
                  form={flow.form}
                  regionLabel={regionMeta?.label}
                  selectedSlot={selectedSlot}
                  variant="claude"
                  hideItems
                />
                {summaryCheckboxes}
              </div>
            ) : null}

            {flow.stepIndex === 3 ? (
              checkoutSuccess ? (
                <DonationCheckoutSuccessPanel
                  childName={displayPrimaryChildName(flow.form)}
                  referenceId={checkoutSuccess.id}
                  orderNumber={checkoutSuccess.order_number}
                />
              ) : checkoutLoading ? (
                <DonationCheckoutLoadingPanel />
              ) : (
                <PickupSimulatedPaymentStep
                  baseFeeIls={PICKUP_FEE_ILS}
                  baseFeeLabel={PICKUP_FEE_LABEL}
                  extraBagCount={extraBagCount}
                  extraBagUnitIls={EXTRA_BAG_FEE_ILS}
                  totalIls={checkoutTotalIls}
                  checkoutError={checkoutError}
                />
              )
            ) : null}
          </section>
        </div>

        <div className="form-footer px-8 pb-8 pt-2">
          <button
            type="button"
            className="btn-back"
            disabled={flow.isFirst || checkoutLoading}
            onClick={flow.goBack}
          >
            → חזרה
          </button>
          {flow.isPaymentStep ? (
            checkoutSuccess ? (
              <button type="button" className="btn-submit" onClick={onStartNewDonationForm}>
                מילוי טופס חדש
              </button>
            ) : (
              <button
                type="button"
                className="btn-submit btn-submit--checkout disabled:pointer-events-none"
                disabled={checkoutLoading}
                onClick={onRunCheckout}
              >
                {checkoutLoading ? (
                  <span className="inline-flex items-center justify-center gap-2">
                    <Loader2 className="size-5 shrink-0 animate-spin" strokeWidth={2.25} aria-hidden />
                    שומרים במערכת…
                  </span>
                ) : (
                  <span className="inline-flex items-center justify-center gap-1.5 text-center leading-snug">
                    <span aria-hidden>✨</span>
                    לאשר תשלום בהדמה ולשמור במערכת — ₪{checkoutTotalIls}
                  </span>
                )}
              </button>
            )
          ) : (
            <button type="button" className="btn-next" disabled={!okNext || draftSaving} onClick={flow.goNext}>
              {draftSaving ? (
                <span className="inline-flex items-center justify-center gap-2">
                  <Loader2 className="size-5 shrink-0 animate-spin" strokeWidth={2.25} aria-hidden />
                  שומרים פרטים…
                </span>
              ) : (
                pickupNextLabel
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
