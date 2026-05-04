import { cn } from "@/lib/utils";

type PickupDoorNoticeProps = {
  className?: string;
};

export function PickupDoorNotice({ className }: PickupDoorNoticeProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-violet-200/80 bg-violet-50/90 py-3 text-start ps-4 pe-4",
        className,
      )}
      role="status"
    >
      <p className="text-xs font-bold text-violet-950">לידיעתכם</p>
      <p className="mt-1 text-xs leading-relaxed text-violet-900/90">
        אין צורך לשהות בבית בזמן האיסוף - ניתן להשאיר את המארז מחוץ לדלת באחריותכם
      </p>
    </div>
  );
}
