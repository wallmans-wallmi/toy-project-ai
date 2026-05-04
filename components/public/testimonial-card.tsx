import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

type TestimonialCardProps = {
  quote: string;
  authorName: string;
  authorDetail: string;
  avatarEmoji: string;
  avatarClassName: string;
};

export function TestimonialCard({
  quote,
  authorName,
  authorDetail,
  avatarEmoji,
  avatarClassName,
}: TestimonialCardProps) {
  return (
    <figure className="flex h-full flex-col rounded-3xl border border-white/70 bg-white/95 p-6 backdrop-blur-sm sm:p-8">
      <div className="flex gap-0.5 text-amber-400" aria-label="דירוג חמש כוכבים">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} className="size-5 fill-current" strokeWidth={0} aria-hidden />
        ))}
      </div>
      <blockquote className="mt-4 flex-1 text-pretty text-base italic leading-relaxed text-slate-700">
        &ldquo;{quote}&rdquo;
      </blockquote>
      <figcaption className="mt-6 flex items-center gap-3 border-t border-slate-100 pt-5">
        <span
          className={cn(
            "flex size-12 items-center justify-center rounded-full text-2xl",
            avatarClassName,
          )}
          aria-hidden
        >
          {avatarEmoji}
        </span>
        <div className="text-start">
          <cite className="not-italic font-semibold text-slate-900">{authorName}</cite>
          <p className="text-sm text-slate-500">{authorDetail}</p>
        </div>
      </figcaption>
    </figure>
  );
}
