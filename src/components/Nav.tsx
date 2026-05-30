"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Prehľad" },
  { href: "/lessons", label: "Lekcie" },
  { href: "/sandbox", label: "SQL sandbox" },
  { href: "/quiz", label: "Kvíz" },
  { href: "/flashcards", label: "Kartičky" },
  { href: "/progress", label: "Slabé miesta" },
];

export default function Nav() {
  const path = usePathname();
  const active = (href: string) =>
    href === "/" ? path === "/" : path.startsWith(href);

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl flex-wrap items-center gap-1 px-4 py-2.5">
        <Link href="/" className="mr-3 flex items-center gap-2 font-semibold text-slate-900">
          <span className="grid h-7 w-7 place-items-center rounded-md bg-brand-600 text-sm font-bold text-white">
            ⌘
          </span>
          <span>Príprava na Oracle SQL</span>
        </Link>
        <div className="flex flex-wrap items-center gap-1">
          {LINKS.slice(1).map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
                active(l.href)
                  ? "bg-brand-50 text-brand-700"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
