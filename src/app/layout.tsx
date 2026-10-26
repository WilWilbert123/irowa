// src/app/layout.tsx
import type { Metadata, Viewport } from "next";
import { AppProviders } from "@/components/providers/app-providers";
import { AnnouncementBanner } from "@/components/notifications/announcement-banner";
import "./globals.css";

export const metadata: Metadata = {
  title: "IroWa — Irosin Water Resources Map",
  description:
    "Discover, share, and discuss verified water sources across Irosin, Sorsogon during El Niño, drought, and daily needs.",
  manifest: "/manifest.json",
  icons: {
    icon: "/images/irowa-logo.svg",
    apple: "/images/irowa-logo.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#0284c7",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="h-full">
      <body className="h-full w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased selection:bg-blue-500 selection:text-white flex flex-col overflow-hidden">
        <AppProviders>
          <div className="flex flex-col h-dvh w-full overflow-hidden">
            <AnnouncementBanner />
            <div className="flex-1 min-h-0 w-full overflow-hidden flex flex-col relative">
              {children}
            </div>
          </div>
        </AppProviders>
      </body>
    </html>
  );
}
