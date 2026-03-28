import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import PWARegister from "@/components/PWARegister";
import Providers from "@/components/Providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dr. Crop — Crop Disease Detection",
  description:
    "Friendly help for farmers: crop health checks, simple farming advice in English, Hindi, and Urdu.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Dr. Crop",
  },
};

export const viewport: Viewport = {
  themeColor: "#22c55e",
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className="min-h-full flex flex-col">
        <PWARegister />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
