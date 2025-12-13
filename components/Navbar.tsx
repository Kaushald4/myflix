"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Tv, List, Film, Download } from "lucide-react";
import { cn } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();

  const links = [
    { href: "/movies", label: "Movies", icon: Film },
    { href: "/series", label: "TV Shows", icon: Tv },
    { href: "/watchlist", label: "Watchlist", icon: List },
    { href: "/downloads", label: "My Downloads", icon: Download },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 hidden md:block">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <div className="shrink-0">
            <Link
              href="/"
              className="text-2xl font-black tracking-tighter neon-text bg-clip-text text-transparent bg-linear-to-r from-white to-white/50"
            >
              MYFLIX
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {links.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2",
                      isActive
                        ? "bg-primary/20 text-primary shadow-[0_0_15px_rgba(var(--primary),0.5)] border border-primary/50"
                        : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                    )}
                  >
                    <link.icon className="w-4 h-4" />
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Glass Background Gradient */}
      <div className="absolute inset-0 -z-10 bg-background/60 backdrop-blur-xl border-b border-white/5" />
    </nav>
  );
}
