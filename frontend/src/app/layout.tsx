import type { Metadata, Viewport } from "next";
import PWARegister from "@/components/PWARegister";
import Providers from "@/components/Providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "drCrop — Precision Plant Health",
  description:
    "The Living Laboratory: Diagnostic intelligence to cultivate vitality at scale. AI-powered plant disease detection and treatment protocols.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "drCrop",
  },
};

export const viewport: Viewport = {
  themeColor: "#1c6d25",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
    >
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-25..0&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-full flex flex-col font-body bg-surface text-on-surface">
        <PWARegister />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

