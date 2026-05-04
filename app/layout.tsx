import type { Metadata } from "next";
import { Heebo, Rubik } from "next/font/google";
import "./globals.css";
import "./styles/nifradim-claude.css";
import { SkipToMainLink } from "@/components/public/skip-to-main-link";
import { AccessibilityMenu } from "@/components/ui/accessibility-menu";
import { cn } from "@/lib/utils";

const rubik = Rubik({
  subsets: ["hebrew", "latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-rubik",
  display: "swap",
  adjustFontFallback: true,
});

const heebo = Heebo({
  subsets: ["hebrew", "latin"],
  weight: ["300", "400", "500", "700", "800"],
  variable: "--font-heebo",
  display: "swap",
  adjustFontFallback: true,
});

export const metadata: Metadata = {
  title: {
    default: "נפרדים בחיוך",
    template: "%s · נפרדים בחיוך",
  },
  description:
    "תורמים צעצועים בדרך חמה ופשוטה, ונותנים לילדים אחרים להמשיך לחייך.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl" className={cn("theme", rubik.variable, heebo.variable)}>
      <body className="min-h-dvh antialiased">
        <SkipToMainLink />
        {children}
        <AccessibilityMenu />
      </body>
    </html>
  );
}
