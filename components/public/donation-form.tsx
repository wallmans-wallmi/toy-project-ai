"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  ClaudePickupStepIndicator,
  DonationFormProgress,
  RequiredFieldStar,
} from "@/components/public/donation-form-progress";
import { DonationFormSummary } from "@/components/public/donation-form-summary";
import { DonationFormToyStep } from "@/components/public/donation-form-toy-step";
import { canAdvanceToNextStep } from "@/components/public/donation-form-validation";
import { ShippingPickers } from "@/components/forms/ShippingPickers";
import { PickupDoorNotice } from "@/components/public/pickup-door-notice";
import { useDonationCheckout } from "@/hooks/use-donation-checkout";
import { useDonationForm } from "@/hooks/use-donation-form";
import { applyPickupDateTime } from "@/hooks/useShippingDetails";
import { PICKUP_FEE_ILS, PICKUP_FEE_LABEL } from "@/lib/constants/pricing";
import {
  DONATION_JOURNEY_EMOJI,
  DONATION_JOURNEY_OPTIONS,
  type DonationJourneyId,
} from "@/lib/donation-journey";
import { getPickupMonThuForWeekOffset } from "@/lib/pickup-schedule-slots";
import { getRegionById, getSlotForRegion, getSlotsForRegion, PICKUP_REGIONS } from "@/lib/pickup-regions";
import { cn } from "@/lib/utils";

export type DonationFormVariant = "default" | "pickupPage";

type DonationFormProps = {
  variant?: DonationFormVariant;
};

const PICKUP_PRIMARY = "bg-[#9333EA] hover:bg-[#7c3aed]";
const PICKUP_ACCENT_TEXT = "text-[#9333EA]";

