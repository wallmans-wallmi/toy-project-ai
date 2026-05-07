import { PortalShellHeader } from "@/components/portal/portal-shell-header";

export default function AccountDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PortalShellHeader />
      {children}
    </>
  );
}
