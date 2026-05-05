"use client";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

type PasswordFieldProps = Omit<React.ComponentProps<typeof Input>, "type">;

export function PasswordField({ className, disabled, ...rest }: PasswordFieldProps) {
  const [show, setShow] = useState(false);

  return (
    <div className="relative" dir="rtl">
      <Input type={show ? "text" : "password"} disabled={disabled} className={cn("pe-10", className)} {...rest} />
      <button
        type="button"
        tabIndex={-1}
        disabled={disabled}
        className="absolute end-2 top-1/2 z-10 -translate-y-1/2 rounded-md p-1 text-[#9333EA] hover:bg-[#9333EA]/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#9333EA] disabled:opacity-40"
        onClick={() => setShow((v) => !v)}
        aria-label={show ? "הסתר סיסמה" : "הצג סיסמה"}
      >
        {show ? <EyeOff className="size-4" aria-hidden /> : <Eye className="size-4" aria-hidden />}
      </button>
    </div>
  );
}
