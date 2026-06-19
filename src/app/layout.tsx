import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import "./globals.css";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { SessionProviderWrapper } from "@/components/auth/session-provider";
import { CartProvider } from "@/context/cart-context";
import { ToastProvider } from "@/context/toast-context";
import { LocaleProvider } from "@/context/locale-context";
import { Navbar } from "@/components/layout/navbar";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { CartToastBridge } from "@/components/cart/cart-toast-bridge";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "HerbRx — Trusted Herbal Health for Nigerians",
    template: "%s | HerbRx",
  },
  description:
    "HerbRx combines time-tested herbal wisdom with modern research to deliver safe, effective natural remedies for Nigerians.",
  keywords: [
    "herbal",
    "Nigeria",
    "NAFDAC",
    "natural remedies",
    "wellness",
    "herbal safety",
  ],
  authors: [{ name: "HerbRx" }],
  creator: "HerbRx",
  openGraph: {
    type: "website",
    locale: "en_NG",
    url: "https://herbrx.ng",
    siteName: "HerbRx",
    title: "HerbRx — Trusted Herbal Health for Nigerians",
    description:
      "Science-backed safety reviews, expert consultations, and verified natural products — made for Nigerians.",
  },
  twitter: {
    card: "summary_large_image",
    title: "HerbRx — Trusted Herbal Health for Nigerians",
    description: "Science-backed herbal wellness for Nigerians.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  return (
    <html lang="en" className={`${cormorant.variable} ${dmSans.variable}`}>
      <body className="font-sans antialiased">
        <SessionProviderWrapper session={session}>
          <LocaleProvider>
            <ToastProvider>
              <CartProvider>
                <Navbar />
                <CartDrawer />
                <CartToastBridge />
                <main>{children}</main>
              </CartProvider>
            </ToastProvider>
          </LocaleProvider>
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