export function DonationForm({ variant = "default" }: DonationFormProps) {
  const isPickup = variant === "pickupPage";
  const flow = useDonationForm({ pickupSplitSteps: isPickup });
  const { checkoutLoading, checkoutError, runCheckout } = useDonationCheckout();

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
    <>
      <div className={cn("grid gap-4", flow.pickupSplitSteps ? "field-row" : "sm:grid-cols-2")}>
        <div className={cn("space-y-2", flow.pickupSplitSteps && "field-group")}>
          <Label htmlFor="firstName" className={fieldLabelClass}>
            שם פרטי
            <RequiredFieldStar />
          </Label>
          <Input
            id="firstName"
            className={cn(inputClassName, flow.pickupSplitSteps && "pickup-native-field")}
            value={flow.form.firstName}
            onChange={(e) => flow.updateField("firstName", e.target.value)}
            placeholder="למשל יעל"
            autoComplete="given-name"
          />
        </div>
        <div className={cn("space-y-2", flow.pickupSplitSteps && "field-group")}>
          <Label htmlFor="lastName" className={fieldLabelClass}>
            שם משפחה
            <RequiredFieldStar />
          </Label>
          <Input
            id="lastName"
            className={cn(inputClassName, flow.pickupSplitSteps && "pickup-native-field")}
            value={flow.form.lastName}
            onChange={(e) => flow.updateField("lastName", e.target.value)}
            placeholder="למשל כהן"
            autoComplete="family-name"
          />
        </div>
      </div>
      <div className={cn("space-y-2", flow.pickupSplitSteps && "field-group")}>
        <Label htmlFor="phone" className={fieldLabelClass}>
          טלפון
          <RequiredFieldStar />
        </Label>
        <Input
          id="phone"
          type="tel"
          dir="ltr"
          className={cn(
            inputClassName,
            flow.pickupSplitSteps ? "pickup-native-field pickup-field-ltr" : "text-end",
          )}
          value={flow.form.phone}
          onChange={(e) => flow.updateField("phone", e.target.value)}
          placeholder="0500000000"
          autoComplete="tel"
        />
      </div>
      <div className={cn("space-y-2", flow.pickupSplitSteps && "field-group")}>
        <Label htmlFor="email" className={fieldLabelClass}>
          מייל
          <RequiredFieldStar />
        </Label>
        <Input
          id="email"
          type="email"
          dir="ltr"
          className={cn(
            inputClassName,
            flow.pickupSplitSteps ? "pickup-native-field pickup-field-ltr" : "text-end",
          )}
          value={flow.form.email}
          onChange={(e) => flow.updateField("email", e.target.value)}
          placeholder="הזינו כתובת מייל פעילה"
          autoComplete="email"
        />
        <p className={sectionSubClass}>עדכונים על האיסוף והתשלום בלבד ללא דיוור פרסומי</p>
      </div>

      <div className={cn("space-y-2", flow.pickupSplitSteps && "field-group")}>
        <Label htmlFor="streetName" className={fieldLabelClass}>
          שם רחוב
          <RequiredFieldStar />
        </Label>
        <Input
          id="streetName"
          className={cn(inputClassName, flow.pickupSplitSteps && "pickup-native-field")}
          value={flow.form.streetName}
          onChange={(e) => flow.updateField("streetName", e.target.value)}
          placeholder="למשל רחוב הרצל"
          autoComplete="street-address"
        />
      </div>
      <div className={cn("grid gap-4", flow.pickupSplitSteps ? "field-row" : "sm:grid-cols-2")}>
        <div className={cn("space-y-2", flow.pickupSplitSteps && "field-group")}>
          <Label htmlFor="houseNumber" className={fieldLabelClass}>
            מספר בית
            <RequiredFieldStar />
          </Label>
          <Input
            id="houseNumber"
            className={cn(
              inputClassName,
              flow.pickupSplitSteps && "pickup-native-field pickup-field-ltr",
            )}
            dir="ltr"
            value={flow.form.houseNumber}
            onChange={(e) => flow.updateField("houseNumber", e.target.value)}
            placeholder="למשל 12"
            autoComplete="off"
          />
        </div>
        <div className={cn("space-y-2", flow.pickupSplitSteps && "field-group")}>
          <Label htmlFor="apartmentNumber" className={fieldLabelClass}>
            מספר דירה
          </Label>
          <Input
            id="apartmentNumber"
            className={cn(
              inputClassName,
              flow.pickupSplitSteps && "pickup-native-field pickup-field-ltr",
            )}
            dir="ltr"
            value={flow.form.apartmentNumber}
            onChange={(e) => flow.updateField("apartmentNumber", e.target.value)}
            placeholder="למשל 4"
            autoComplete="off"
          />
        </div>
      </div>
      <div className={cn("grid gap-4", flow.pickupSplitSteps ? "field-row" : "sm:grid-cols-2")}>
        <div className={cn("space-y-2", flow.pickupSplitSteps && "field-group")}>
          <Label htmlFor="floor" className={fieldLabelClass}>
            קומה
          </Label>
          <Input
            id="floor"
            className={cn(
              inputClassName,
              flow.pickupSplitSteps && "pickup-native-field pickup-field-ltr",
            )}
            dir="ltr"
            value={flow.form.floor}
            onChange={(e) => flow.updateField("floor", e.target.value)}
            placeholder="למשל 2"
            autoComplete="off"
          />
        </div>
        <div className={cn("space-y-2", flow.pickupSplitSteps && "field-group")}>
          <Label htmlFor="doorCode" className={fieldLabelClass}>
            קוד כניסה
          </Label>
          <Input
            id="doorCode"
            className={cn(
              inputClassName,
              flow.pickupSplitSteps && "pickup-native-field pickup-field-ltr",
            )}
            dir="ltr"
            value={flow.form.doorCode}
            onChange={(e) => flow.updateField("doorCode", e.target.value)}
          placeholder="למשל #1234"
          autoComplete="off"
        />
      </div>
    </div>
      <div className={cn("space-y-2", flow.pickupSplitSteps && "field-group")}>
        <Label htmlFor="addressNotes" className={fieldLabelClass}>
          הערות נוספות לכתובת
        </Label>
        <Textarea
          id="addressNotes"
          className={cn(textareaClassName, flow.pickupSplitSteps && "pickup-native-field")}
          value={flow.form.addressNotes}
          onChange={(e) => flow.updateField("addressNotes", e.target.value)}
          placeholder="חניה הוראות הגעה פרטים נוספים לצוות האיסוף"
          rows={isPickup ? 4 : 3}
        />
      </div>
    </>
  );

  const regionSlotBlock = (
    <>
      {flow.pickupSplitSteps ? (
        <ShippingPickers form={flow.form} updateField={flow.updateField} slots={slots} />
      ) : (
        <>
          <div className="space-y-2">
            <label htmlFor="region" className={fieldLabelClass}>
              אזור איסוף
              <RequiredFieldStar />
            </label>
            <select
              id="region"
              className={selectClassName}
              value={flow.form.region}
              onChange={(e) => flow.updateField("region", e.target.value)}
            >
              <option value="">בחרו מהרשימה</option>
              {PICKUP_REGIONS.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label htmlFor="pickupSlot" className={fieldLabelClass}>
              זמן לאיסוף
              <RequiredFieldStar />
            </label>
            <select
              id="pickupSlot"
              className={selectClassName}
              value={flow.form.pickupSlotId ?? ""}
              disabled={!flow.form.region}
              onChange={(e) => {
                const raw = e.target.value;
                if (raw === "") {
                  flow.updateField("pickupSlotId", null);
                  flow.updateField("pickupDate", "");
                  return;
                }
                const p = getPickupMonThuForWeekOffset(0);
                const tail = raw.split("_").pop();
                const dateIso =
                  tail === "mon_1214" ? p.mon.iso : tail === "thu_1214" ? p.thu.iso : "";
                if (dateIso) applyPickupDateTime(dateIso, raw, flow.updateField);
                else flow.updateField("pickupSlotId", raw);
              }}
            >
              <option value="">
                {flow.form.region ? "בחרו יום ושעת איסוף" : "קודם יש לבחור אזור איסוף"}
              </option>
              {slots.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
            <p className={sectionSubClass}>לפי האזור נפתחים חלונות הזמן הרלוונטיים בלבד</p>
          </div>
        </>
      )}
      <PickupDoorNotice className={flow.pickupSplitSteps ? "mt-1" : undefined} />
    </>
  );

  const summaryCheckboxes = (
    <>
      <label
        className={cn(
          "flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 ps-4 pe-4 transition-colors hover:border-violet-200",
          flow.pickupSplitSteps && "rounded-[var(--radius-xs)] border-[#E5E7EB]",
          !flow.pickupSplitSteps && isPickup && "min-h-[52px] rounded-3xl p-5",
        )}
      >
        <input
          type="checkbox"
          className="mt-1 size-5 shrink-0 rounded border-slate-300 text-[#9333EA] accent-[#9333EA]"
          checked={flow.form.toysQualityConfirmed}
          onChange={(e) => flow.updateField("toysQualityConfirmed", e.target.checked)}
        />
        <span
          className={cn(
            "text-start text-sm leading-relaxed text-slate-800",
            flow.pickupSplitSteps && "text-[0.85rem]",
            !flow.pickupSplitSteps && isPickup && "text-xs",
          )}
        >
          <RequiredFieldStar className="me-1 ms-0 inline" />
          מאשרים או מאשרות שהפריטים תקינים, נקיים ולא שבורים
        </span>
      </label>
      <label
        className={cn(
          "flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 ps-4 pe-4 transition-colors hover:border-violet-200",
          flow.pickupSplitSteps && "rounded-[var(--radius-xs)] border-[#E5E7EB]",
          !flow.pickupSplitSteps && isPickup && "min-h-[52px] rounded-3xl p-5",
        )}
      >
        <input
          type="checkbox"
          className="mt-1 size-5 shrink-0 rounded border-slate-300 text-[#9333EA] accent-[#9333EA]"
          checked={flow.form.termsAccepted}
          onChange={(e) => flow.updateField("termsAccepted", e.target.checked)}
        />
        <span
          className={cn(
            "text-start text-sm leading-relaxed text-slate-800",
            flow.pickupSplitSteps && "text-[0.85rem]",
            !flow.pickupSplitSteps && isPickup && "text-xs",
          )}
        >
          <RequiredFieldStar className="me-1 ms-0 inline" />
          מאשרים כי קראנו והסכמנו ל
          <Link
            href="/terms"
            className="mx-1 font-semibold text-[#9333EA] underline-offset-2 hover:underline"
          >
            תנאי השירות
          </Link>
          של האתר
        </span>
      </label>
    </>
  );

  const paymentExtrasBlock = (
    <>
      <ul className="space-y-2 text-xs text-slate-600 sm:text-sm">
        <li className="flex gap-2">
          <span className="text-[#9333EA]" aria-hidden>
            ✓
          </span>
          <span>שינוע ואיסוף עד הכתובת שבחרתם בחלון שקבעתם</span>
        </li>
        <li className="flex gap-2">
          <span className="text-[#9333EA]" aria-hidden>
            ✓
          </span>
          <span>מכתב AI מותאם לילד או לילדה המקבלים את הפריטים</span>
        </li>
        <li className="flex gap-2">
          <span className="text-[#9333EA]" aria-hidden>
            ✓
          </span>
          <span>תשלום מאובטח Stripe ללא שמירת פרטי כרטיס אצלנו</span>
        </li>
      </ul>
      {checkoutError ? (
        <p
          className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          {checkoutError}
        </p>
      ) : null}
    </>
  );

  const pickupNextLabel =
    flow.pickupSplitSteps && flow.stepIndex === 4 ? "לתשלום ←" : "המשך ←";

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
        desc: "שם הילד או הילדה ופרטים על כל פריט לפי המסלול שבחרתם — זה עוזר לנו לסדר את האיסוף ואת המכתב",
      },
      4: {
        title: "סיכום הבקשה",
        desc: "עוברים על הכל יחד, מאשרים את מצב הפריטים ואת תנאי השירות — ואז עוברים לתשלום מאובטח",
      },
      5: {
        title: "תשלום מאובטח",
        desc: "הסכום כולל שינוע ואיסוף עד הבית ומכתב AI חם לילד המקבל. אחרי תשלום מוצלח נאשר את התיאום",
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
                <>
                  <p className="cat-fields-title">
                    בוחרים קטגוריה אחת
                    <RequiredFieldStar />
                  </p>
                  <div className="cat-grid">
                  {DONATION_JOURNEY_OPTIONS.map((opt) => {
                    const selected = flow.form.journeyType === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        className={cn("cat-btn", selected && "selected")}
                        aria-pressed={selected}
                        onClick={() => flow.updateField("journeyType", opt.id)}
                      >
                        <span className="cat-icon" aria-hidden>
                          {DONATION_JOURNEY_EMOJI[opt.id]}
                        </span>
                        <span className="cat-label">{opt.label}</span>
                      </button>
                    );
                  })}
                  </div>
                </>
              ) : null}

              {flow.stepIndex === 1 ? <div className="space-y-4">{regionSlotBlock}</div> : null}

              {flow.stepIndex === 2 ? <div className="space-y-4">{contactFieldsBlock}</div> : null}

              {flow.stepIndex === 3 ? (
                <DonationFormToyStep
                  journeyType={flow.form.journeyType}
                  childName={flow.form.childName}
                  onChildNameChange={(value) => flow.updateField("childName", value)}
                  toyItems={flow.form.toyItems}
                  isPickup={isPickup}
                  claudeChrome
                  showRequiredStars
                  fieldLabelClass={fieldLabelClass}
                  sectionSubClass={sectionSubClass}
                  inputClassName={cn(inputClassName)}
                  onUpdateToy={flow.updateToyItem}
                  onAddToy={flow.addToyItem}
                  onRemoveToy={flow.removeToyItem}
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
                <div className="payment-box space-y-4">
                  <div className="payment-amount">
                    <span className="pay-label">{PICKUP_FEE_LABEL}</span>
                    <span className="pay-price" dir="ltr">
                      ₪{PICKUP_FEE_ILS}
                    </span>
                  </div>
                  {paymentExtrasBlock}
                  <p className="secure-badge">תשלום מאובטח דרך Stripe · ללא שמירת פרטי כרטיס אצלנו</p>
                </div>
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
              <button
                type="button"
                className="btn-submit disabled:pointer-events-none disabled:opacity-60"
                disabled={checkoutLoading}
                onClick={() => runCheckout(flow.form)}
              >
                {checkoutLoading ? "מעבדים תשלום…" : `מעבר לתשלום מאובטח ₪${PICKUP_FEE_ILS}`}
              </button>
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
              נא למלא את שם הילד או הילדה ופרטים לכל פריט לפי המסלול שבחרתם, ואישור האיכות בשלב הסיכום
            </CardDescription>
          </>
        ) : null}

        {flow.stepIndex === 3 ? (
          <>
            <CardTitle className={cardTitleClass}>סיכום</CardTitle>
            <CardDescription className={cardDescClass}>
              נא לעבור על הפרטים, לאשר את מצב הפריטים ואת תנאי השירות, לפני מעבר לתשלום {PICKUP_FEE_LABEL}
            </CardDescription>
          </>
        ) : null}

        {flow.stepIndex === 4 ? (
          <>
            <CardTitle className={cardTitleClass}>תשלום מאובטח</CardTitle>
            <CardDescription className={cardDescClass}>
              הסכום כולל שינוע ואיסוף עד הבית ומכתב AI לילד המקבל לאחר תשלום מוצלח נאשר את התיאום הסופי
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
          <DonationFormToyStep
            journeyType={flow.form.journeyType}
            childName={flow.form.childName}
            onChildNameChange={(value) => flow.updateField("childName", value)}
            toyItems={flow.form.toyItems}
            isPickup={isPickup}
            showRequiredStars
            fieldLabelClass={fieldLabelClass}
            sectionSubClass={sectionSubClass}
            inputClassName={cn(inputClassName)}
            onUpdateToy={flow.updateToyItem}
            onAddToy={flow.addToyItem}
            onRemoveToy={flow.removeToyItem}
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
          <div className="space-y-4 rounded-2xl border border-violet-100 bg-violet-50/40 p-5 ps-5 pe-5">
            <p className={cn("font-semibold text-slate-900", isPickup ? "text-base" : "text-lg")}>{PICKUP_FEE_LABEL}</p>
            {paymentExtrasBlock}
          </div>
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
          <Button
            type="button"
            className={cn(
              "ms-auto text-white",
              PICKUP_PRIMARY,
              isPickup ? "min-h-12 rounded-2xl px-8 text-base" : "rounded-full px-8",
            )}
            disabled={checkoutLoading}
            onClick={() => runCheckout(flow.form)}
          >
            {checkoutLoading ? "מעבדים תשלום" : `מעבר לתשלום מאובטח ₪${PICKUP_FEE_ILS}`}
          </Button>
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
            המשך
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
