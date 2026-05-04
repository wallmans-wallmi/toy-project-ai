"use client";

import { RequiredFieldStar } from "@/components/public/donation-form-progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { journeyItemNamePlaceholder, journeyItemsStepHint } from "@/lib/donation-journey";
import type { ToyItemRow } from "@/lib/toy-donation";
import { TOY_SIZE_OPTIONS } from "@/lib/toy-donation";
import { cn } from "@/lib/utils";

type DonationFormToyStepProps = {
  journeyType: string;
  childName: string;
  onChildNameChange: (value: string) => void;
  toyItems: ToyItemRow[];
  isPickup: boolean;
  /** כרטיסי צעצוע / צ׳יפים כמו ב־HTML v2 */
  claudeChrome?: boolean;
  /** כוכבית ליד שדות חובה (שם ילד, שם פריט, צבע, גודל) */
  showRequiredStars?: boolean;
  fieldLabelClass: string;
  sectionSubClass: string;
  inputClassName: string;
  onUpdateToy: (id: string, patch: Partial<Omit<ToyItemRow, "id">>) => void;
  onAddToy: () => void;
  onRemoveToy: (id: string) => void;
};

export function DonationFormToyStep({
  journeyType,
  childName,
  onChildNameChange,
  toyItems,
  isPickup,
  claudeChrome = false,
  showRequiredStars = false,
  fieldLabelClass,
  sectionSubClass,
  inputClassName,
  onUpdateToy,
  onAddToy,
  onRemoveToy,
}: DonationFormToyStepProps) {
  const sizeBtnClass = (selected: boolean) =>
    cn(
      "min-h-12 flex-1 rounded-2xl border-2 text-base font-semibold transition-colors",
      selected
        ? "border-[#9333EA] bg-[#9333EA] text-white"
        : "border-slate-200 bg-white text-slate-800 hover:border-violet-300",
    );

  const sizeChipClass = (selected: boolean) =>
    cn("size-chip", selected && "selected");

  const namePlaceholder = journeyItemNamePlaceholder(journeyType);
  const hint = journeyItemsStepHint(journeyType);

  const childInputClass = claudeChrome ? "pickup-native-field" : inputClassName;
  const itemInputClass = claudeChrome ? "pickup-native-field" : inputClassName;

  return (
    <div className="space-y-6">
      <div className={cn("space-y-2", claudeChrome && "field-group")}>
        <Label htmlFor="donation-child-name" className={fieldLabelClass}>
          שם הילד או הילדה
          {showRequiredStars ? <RequiredFieldStar /> : null}
        </Label>
        <Input
          id="donation-child-name"
          className={childInputClass}
          value={childName}
          onChange={(e) => onChildNameChange(e.target.value)}
          placeholder="למשל נועם או שירה"
          autoComplete="off"
        />
      </div>

      {hint ? <p className={sectionSubClass}>{hint}</p> : null}

      <div className="space-y-5">
        {toyItems.map((item, index) => (
          <div
            key={item.id}
            className={cn(
              claudeChrome
                ? "toy-row"
                : cn(
                    "rounded-2xl border border-slate-200 bg-slate-50/40 p-4 ps-4 pe-4 sm:p-5",
                    isPickup && "rounded-3xl",
                  ),
            )}
          >
            <div
              className={cn(
                "mb-4 flex flex-wrap items-center justify-between gap-2",
                claudeChrome && "toy-row-header mb-2.5",
              )}
            >
              <p className={cn("text-sm font-bold text-slate-900", claudeChrome && "toy-row-title")}>
                פריט {index + 1}
              </p>
              {claudeChrome ? (
                <button
                  type="button"
                  className="toy-row-remove"
                  disabled={toyItems.length <= 1}
                  aria-label="הסרת פריט"
                  onClick={() => onRemoveToy(item.id)}
                >
                  ×
                </button>
              ) : (
                <Button
                  type="button"
                  variant="ghost"
                  className={cn(
                    "min-h-11 rounded-xl text-red-700 hover:bg-red-50 hover:text-red-800",
                    toyItems.length <= 1 && "pointer-events-none opacity-40",
                  )}
                  disabled={toyItems.length <= 1}
                  onClick={() => onRemoveToy(item.id)}
                >
                  הסרה
                </Button>
              )}
            </div>

            <div className="space-y-4">
              <div className={cn("space-y-2", claudeChrome && "field-group")}>
                <Label htmlFor={`item-name-${item.id}`} className={fieldLabelClass}>
                  שם הפריט
                  {showRequiredStars ? <RequiredFieldStar /> : null}
                </Label>
                <Input
                  id={`item-name-${item.id}`}
                  className={itemInputClass}
                  value={item.name}
                  onChange={(e) => onUpdateToy(item.id, { name: e.target.value })}
                  placeholder={namePlaceholder}
                  autoComplete="off"
                />
              </div>
              <div className={cn("space-y-2", claudeChrome && "field-group")}>
                <Label htmlFor={`item-color-${item.id}`} className={fieldLabelClass}>
                  צבע
                  {showRequiredStars ? <RequiredFieldStar /> : null}
                </Label>
                <Input
                  id={`item-color-${item.id}`}
                  className={itemInputClass}
                  value={item.color}
                  onChange={(e) => onUpdateToy(item.id, { color: e.target.value })}
                  placeholder="למשל תכלת"
                  autoComplete="off"
                />
              </div>
              <fieldset className={cn("space-y-2", !claudeChrome && "space-y-2")}>
                <legend className={cn(fieldLabelClass, "mb-1 w-full")}>
                  גודל
                  {showRequiredStars ? <RequiredFieldStar /> : null}
                </legend>
                <div
                  className={cn(
                    "flex w-full gap-2",
                    claudeChrome && "size-chips mt-1",
                  )}
                  role="group"
                  aria-label="גודל הפריט"
                >
                  {TOY_SIZE_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      className={claudeChrome ? sizeChipClass(item.size === opt.id) : sizeBtnClass(item.size === opt.id)}
                      onClick={() => onUpdateToy(item.id, { size: opt.id })}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </fieldset>
            </div>
          </div>
        ))}
      </div>

      {claudeChrome ? (
        <button type="button" className="add-toy-btn" onClick={onAddToy}>
          + הוספת פריט נוסף
        </button>
      ) : (
        <Button
          type="button"
          variant="outline"
          className={cn(
            "w-full border-violet-200 text-[#9333EA] hover:bg-violet-50",
            isPickup ? "min-h-12 rounded-2xl text-base font-semibold" : "min-h-11 rounded-xl",
          )}
          onClick={onAddToy}
        >
          הוספת פריט
        </Button>
      )}
    </div>
  );
}
