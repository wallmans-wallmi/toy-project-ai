export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-[#F9F5FF]" dir="rtl" lang="he">
      {children}
    </div>
  );
}
