"use client";

import type { ReactNode } from "react";
import { RequiredFieldStar } from "@/components/public/donation-form-progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export type DonationQuantityFieldProps = {
  id: string;
  label: ReactNode;
  value: string;
  onChange: (digitsOnly: string) => void;
  placeholder?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  fieldLabelClass: string;
  sectionSubClass: string;
  inputClassName: string;
  isPickup?: boolean;
};

/** שדה כמות מספרית — RTL, נגיש */
export function DonationQuantityField({
  id,
  label,
  value,
  onChange,
  placeholder = "למשל 3",
  hint,
  error,
  required,
  fieldLabelClass,
  sectionSubClass,
  inputClassName,
  isPickup,
}: DonationQuantityFieldProps) {
  const describedBy = [hint ? `${id}-hint` : null, error ? `${id}-err` : null].filter(Boolean).join(" ") || undefined;

  return (
    <div className={cn("space-y-2", isPickup && "field-group")}>
      <Label htmlFor={id} className={fieldLabelClass}>
        {label}
        {required ? <RequiredFieldStar /> : null}
      </Label>
      <Input
        id={id}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        dir="ltr"
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
        className={cn(
          inputClassName,
          isPickup && "pickup-native-field pickup-field-ltr",
          error && "border-red-400 focus-visible:border-red-500",
        )}
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, ""))}
        placeholder={placeholder}
      />
      {hint ? (
        <p id={`${id}-hint`} className={sectionSubClass}>
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-err`} className="text-sm font-medium text-red-700" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
