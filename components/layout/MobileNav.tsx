"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Film, Tv, Heart, Search } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/browse", icon: Home, label: "Home" },
  { href: "/movies", icon: Film, label: "Movies" },
  { href: "/tv", icon: Tv, label: "TV" },
  { href: "/search", icon: Search, label: "Search" },
  { href: "/my-list", icon: Heart, label: "My List" },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 z-50 w-full border-t border-border bg-background/95 backdrop-blur-sm md:hidden">
      <div className="flex items-center justify-around py-2">
        {links.map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex flex-col items-center gap-1 px-3 py-1 text-xs transition-colors",
              pathname === href ? "text-primary" : "text-muted-foreground"
            )}
          >
            <Icon className="h-5 w-5" />
            {label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
