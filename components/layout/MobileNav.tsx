"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Film, Tv, Heart, Search, LogIn, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const allLinks = [
  { href: "/browse",  icon: Home,     label: "Home",    guestVisible: true  },
  { href: "/movies",  icon: Film,     label: "Movies",  guestVisible: true  },
  { href: "/tv",      icon: Tv,       label: "TV",      guestVisible: true  },
  { href: "/anime",   icon: Sparkles, label: "Anime",   guestVisible: true  },
  { href: "/search",  icon: Search,   label: "Search",  guestVisible: true  },
  { href: "/my-list", icon: Heart,    label: "My List", guestVisible: false },
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
    <nav
      className="fixed bottom-0 left-0 z-50 w-full md:hidden"
      style={{
        background: "rgba(var(--color-background, 12,10,8), 0.97)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderTop: "1px solid rgba(var(--theme-accent-rgb, 201,168,76), 0.1)",
      }}
    >
      <div className="flex items-center justify-around px-2 py-2 safe-area-inset-bottom">
        {links.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className="relative flex flex-col items-center gap-1 px-3 py-1.5 text-[10px] font-medium transition-all duration-200 rounded-xl min-w-[52px]"
              style={{
                color: isActive ? "var(--color-primary)" : "var(--color-muted-foreground)",
              }}
            >
              {isActive && (
                <motion.div
                  layoutId="mobile-nav-bg"
                  className="absolute inset-0 rounded-xl"
                  style={{ background: "rgba(var(--theme-accent-rgb), 0.1)" }}
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <Icon
                className="relative h-5 w-5"
                style={{
                  filter: isActive
                    ? "drop-shadow(0 0 6px rgba(var(--theme-accent-rgb), 0.7))"
                    : undefined,
                }}
              />
              <span className="relative">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
