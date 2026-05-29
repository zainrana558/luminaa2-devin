"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Film, Tv, Heart, Search, LogIn } from "lucide-react";
import { cn } from "@/lib/utils";

const allLinks = [
  { href: "/browse", icon: Home, label: "Home", guestVisible: true },
  { href: "/movies", icon: Film, label: "Movies", guestVisible: true },
  { href: "/tv", icon: Tv, label: "TV", guestVisible: true },
  { href: "/search", icon: Search, label: "Search", guestVisible: true },
  { href: "/my-list", icon: Heart, label: "My List", guestVisible: false },
];

interface MobileNavProps {
  isGuest?: boolean;
}

export default function MobileNav({ isGuest = false }: MobileNavProps) {
  const pathname = usePathname();

  const links = isGuest
    ? [...allLinks.filter((l) => l.guestVisible), { href: "/login", icon: LogIn, label: "Sign In", guestVisible: true }]
    : allLinks;

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
