"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import type { CheckoutSuccessPayload } from "@/hooks/use-donation-checkout";

const NEXT_PATH = "/account/dashboard?tab=orders";

/**
 * אחרי שמירת בקשת איסוף: הפניה להתחברות OTP ואז ללשונית ההזמנות
 */
export function PostCheckoutPortalRedirect({
  checkoutSuccess,
  enabled,
}: {
  checkoutSuccess: CheckoutSuccessPayload | null;
  enabled: boolean;
}) {
  const router = useRouter();
  const didRedirect = useRef(false);

  useEffect(() => {
    if (!enabled || !checkoutSuccess || didRedirect.current) return;
    didRedirect.current = true;
    const next = encodeURIComponent(NEXT_PATH);
    const t = window.setTimeout(() => {
      router.replace(`/account/login?next=${next}&from=checkout`);
    }, 1200);
    return () => window.clearTimeout(t);
  }, [enabled, checkoutSuccess, router]);

  return null;
}
