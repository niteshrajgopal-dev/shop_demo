import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, Instrument_Serif, Inter, Manrope, Young_Serif } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui/toast";
import { BeanSprite } from "@/components/brand/bean";
import { MarkSprite } from "@/components/brand/mark";
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
});

const youngSerif = Young_Serif({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-young-serif",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plex-mono",
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  variable: "--font-instrument-serif",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "QOS Storefront",
    template: "%s · QOS Storefront",
  },
  description: "Multi-tenant QOS storefront renderer.",
};

export const viewport: Viewport = {
  themeColor: "#FFF7ED",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${youngSerif.variable} ${plexMono.variable} ${instrumentSerif.variable} ${manrope.variable}`}
    >
      <body className="min-h-dvh">
        <ToastProvider>
          <BeanSprite />
          <MarkSprite />
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
