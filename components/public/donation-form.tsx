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
import {
  ClaudePickupStepIndicator,
  DonationFormProgress,
  RequiredFieldStar,
} from "@/components/public/donation-form-progress";
import { DonationFormSummary } from "@/components/public/donation-form-summary";
import { DonationFormJourneyFields } from "@/components/public/donation-form-journey-fields";
import {
  canAdvanceToNextStep,
  displayPrimaryChildName,
} from "@/components/public/donation-form-validation";
import { DonationFormContactFields } from "@/components/public/donation-form-contact-fields";
import {
  DonationFormAgreementBlocks,
  DonationFormRegionSlotFields,
} from "@/components/public/donation-form-region-legal";
import {
  DonationCheckoutLoadingPanel,
  DonationCheckoutSuccessPanel,
} from "@/components/public/donation-checkout-feedback";
import { useDonationCheckout } from "@/hooks/use-donation-checkout";
import { useDonationForm } from "@/hooks/use-donation-form";
import { PICKUP_FEE_ILS, PICKUP_FEE_LABEL } from "@/lib/constants/pricing";
import {
  DONATION_JOURNEY_EMOJI,
  DONATION_JOURNEY_OPTIONS,
  type DonationJourneyId,
} from "@/lib/donation-journey";
import { getRegionById, getSlotForRegion, getSlotsForRegion } from "@/lib/pickup-regions";
import { cn } from "@/lib/utils";
import { PickupDonationItemsStep } from "@/components/forms/PickupDonationItemsStep";
import { PickupJourneyCategoryStep } from "@/components/forms/PickupJourneyCategoryStep";
import { PickupSimulatedPaymentStep } from "@/components/forms/PickupSimulatedPaymentStep";
import { Loader2 } from "lucide-react";

export type DonationFormVariant = "default" | "pickupPage";

type DonationFormProps = {
  variant?: DonationFormVariant;
  initialJourneyType?: DonationJourneyId;
};

const PICKUP_PRIMARY = "bg-[#9333EA] hover:bg-[#7c3aed]";
const PICKUP_ACCENT_TEXT = "text-[#9333EA]";

