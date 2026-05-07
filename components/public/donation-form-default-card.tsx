"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DonationFormProgress } from "@/components/public/donation-form-progress";
import { DonationFormSummary } from "@/components/public/donation-form-summary";
import { DonationFormJourneyFields } from "@/components/public/donation-form-journey-fields";
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
import type { useDonationForm } from "@/hooks/use-donation-form";
import { EXTRA_BAG_FEE_ILS, PICKUP_FEE_ILS, PICKUP_FEE_LABEL, pickupCheckoutTotalIls } from "@/lib/constants/pricing";
import { sumPackingExtraBags } from "@/lib/donation-packing-kits";
import { getRegionById, getSlotForRegion } from "@/lib/pickup-regions";
import { cn } from "@/lib/utils";
import { PickupSimulatedPaymentStep } from "@/components/forms/PickupSimulatedPaymentStep";
import { Loader2 } from "lucide-react";

type Flow = ReturnType<typeof useDonationForm>;

type DonationFormDefaultCardProps = {
  flow: Flow;
  draftSaving: boolean;
  checkoutLoading: boolean;
  checkoutError: string | null;
  checkoutSuccess: CheckoutSuccessPayload | null;
  onStartNewDonationForm: () => void;
  onRunCheckout: () => void;
};

const PICKUP_PRIMARY = "bg-[#9333EA] hover:bg-[#7c3aed]";

