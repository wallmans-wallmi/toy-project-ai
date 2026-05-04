import { formatPickupDayLabelFromISO, toLocalISODate } from "@/lib/shipping-calendar";

const TIME_RANGE = "12:00-14:00";

function startOfLocalDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

/** יום שני הקרוב מהתאריך המקומי (כולל היום אם היום שני) */
export function nextMondayOnOrAfter(ref: Date): Date {
  const base = startOfLocalDay(ref);
  const day = base.getDay();
  const daysToMon = day === 1 ? 0 : (8 - day) % 7;
  return addDays(base, daysToMon);
}

export type MonThuPickupPair = {
  mon: { iso: string; line: string; date: Date };
  thu: { iso: string; line: string; date: Date };
};

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

/** weekOffset 0 = זוג שני–חמישי הקרוב; 1 = שבוע אחרי */
export function getPickupMonThuForWeekOffset(weekOffset: 0 | 1): MonThuPickupPair {
  const mon = addDays(nextMondayOnOrAfter(new Date()), weekOffset * 7);
  const thu = addDays(mon, 3);
  const fmtLine = (d: Date, hebDay: string) => {
    const dd = pad2(d.getDate());
    const mm = pad2(d.getMonth() + 1);
    return `${hebDay} (${dd}.${mm}) ${TIME_RANGE}`;
  };
  return {
    mon: {
      iso: toLocalISODate(mon),
      line: fmtLine(mon, "יום שני"),
      date: mon,
    },
    thu: {
      iso: toLocalISODate(thu),
      line: fmtLine(thu, "יום חמישי"),
      date: thu,
    },
  };
}

/** תווית אחת לשדה הסיכום / כפתור הפתיחה */
export function formatPickupTimeSummaryLine(
  pickupDateIso: string,
  pickupSlotId: string | null,
  slotLabelFallback: string,
): string {
  const d = pickupDateIso.trim();
  if (!d || !pickupSlotId) return "";
  const tail = pickupSlotId.split("_").pop();
  const pair0 = getPickupMonThuForWeekOffset(0);
  const pair1 = getPickupMonThuForWeekOffset(1);
  if (tail === "mon_1214") {
    if (d === pair0.mon.iso) return pair0.mon.line;
    if (d === pair1.mon.iso) return pair1.mon.line;
    return `יום שני · 12:00-14:00 · ${formatPickupDayLabelFromISO(d)}`;
  }
  if (tail === "thu_1214") {
    if (d === pair0.thu.iso) return pair0.thu.line;
    if (d === pair1.thu.iso) return pair1.thu.line;
    return `יום חמישי · 12:00-14:00 · ${formatPickupDayLabelFromISO(d)}`;
  }
  if (slotLabelFallback && d) return `${slotLabelFallback} · ${formatPickupDayLabelFromISO(d)}`;
  return slotLabelFallback || d;
}