export function DonationForm({ variant = "default", initialJourneyType }: DonationFormProps) {
  const isPickup = variant === "pickupPage";
  const flow = useDonationForm({
    pickupSplitSteps: isPickup,
    initialJourneyType,
  });
  const {
    checkoutLoading,
    checkoutError,
    checkoutSuccess,
    clearCheckoutSuccess,
    runCheckout,
  } = useDonationCheckout();

  const selectClassName = cn(
    "flex w-full border border-input bg-transparent outline-none transition-colors focus-visible:border-ring focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-1 disabled:cursor-not-allowed disabled:opacity-50",
    isPickup
      ? "h-12 min-h-[48px] rounded-2xl ps-4 pe-4 text-base"
      : "h-10 rounded-lg px-3 py-2 text-sm",
  );

  const pickupNativeSelect = cn(
    "pickup-native-field min-h-[48px] w-full rounded-[var(--radius-xs)] border-[1.5px] border-[#E5E7EB] bg-[var(--bg)] px-4 py-3 text-base outline-none transition-colors focus:border-[var(--lavender-accent)] focus:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--lavender-accent)] focus-visible:outline-offset-1 disabled:opacity-50",
  );

  const inputClassName = cn(
    isPickup && "h-12 min-h-[48px] rounded-2xl ps-4 pe-4 text-base md:text-base",
  );
  const textareaClassName = cn(isPickup && "min-h-[120px] rounded-2xl ps-4 pe-4 py-3 text-base");

  const sectionSubClass = cn(isPickup ? "text-xs text-slate-500" : "text-sm text-slate-600");
  const fieldLabelClass = cn(isPickup ? "text-xs font-semibold text-slate-700" : "text-sm font-medium");

  const slots = getSlotsForRegion(flow.form.region);
  const regionMeta = getRegionById(flow.form.region);
  const selectedSlot =
    flow.form.pickupSlotId && flow.form.region
      ? getSlotForRegion(flow.form.region, flow.form.pickupSlotId)
      : undefined;

  const okNext = canAdvanceToNextStep(flow.stepIndex, flow.form, {
    pickupSplitSteps: flow.pickupSplitSteps,
  });

  const headerPad = isPickup ? "ps-5 pe-5 pt-6 sm:ps-6 sm:pe-6" : "";
  const contentPad = isPickup ? "ps-5 pe-5 sm:ps-6 sm:pe-6" : "";
  const footerPad = isPickup ? "ps-5 pe-5 pb-6 sm:ps-6 sm:pe-6" : "";

  const cardTitleClass = cn(
    "text-slate-900",
    isPickup ? "text-base font-bold" : "text-2xl font-bold",
  );
  const cardDescClass = cn(
    "text-slate-600",
    isPickup ? "text-xs leading-relaxed" : "text-base",
  );

  const stepMetaClass = cn("font-semibold", isPickup ? cn("text-xs", PICKUP_ACCENT_TEXT) : "text-sm text-[#a855f7]");

  const contactFieldsBlock = (
    <DonationFormContactFields
      form={flow.form}
      pickupSplitSteps={flow.pickupSplitSteps}
      fieldLabelClass={fieldLabelClass}
      sectionSubClass={sectionSubClass}
      inputClassName={cn(inputClassName, flow.pickupSplitSteps && "pickup-native-field")}
      textareaClassName={textareaClassName}
      isPickup={isPickup}
      updateField={flow.updateField}
    />
  );

  const regionSlotBlock = (
    <DonationFormRegionSlotFields
      form={flow.form}
      pickupSplitSteps={flow.pickupSplitSteps}
      fieldLabelClass={fieldLabelClass}
      sectionSubClass={sectionSubClass}
      selectClassName={flow.pickupSplitSteps ? pickupNativeSelect : selectClassName}
      slots={slots}
      updateField={flow.updateField}
    />
  );

  const summaryCheckboxes = (
    <DonationFormAgreementBlocks
      form={flow.form}
      pickupSplitSteps={flow.pickupSplitSteps}
      isPickup={isPickup}
      updateField={flow.updateField}
    />
  );

  const onStartNewDonationForm = () => {
    clearCheckoutSuccess();
    flow.resetFlow();
  };

  const pickupNextLabel =
    flow.pickupSplitSteps && flow.stepIndex === 4 ? "מעבר לתשלום ←" : "המשך ←";

  const defaultFlowNextLabel =
    !flow.pickupSplitSteps && flow.stepIndex === 3 ? "מעבר לתשלום" : "המשך";

  if (flow.pickupSplitSteps) {
    const stepHeadline: Record<number, { title: string; desc: string }> = {
      0: {
        title: "ממה נפרדים היום?",
        desc: "בוחרים את סוג הגמילה או המסירה — בשלב הבא נבחר אזור וזמן איסוף נוחים לכם",
      },
      1: {
        title: "איפה ומתי נפרדים?",
        desc: "בוחרים אזור וחלון זמן לאיסוף מהבית. אפשר להשאיר את החבילה ליד הדלת אם זה נוח",
      },
      2: {
        title: "פרטי קשר וכתובת",
        desc: "הפרטים משמשים לתיאום האיסוף ולעדכונים בלבד, בלי דיוור פרסומי ובלי שיתוף מיותר",
      },
      3: {
        title: "מה נוסף באיסוף?",
        desc: "ממלאים לפי המסלול שבחרתם — צעצועים עם שם לכל פריט, או פרטי גמילה — כדי שנסדר את האיסוף ואת המכתב",
      },
      4: {
        title: "סיכום הבקשה",
        desc: "עוברים על הכל יחד, מאשרים את מצב הפריטים ואת תנאי השירות — ובשלב הבא מסך תשלום בהדמה עד לחיבור חברת סליקה",
      },
      5: {
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
                <PickupJourneyCategoryStep form={flow.form} updateField={flow.updateField} />
              ) : null}

              {flow.stepIndex === 1 ? <div className="space-y-4">{regionSlotBlock}</div> : null}

              {flow.stepIndex === 2 ? <div className="space-y-4">{contactFieldsBlock}</div> : null}

              {flow.stepIndex === 3 ? (
                <PickupDonationItemsStep
                  form={flow.form}
                  fieldLabelClass={fieldLabelClass}
                  sectionSubClass={sectionSubClass}
                  inputClassName={cn(inputClassName)}
                  updateField={flow.updateField}
                  updateToyItem={flow.updateToyItem}
                  addToyItem={flow.addToyItem}
                  removeToyItem={flow.removeToyItem}
                />
              ) : null}

              {flow.stepIndex === 4 ? (
                <div className="space-y-5">
                  <DonationFormSummary
                    form={flow.form}
                    regionLabel={regionMeta?.label}
                    selectedSlot={selectedSlot}
                    variant="claude"
                  />
                  {summaryCheckboxes}
                </div>
              ) : null}

              {flow.stepIndex === 5 ? (
                checkoutSuccess ? (
                  <DonationCheckoutSuccessPanel
                    childName={displayPrimaryChildName(flow.form)}
                    referenceId={checkoutSuccess.id}
                  />
                ) : checkoutLoading ? (
                  <DonationCheckoutLoadingPanel />
                ) : (
                  <PickupSimulatedPaymentStep
                    feeLabel={PICKUP_FEE_LABEL}
                    feeIls={PICKUP_FEE_ILS}
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
                  onClick={() => runCheckout(flow.form)}
                >
                  {checkoutLoading ? (
                    <span className="inline-flex items-center justify-center gap-2">
                      <Loader2 className="size-5 shrink-0 animate-spin" strokeWidth={2.25} aria-hidden />
                      שומרים במערכת…
                    </span>
                  ) : (
                    <span className="inline-flex items-center justify-center gap-1.5 text-center leading-snug">
                      <span aria-hidden>✨</span>
                      לאשר תשלום בהדמה ולשמור במערכת — ₪{PICKUP_FEE_ILS}
                    </span>
                  )}
                </button>
              )
            ) : (
              <button type="button" className="btn-next" disabled={!okNext} onClick={flow.goNext}>
                {pickupNextLabel}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card
      className={cn(
        "border-white/80 bg-white/95 backdrop-blur-sm",
        isPickup && "min-h-0 flex-1 rounded-3xl border border-violet-100/70",
      )}
    >
      <CardHeader className={cn("space-y-4 border-b border-slate-100 pb-6", headerPad)}>
        <DonationFormProgress
          stepIndex={flow.stepIndex}
          stepCount={flow.stepCount}
          large={isPickup}
          accent={isPickup ? "pickup" : "default"}
          maxStepReached={flow.maxStepReached}
          onStepClick={flow.goToStep}
        />
        <p className={stepMetaClass}>{flow.stepTitle}</p>

        {flow.stepIndex === 0 ? (
          <>
            <CardTitle className={cardTitleClass}>מיקום וזמן איסוף</CardTitle>
            <CardDescription className={cardDescClass}>
              נא לבחור את המשימה שלכם היום, אזור איסוף וחלון זמן, ונמשיך יחד בשלב הבא לפרטי הקשר
            </CardDescription>
          </>
        ) : null}

        {flow.stepIndex === 1 ? (
          <>
            <CardTitle className={cardTitleClass}>פרטי קשר וכתובת</CardTitle>
            <CardDescription className={cardDescClass}>
              הפרטים משמשים לתיאום האיסוף ולעדכונים בלבד ללא שימוש למטרות אחרות
            </CardDescription>
          </>
        ) : null}

        {flow.stepIndex === 2 ? (
          <>
            <CardTitle className={cardTitleClass}>פרטי הפריטים</CardTitle>
            <CardDescription className={cardDescClass}>
              נא למלא את הפרטים לפי המסלול שבחרתם — צעצועים או מוצץ או בקבוק ופורמולה או חיתולים — ואישור האיכות בשלב הסיכום
            </CardDescription>
          </>
        ) : null}

        {flow.stepIndex === 3 ? (
          <>
            <CardTitle className={cardTitleClass}>סיכום</CardTitle>
            <CardDescription className={cardDescClass}>
              {`נא לעבור על הפרטים, לאשר את מצב הפריטים ואת תנאי השירות — ובשלב הבא מסך תשלום בהדמה (${PICKUP_FEE_LABEL}) ושמירה במערכת`}
            </CardDescription>
          </>
        ) : null}

        {flow.stepIndex === 4 ? (
          <>
            <CardTitle className={cardTitleClass}>
              {checkoutSuccess
                ? "יאס! נשמר בסטייל"
                : checkoutLoading
                  ? "רגע קטן, שומרים…"
                  : "תשלום (הדמה)"}
            </CardTitle>
            <CardDescription className={cardDescClass}>
              {checkoutSuccess
                ? "הפרטים אצלנו — ניצור קשר לסליקה בטוחה ואיסוף, בלי לחץ."
                : checkoutLoading
                  ? "שולחות את הפרטים לשרת — עוד רגע."
                  : `${PICKUP_FEE_LABEL} — מסך הדמה לסליקה, ובלחיצה נשמרת הבקשה במערכת עם סטטוס ממתין לתשלום`}
            </CardDescription>
          </>
        ) : null}
      </CardHeader>

      <CardContent className={cn("space-y-4 pt-6", contentPad, isPickup && "space-y-5")}>
        {flow.stepIndex === 0 ? (
          <div className="space-y-5">
            <fieldset className="space-y-3">
              <legend className={cn(fieldLabelClass, "mb-1 w-full")}>
                מה המשימה שלכם היום
                <RequiredFieldStar />
              </legend>
              <div className="flex flex-col gap-3">
                {DONATION_JOURNEY_OPTIONS.map((opt) => {
                  const selected = flow.form.journeyType === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      aria-pressed={selected}
                      className={cn(
                        "min-h-[52px] rounded-2xl border-2 p-4 ps-4 pe-4 text-start text-sm font-semibold leading-snug transition-colors sm:text-base",
                        selected
                          ? "border-[#9333EA] bg-violet-50 text-slate-900"
                          : "border-slate-200 bg-white text-slate-800 hover:border-violet-300",
                      )}
                      onClick={() => flow.updateField("journeyType", opt.id)}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </fieldset>

            {regionSlotBlock}
          </div>
        ) : null}

        {flow.stepIndex === 1 ? <div className="space-y-4">{contactFieldsBlock}</div> : null}

        {flow.stepIndex === 2 ? (
          <DonationFormJourneyFields
            form={flow.form}
            isPickup={isPickup}
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
            />
          ) : checkoutLoading ? (
            <DonationCheckoutLoadingPanel />
          ) : (
            <PickupSimulatedPaymentStep
              feeLabel={PICKUP_FEE_LABEL}
              feeIls={PICKUP_FEE_ILS}
              checkoutError={checkoutError}
            />
          )
        ) : null}
      </CardContent>

      <CardFooter className={cn("flex flex-wrap gap-3 border-t border-slate-100 pt-6", footerPad, isPickup && "gap-4")}>
        <Button
          type="button"
          variant="outline"
          className={cn("rounded-full", isPickup && "min-h-12 min-w-[96px] rounded-2xl px-5 text-base")}
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
              className={cn(
                "ms-auto border-[#9333EA]/40 text-[#581c87]",
                isPickup ? "min-h-12 rounded-2xl px-8 text-base" : "rounded-full px-8",
              )}
              onClick={onStartNewDonationForm}
            >
              מילוי טופס חדש
            </Button>
          ) : (
            <Button
              type="button"
              className={cn(
                "ms-auto inline-flex min-h-12 items-center justify-center gap-2 text-white shadow-lg shadow-[#9333EA]/35 transition-[transform,box-shadow] hover:scale-[1.02] hover:shadow-xl hover:shadow-[#9333EA]/40 active:scale-[0.99] disabled:opacity-85",
                PICKUP_PRIMARY,
                isPickup ? "min-h-12 rounded-2xl px-8 text-base" : "rounded-full px-8",
              )}
              disabled={checkoutLoading}
              onClick={() => runCheckout(flow.form)}
            >
              {checkoutLoading ? (
                <>
                  <Loader2 className="size-4 shrink-0 animate-spin" strokeWidth={2.25} aria-hidden />
                  שומרים במערכת…
                </>
              ) : (
                <>
                  <span aria-hidden>✨</span>
                  לאשר תשלום בהדמה ולשמור במערכת — ₪{PICKUP_FEE_ILS}
                </>
              )}
            </Button>
          )
        ) : (
          <Button
            type="button"
            className={cn(
              "ms-auto text-white",
              PICKUP_PRIMARY,
              isPickup ? "min-h-12 rounded-2xl px-8 text-base" : "rounded-full px-8",
            )}
            disabled={!okNext}
            onClick={flow.goNext}
          >
            {defaultFlowNextLabel}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
