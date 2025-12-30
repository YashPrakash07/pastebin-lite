import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "PasteBin Lite",
  description: "Share text securely with optional expiration and view limits.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-neutral-50 flex flex-col text-neutral-900`}
      >
        <header className="sticky top-0 z-50 w-full border-b border-neutral-200 bg-white/80 backdrop-blur-xl transition-all">
          <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-900">
                <span className="text-lg font-bold text-white">P</span>
              </div>
              <span className="text-lg font-bold tracking-tight text-neutral-900">
                Pastebin Lite
              </span>
            </div>
          </div>
        </header>

        <main className="flex-1 flex flex-col items-center justify-center py-12 sm:py-24">
          {children}
        </main>

        <footer className="border-t border-neutral-200 bg-white py-8">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 text-center sm:flex-row sm:px-6 sm:text-left lg:px-8">
            <p className="text-sm text-neutral-500">
              &copy; {new Date().getFullYear()} Pastebin Lite. Built for speed and security.
            </p>
            <div className="flex gap-6 text-sm font-medium text-neutral-600">
              <span className="cursor-pointer transition-colors hover:text-neutral-900">
                Privacy
              </span>
              <span className="cursor-pointer transition-colors hover:text-neutral-900">
                Terms
              </span>
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="cursor-pointer transition-colors hover:text-neutral-900"
              >
                GitHub
              </a>
            </div>
          </div>
        </footer>
        <Analytics />
      </body>
    </html>
  );
}
