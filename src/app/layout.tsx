import type { Metadata } from "next";
import "./globals.css";
import Nav from "@/components/Nav";
import { ProgressProvider } from "@/lib/progress";
import { Analytics } from "@vercel/analytics/next"

export const metadata: Metadata = {
  title: "Príprava na skúšku z Oracle SQL",
  description:
    "Lekcie, živý SQL sandbox, skúškové kvízy, kartičky a sledovanie slabých miest pre univerzitnú skúšku z Oracle SQL.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ProgressProvider>
          <Nav />
          <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
          <footer className="mx-auto max-w-6xl px-4 py-8 text-center text-xs text-slate-400">
            Príprava na skúšku z Oracle SQL · postup sa ukladá lokálne v prehliadači
          </footer>
        </ProgressProvider>
      </body>
        <Analytics />
    </html>
  );
}
