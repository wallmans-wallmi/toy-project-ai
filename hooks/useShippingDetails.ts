"use client";

import { useMemo, useState } from "react";
import type { DonationFormState } from "@/hooks/use-donation-form";
import { ISRAELI_CITIES, type IsraeliCity } from "@/lib/israeli-cities";

/** כשאין חיפוש — מציגים קודם ערים מבוקשות, ואז את השאר לפי סדר עברי */
const POPULAR_PICKUP_CITY_NAMES: readonly string[] = [
  "תל אביב — יפו",
  "ירושלים",
  "חיפה",
  "ראשון לציון",
  "פתח תקווה",
  "רמת גן",
  "חולון",
  "נתניה",
  "באר שבע",
  "אשדוד",
];

function rankPopularCity(name: string): number {
  const i = POPULAR_PICKUP_CITY_NAMES.indexOf(name);
  return i === -1 ? POPULAR_PICKUP_CITY_NAMES.length + 1 : i;
}

function sortCitiesPopularFirst(cities: IsraeliCity[]): IsraeliCity[] {
  return [...cities].sort((a, b) => {
    const ra = rankPopularCity(a.name);
    const rb = rankPopularCity(b.name);
    if (ra !== rb) return ra - rb;
    return a.name.localeCompare(b.name, "he");
  });
}

export type ShippingDetailsUpdater = <K extends keyof DonationFormState>(key: K, value: DonationFormState[K]) => void;

export function applyPickupDateTime(
  dateISO: string,
  slotId: string,
  updateField: ShippingDetailsUpdater,
) {
  updateField("pickupDate", dateISO);
  updateField("pickupSlotId", slotId);
}

/**
 * חיפוש עיר וסינון רשימת ערים לאיסוף (דף pickup).
 */
export function useShippingDetails() {
  const [cityQuery, setCityQuery] = useState("");

  const filteredCities = useMemo(() => {
    const q = cityQuery.trim();
    if (!q) return sortCitiesPopularFirst(ISRAELI_CITIES);
    return ISRAELI_CITIES.filter((c) => c.name.includes(q));
  }, [cityQuery]);

  const applyCitySelection = (city: IsraeliCity, updateField: ShippingDetailsUpdater) => {
    updateField("pickupCity", city.name);
    updateField("region", city.regionId);
    updateField("pickupSlotId", null);
    updateField("pickupDate", "");
  };

  return {
    cityQuery,
    setCityQuery,
    filteredCities,
    applyCitySelection,
  };
}
