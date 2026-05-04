import { ClaudeBackgroundBlobs } from "@/components/public/claude-background-blobs";
import { ClaudeFooter } from "@/components/public/claude-footer";
import { ClaudeMobileCta } from "@/components/public/claude-mobile-cta";
import { ClaudeNav } from "@/components/public/claude-nav";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-dvh">
      <ClaudeBackgroundBlobs />
      <ClaudeNav />
      <main
        id="main-content"
        tabIndex={-1}
        className="relative z-[1] flex-1 public-main-mobile-pad"
      >
        {children}
      </main>
      <ClaudeFooter />
      <ClaudeMobileCta />
    </div>
  );
}
