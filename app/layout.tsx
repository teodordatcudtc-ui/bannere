import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";
import { I18nProvider } from "@/lib/i18n/context";
import { Locale } from "@/lib/i18n";
import { LocaleDetector } from "@/components/locale-detector";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Bannerly - Generează Bannere cu AI și Programează-le Automat pe Social Media",
  description: "Generează bannere profesionale cu AI folosind brand kit-ul tău și programează-le automat pe Facebook, Instagram, LinkedIn și TikTok. Economisește timp și creează conținut de calitate pentru rețelele tale sociale.",
  keywords: "bannere AI, generare bannere, programare social media, Facebook, Instagram, LinkedIn, TikTok, marketing digital, bannere publicitare",
  openGraph: {
    title: "Bannerly - Generează Bannere cu AI și Programează-le Automat",
    description: "Generează bannere profesionale cu AI și programează-le automat pe toate platformele de social media. Economisește timp și creează conținut de calitate.",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Get locale from cookie
  const cookieStore = await cookies()
  const localeCookie = cookieStore.get('NEXT_LOCALE')
  const locale: Locale = (localeCookie?.value === 'ro' || localeCookie?.value === 'en') 
    ? localeCookie.value 
    : 'en'

  return (
    <html lang={locale}>
      <body
        className={`${inter.variable} font-sans antialiased`}
      >
        <I18nProvider initialLocale={locale}>
          <LocaleDetector />
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}
