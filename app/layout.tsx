import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import ThemeSync from "@/components/ThemeSync";
import AuthenticatedApiBridge from "@/components/AuthenticatedApiBridge";
import "./globals.css";
import "katex/dist/katex.min.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Theon AI — Your intelligent workspace",
  description: "Theon AI is a powerful AI assistant and study workspace for thinking, learning, researching, creating, and solving problems.",
  applicationName: "Theon AI",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  colorScheme: "dark light",
  themeColor: "#07070A",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#07070a]">
        <ThemeSync />
        <AuthenticatedApiBridge />
        <div className="theon-app-shell min-h-[100dvh] flex-1">{children}</div>
        <Analytics />
      </body>
    </html>
  );
}
