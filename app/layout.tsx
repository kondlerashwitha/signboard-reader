import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { CosmicAnalyticsProvider } from "cosmic-analytics";

const primaryFont = Geist({
  weight: ["400", "600", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SignBoard Reader",
  description:
    "Assistive web app that reads signboard text aloud. Camera capture, clap activation, OCR in English/Hindi/Telugu, and text‑to‑speech.",
  metadataBase: new URL("https://example.com"),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={primaryFont.className}>
      <body className="antialiased">
        <main className="min-h-screen">
          <CosmicAnalyticsProvider>{children}</CosmicAnalyticsProvider>
        </main>
      </body>
    </html>
  );
}
