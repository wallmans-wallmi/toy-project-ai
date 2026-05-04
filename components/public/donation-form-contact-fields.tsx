"use client";

import { RequiredFieldStar } from "@/components/public/donation-form-progress";
import type { DonationFormState } from "@/hooks/use-donation-form";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type FieldUpdater = <K extends keyof DonationFormState>(key: K, value: DonationFormState[K]) => void;

export type DonationFormContactFieldsProps = {
  form: DonationFormState;
  pickupSplitSteps: boolean;
  fieldLabelClass: string;
  sectionSubClass: string;
  inputClassName: string;
  textareaClassName: string;
  isPickup: boolean;
  updateField: FieldUpdater;
};

export function DonationFormContactFields({
  form,
  pickupSplitSteps,
  fieldLabelClass,
  sectionSubClass,
  inputClassName,
  textareaClassName,
  isPickup,
  updateField,
}: DonationFormContactFieldsProps) {
  return (
    <>
      <div className={cn("grid gap-4", pickupSplitSteps ? "field-row" : "sm:grid-cols-2")}>
        <div className={cn("space-y-2", pickupSplitSteps && "field-group")}>
          <Label htmlFor="firstName" className={fieldLabelClass}>
            שם פרטי
            <RequiredFieldStar />
          </Label>
          <Input
            id="firstName"
            className={cn(inputClassName, pickupSplitSteps && "pickup-native-field")}
            value={form.firstName}
            onChange={(e) => updateField("firstName", e.target.value)}
            placeholder="למשל יעל"
            autoComplete="given-name"
          />
        </div>
        <div className={cn("space-y-2", pickupSplitSteps && "field-group")}>
          <Label htmlFor="lastName" className={fieldLabelClass}>
            שם משפחה
            <RequiredFieldStar />
          </Label>
          <Input
            id="lastName"
            className={cn(inputClassName, pickupSplitSteps && "pickup-native-field")}
            value={form.lastName}
            onChange={(e) => updateField("lastName", e.target.value)}
            placeholder="למשל כהן"
            autoComplete="family-name"
          />
        </div>
      </div>
      <div className={cn("space-y-2", pickupSplitSteps && "field-group")}>
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
            pickupSplitSteps ? "pickup-native-field pickup-field-ltr" : "text-end",
          )}
          value={form.phone}
          onChange={(e) => updateField("phone", e.target.value)}
          placeholder="0500000000"
          autoComplete="tel"
        />
      </div>
      <div className={cn("space-y-2", pickupSplitSteps && "field-group")}>
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
            pickupSplitSteps ? "pickup-native-field pickup-field-ltr" : "text-end",
          )}
          value={form.email}
          onChange={(e) => updateField("email", e.target.value)}
          placeholder="הזינו כתובת מייל פעילה"
          autoComplete="email"
        />
        <p className={sectionSubClass}>עדכונים על האיסוף והתשלום בלבד ללא דיוור פרסומי</p>
      </div>
      <div className={cn("space-y-2", pickupSplitSteps && "field-group")}>
        <Label htmlFor="streetName" className={fieldLabelClass}>
          שם רחוב
          <RequiredFieldStar />
        </Label>
        <Input
          id="streetName"
          className={cn(inputClassName, pickupSplitSteps && "pickup-native-field")}
          value={form.streetName}
          onChange={(e) => updateField("streetName", e.target.value)}
          placeholder="למשל רחוב הרצל"
          autoComplete="street-address"
        />
      </div>
      <div className={cn("grid gap-4", pickupSplitSteps ? "field-row" : "sm:grid-cols-2")}>
        <div className={cn("space-y-2", pickupSplitSteps && "field-group")}>
          <Label htmlFor="houseNumber" className={fieldLabelClass}>
            מספר בית
            <RequiredFieldStar />
          </Label>
          <Input
            id="houseNumber"
            className={cn(inputClassName, pickupSplitSteps && "pickup-native-field pickup-field-ltr")}
            dir="ltr"
            value={form.houseNumber}
            onChange={(e) => updateField("houseNumber", e.target.value)}
            placeholder="למשל 12"
            autoComplete="off"
          />
        </div>
        <div className={cn("space-y-2", pickupSplitSteps && "field-group")}>
          <Label htmlFor="apartmentNumber" className={fieldLabelClass}>
            מספר דירה
          </Label>
          <Input
            id="apartmentNumber"
            className={cn(inputClassName, pickupSplitSteps && "pickup-native-field pickup-field-ltr")}
            dir="ltr"
            value={form.apartmentNumber}
            onChange={(e) => updateField("apartmentNumber", e.target.value)}
            placeholder="למשל 4"
            autoComplete="off"
          />
        </div>
      </div>
      <div className={cn("grid gap-4", pickupSplitSteps ? "field-row" : "sm:grid-cols-2")}>
        <div className={cn("space-y-2", pickupSplitSteps && "field-group")}>
          <Label htmlFor="floor" className={fieldLabelClass}>
            קומה
          </Label>
          <Input
            id="floor"
            className={cn(inputClassName, pickupSplitSteps && "pickup-native-field pickup-field-ltr")}
            dir="ltr"
            value={form.floor}
            onChange={(e) => updateField("floor", e.target.value)}
            placeholder="למשל 2"
            autoComplete="off"
          />
        </div>
        <div className={cn("space-y-2", pickupSplitSteps && "field-group")}>
          <Label htmlFor="doorCode" className={fieldLabelClass}>
            קוד כניסה
          </Label>
          <Input
            id="doorCode"
            className={cn(inputClassName, pickupSplitSteps && "pickup-native-field pickup-field-ltr")}
            dir="ltr"
            value={form.doorCode}
            onChange={(e) => updateField("doorCode", e.target.value)}
            placeholder="למשל #1234"
            autoComplete="off"
          />
        </div>
      </div>
      <div className={cn("space-y-2", pickupSplitSteps && "field-group")}>
        <Label htmlFor="addressNotes" className={fieldLabelClass}>
          הערות נוספות לכתובת
        </Label>
        <Textarea
          id="addressNotes"
          className={cn(textareaClassName, pickupSplitSteps && "pickup-native-field")}
          value={form.addressNotes}
          onChange={(e) => updateField("addressNotes", e.target.value)}
          placeholder="חניה הוראות הגעה פרטים נוספים לצוות האיסוף"
          rows={isPickup ? 4 : 3}
        />
      </div>
    </>
  );
}
