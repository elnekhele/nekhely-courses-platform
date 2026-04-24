import type { Metadata } from "next";
import { Tajawal, Cairo } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Toaster } from "@/components/ui/toaster";

const tajawal = Tajawal({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "700", "800"],
  variable: "--font-tajawal",
  display: "swap",
});

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["600", "700", "800"],
  variable: "--font-cairo",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "أكاديمية نَخِيلة - كورسات احترافية باللغة العربية",
    template: "%s | أكاديمية نَخِيلة",
  },
  description:
    "منصة تعليمية عربية متخصصة في بيع الكورسات والدبلومات الاحترافية في التصميم والموشن جرافيك وصناعة المحتوى والذكاء الاصطناعي.",
};

// Most pages in this app depend on either the database (course catalog,
// admin stats, cart) or the user session, so we render everything on
// demand. This also avoids needing a DATABASE_URL at build time.
export const dynamic = "force-dynamic";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" className={`${tajawal.variable} ${cairo.variable}`}>
      <body className="min-h-screen flex flex-col font-sans antialiased">
        <Providers>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