export function DonationFormDefaultCard({
  flow,
  draftSaving,
  checkoutLoading,
  checkoutError,
  checkoutSuccess,
  onStartNewDonationForm,
  onRunCheckout,
}: DonationFormDefaultCardProps) {
  const regionMeta = getRegionById(flow.form.region);
  const selectedSlot =
    flow.form.pickupSlotId && flow.form.region
      ? getSlotForRegion(flow.form.region, flow.form.pickupSlotId)
      : undefined;

  const extraBagCount = sumPackingExtraBags(flow.form.childCount, flow.form.packingExtraBags);
  const checkoutTotalIls = pickupCheckoutTotalIls(extraBagCount);

  const okNext = canAdvanceToNextStep(flow.stepIndex, flow.form, {
    pickupSplitSteps: flow.pickupSplitSteps,
  });

  const inputClassName = cn("h-12 min-h-[48px] rounded-2xl ps-4 pe-4 text-base md:text-base");
  const textareaClassName = cn("min-h-[120px] rounded-2xl ps-4 pe-4 py-3 text-base");
  const sectionSubClass = cn("text-xs text-slate-500");
  const fieldLabelClass = cn("text-xs font-semibold text-slate-700");

  const contactFieldsBlock = (
    <DonationFormContactFields
      form={flow.form}
      pickupSplitSteps={flow.pickupSplitSteps}
      fieldLabelClass={fieldLabelClass}
      sectionSubClass={sectionSubClass}
      inputClassName={cn(inputClassName, "pickup-native-field")}
      textareaClassName={textareaClassName}
      isPickup={false}
      updateField={flow.updateField}
      showAccountPrepHint
    />
  );

  const summaryCheckboxes = (
    <DonationFormAgreementBlocks
      form={flow.form}
      pickupSplitSteps={flow.pickupSplitSteps}
      isPickup={false}
      updateField={flow.updateField}
    />
  );

  const defaultFlowNextLabel = flow.stepIndex === 3 ? "מעבר לתשלום" : "המשך";

  return (
    <Card className="border-white/80 bg-white/95 backdrop-blur-sm">
      <CardHeader className="space-y-4 border-b border-slate-100 pb-6">
        <DonationFormProgress
          stepIndex={flow.stepIndex}
          stepCount={flow.stepCount}
          large={false}
          accent="default"
          maxStepReached={flow.maxStepReached}
          onStepClick={flow.goToStep}
        />
        <p className={cn("font-semibold text-sm text-[#a855f7]")}>{flow.stepTitle}</p>

        {flow.stepIndex === 0 ? (
          <>
            <CardTitle className="text-2xl font-bold text-slate-900">ערכות אריזה וילדים</CardTitle>
            <CardDescription className="text-base text-slate-600">
              בוחרים כמה ילדים או ילדות מקבלים שקית ממותגת, וממלאים שם לכל תווית כדי שהמעטפת תהיה מסודרת
            </CardDescription>
          </>
        ) : null}

        {flow.stepIndex === 1 ? (
          <>
            <CardTitle className="text-2xl font-bold text-slate-900">חשבון וכתובת למשלוח</CardTitle>
            <CardDescription className="text-base text-slate-600">
              שם מלא, טלפון, מייל וכתובת מלאה. תיאום חלון איסוף יתבצע איתכם אחרי ההרשמה
            </CardDescription>
          </>
        ) : null}

        {flow.stepIndex === 2 ? (
          <>
            <CardTitle className="text-2xl font-bold text-slate-900">פרטי הפריטים</CardTitle>
            <CardDescription className="text-base text-slate-600">
              נא למלא את פרטי הצעצועים לכל פריט ולאשר את מצב הפריטים בשלב הסיכום
            </CardDescription>
          </>
        ) : null}

        {flow.stepIndex === 3 ? (
          <>
            <CardTitle className="text-2xl font-bold text-slate-900">סיכום</CardTitle>
            <CardDescription className="text-base text-slate-600">
              נא לעבור על הפרטים, לאשר את מצב הפריטים ואת תנאי השירות — ובשלב הבא מסך תשלום בהדמה (דמי בסיס {PICKUP_FEE_ILS}₪ ושקיות נוספות אם בחרתם) ושמירה במערכת
            </CardDescription>
          </>
        ) : null}

        {flow.stepIndex === 4 ? (
          <>
            <CardTitle className="text-2xl font-bold text-slate-900">
              {checkoutSuccess
                ? "יאס! נשמר בסטייל"
                : checkoutLoading
                  ? "רגע קטן, שומרים…"
                  : "תשלום (הדמה)"}
            </CardTitle>
            <CardDescription className="text-base text-slate-600">
              {checkoutSuccess
                ? "הפרטים אצלנו — ניצור קשר לסליקה בטוחה ואיסוף, בלי לחץ."
                : checkoutLoading
                  ? "שולחות את הפרטים לשרת — עוד רגע."
                  : `מסך הדמה לסליקה: סה״כ משוער ₪${checkoutTotalIls} (בסיס ${PICKUP_FEE_ILS}₪ + שקיות נוספות אם יש). בלחיצה נשמרת הבקשה במערכת עם סטטוס ממתין לתשלום`}
            </CardDescription>
          </>
        ) : null}
      </CardHeader>

      <CardContent className="space-y-4 pt-6">
        {flow.stepIndex === 0 ? (
          <div className="space-y-4">
            <DonationFormPackingKitsStep
              form={flow.form}
              fieldLabelClass={fieldLabelClass}
              sectionSubClass={sectionSubClass}
              inputClassName={cn(inputClassName)}
              isPickup={false}
              updateChildCount={flow.updateChildCount}
              updatePackingChildName={flow.updatePackingChildName}
              updatePackingExtraBag={flow.updatePackingExtraBag}
            />
            <p
              className="rounded-2xl border border-violet-200 bg-violet-50/50 px-4 py-3 text-center text-sm font-bold text-[#9333EA]"
              aria-live="polite"
            >
              סה״כ משוער כולל שקיות נוספות: ₪{checkoutTotalIls}
              {extraBagCount > 0 ? (
                <span className="mt-1 block text-xs font-medium text-slate-600">
                  ({PICKUP_FEE_ILS}₪ בסיס + {extraBagCount} שקיות × {EXTRA_BAG_FEE_ILS}₪)
                </span>
              ) : null}
            </p>
          </div>
        ) : null}

        {flow.stepIndex === 1 ? <div className="space-y-4">{contactFieldsBlock}</div> : null}

        {flow.stepIndex === 2 ? (
          <DonationFormJourneyFields
            form={flow.form}
            isPickup={false}
            fieldLabelClass={fieldLabelClass}
            sectionSubClass={sectionSubClass}
            inputClassName={cn(inputClassName)}
            updateField={flow.updateField}
            updateToyItem={flow.updateToyItem}
            addToyItem={flow.addToyItem}
            removeToyItem={flow.removeToyItem}
          />
        ) : null}

        {flow.stepIndex === 3 ? (
          <div className="space-y-5">
            <DonationFormSummary
              form={flow.form}
              regionLabel={regionMeta?.label}
              selectedSlot={selectedSlot}
            />
            {summaryCheckboxes}
          </div>
        ) : null}

        {flow.stepIndex === 4 ? (
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
      </CardContent>

      <CardFooter className="flex flex-wrap gap-3 border-t border-slate-100 pt-6">
        <Button
          type="button"
          variant="outline"
          className="rounded-full"
          disabled={flow.isFirst || checkoutLoading}
          onClick={flow.goBack}
        >
          חזרה
        </Button>
        {flow.isPaymentStep ? (
          checkoutSuccess ? (
            <Button
              type="button"
              variant="outline"
              className="ms-auto rounded-full border-[#9333EA]/40 px-8 text-[#581c87]"
              onClick={onStartNewDonationForm}
            >
              מילוי טופס חדש
            </Button>
          ) : (
            <Button
              type="button"
              className={cn(
                "ms-auto inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-8 text-white shadow-lg shadow-[#9333EA]/35 transition-[transform,box-shadow] hover:scale-[1.02] hover:shadow-xl hover:shadow-[#9333EA]/40 active:scale-[0.99] disabled:opacity-85",
                PICKUP_PRIMARY,
              )}
              disabled={checkoutLoading}
              onClick={onRunCheckout}
            >
              {checkoutLoading ? (
                <>
                  <Loader2 className="size-4 shrink-0 animate-spin" strokeWidth={2.25} aria-hidden />
                  שומרים במערכת…
                </>
              ) : (
                <>
                  <span aria-hidden>✨</span>
                  לאשר תשלום בהדמה ולשמור במערכת — ₪{checkoutTotalIls}
                </>
              )}
            </Button>
          )
        ) : (
          <Button
            type="button"
            className={cn("ms-auto rounded-full px-8 text-white", PICKUP_PRIMARY)}
            disabled={!okNext || draftSaving}
            onClick={flow.goNext}
          >
            {draftSaving ? (
              <span className="inline-flex items-center justify-center gap-2">
                <Loader2 className="size-4 shrink-0 animate-spin" strokeWidth={2.25} aria-hidden />
                שומרים פרטים…
              </span>
            ) : (
              defaultFlowNextLabel
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
