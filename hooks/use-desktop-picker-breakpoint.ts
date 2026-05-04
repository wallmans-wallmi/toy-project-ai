"use client";

import { useSyncExternalStore } from "react";

/** תואם Tailwind `min-[769px]` — פופאובר שולחן עבודה מול מגירת מובייל */
const MEDIA_QUERY = "(min-width: 769px)";

export function useIsDesktopPicker(): boolean {
  return useSyncExternalStore(
    (onStoreChange) => {
      const mq = window.matchMedia(MEDIA_QUERY);
      mq.addEventListener("change", onStoreChange);
      return () => mq.removeEventListener("change", onStoreChange);
    },
    () => window.matchMedia(MEDIA_QUERY).matches,
    () => false,
  );
}
