"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  Search, Bell, User, LogOut, LogIn, ChevronDown,
  Home, Film, Tv, Sparkles, Heart, Clock, Menu, X, Bookmark,
  Zap, Skull, Smile, Rocket, BookHeart,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavScroll } from "@/hooks/useNavScroll";
import LuminaaLogo from "@/components/ui/LuminaaLogo";
import ThemeSwitcher from "@/components/ui/ThemeSwitcher";

interface NavbarProps {
  isGuest?: boolean;
}

const NAV_LINKS = [
  { href: "/browse",  label: "Home",    icon: Home,      color: "var(--color-primary)" },
  { href: "/movies",  label: "Movies",  icon: Film,      color: "var(--color-primary)" },
  { href: "/tv",      label: "TV",      icon: Tv,        color: "var(--color-primary)" },
  { href: "/anime",   label: "Anime",   icon: Sparkles,  color: "var(--color-primary)" },
  { href: "/horror",  label: "Horror",  icon: Skull,     color: "var(--color-primary)" },
  { href: "/action",  label: "Action",  icon: Zap,       color: "var(--color-primary)" },
  { href: "/romance", label: "Romance", icon: BookHeart, color: "var(--color-primary)" },
  { href: "/cartoon", label: "Cartoon", icon: Smile,     color: "var(--color-primary)" },
  { href: "/scifi",   label: "Sci-Fi",  icon: Rocket,    color: "var(--color-primary)" },
];

const SIDEBAR_LINKS = [
  { href: "/browse",   label: "Home",       icon: Home     },
  { href: "/movies",   label: "Movies",     icon: Film     },
  { href: "/tv",       label: "TV Shows",   icon: Tv       },
  { href: "/anime",    label: "Anime",      icon: Sparkles },
  { href: "/horror",   label: "Horror",     icon: Skull    },
  { href: "/action",   label: "Action",     icon: Zap      },
  { href: "/romance",  label: "Romance",    icon: BookHeart},
  { href: "/cartoon",  label: "Cartoon",    icon: Smile    },
  { href: "/scifi",    label: "Sci-Fi",     icon: Rocket   },
  { href: "/my-list",  label: "My List",    icon: Heart    },
  { href: "/history",  label: "History",    icon: Clock    },
  { href: "/search",   label: "Search",     icon: Search   },
];

export default function Navbar({ isGuest = false }: NavbarProps) {
  const [searchOpen, setSearchOpen]   = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [menuOpen, setMenuOpen]       = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const scrolled  = useNavScroll();
  const router    = useRouter();
  const pathname  = usePathname();

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  }

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <>
      {/* ── Top Navbar ─────────────────────────────────────────────────── */}
      <nav
        className="fixed top-0 w-full z-[100] transition-all duration-300 ease-out"
        style={{
          height: "64px",
          background: scrolled
            ? "rgba(var(--color-background, 12,10,8), 0.97)"
            : "transparent",
          borderBottom: scrolled
            ? "1px solid rgba(var(--theme-accent-rgb, 201,168,76), 0.08)"
            : "none",
          backdropFilter: scrolled ? "blur(16px)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(16px)" : "none",
        }}
      >
        <div className="flex h-full items-center justify-between px-4 md:px-8 gap-4">
          {/* Left: Hamburger + Logo + Nav Links */}
          <div className="flex items-center gap-4 min-w-0">
            {/* Sidebar toggle */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="flex-shrink-0 rounded-full p-2 transition-all duration-200 hover:bg-white/8 active:scale-90"
              aria-label="Open menu"
              style={{ color: "var(--color-muted-foreground)" }}
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Logo */}
            <Link href="/browse" className="flex-shrink-0">
              <LuminaaLogo size="md" />
            </Link>

            {/* Desktop nav links */}
            <div className="hidden items-center xl:flex gap-1 ml-2">
              {NAV_LINKS.slice(0, 7).map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="relative px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200"
                  style={{
                    color:
                      pathname === href
                        ? "var(--color-primary)"
                        : "var(--color-muted-foreground)",
                  }}
                >
                  {label}
                  {pathname === href && (
                    <motion.span
                      layoutId="nav-indicator"
                      className="absolute inset-0 rounded-full"
                      style={{
                        background: "rgba(var(--theme-accent-rgb), 0.1)",
                        border: "1px solid rgba(var(--theme-accent-rgb), 0.2)",
                      }}
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              ))}
            </div>
          </div>

          {/* Right: Search + ThemeSwitcher + Notifications + Profile */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <ThemeSwitcher />

            {searchOpen ? (
              <form onSubmit={handleSearch} className="flex items-center">
                <Input
                  type="text"
                  placeholder="Titles, people, genres"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-48 md:w-64 h-8 text-sm rounded-full"
                  autoFocus
                  onBlur={() => !searchQuery && setSearchOpen(false)}
                  style={{
                    background: "rgba(var(--theme-accent-rgb), 0.08)",
                    borderColor: "rgba(var(--theme-accent-rgb), 0.25)",
                    color: "var(--color-foreground)",
                  }}
                />
              </form>
            ) : (
              <button
                onClick={() => setSearchOpen(true)}
                className="rounded-full p-2 transition-all duration-200 hover:bg-white/8 active:scale-90"
                style={{ color: "var(--color-muted-foreground)" }}
                aria-label="Search"
              >
                <Search className="h-5 w-5" />
              </button>
            )}

            {isGuest ? (
              <Link
                href="/login"
                className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 active:scale-95"
                style={{
                  background: "var(--color-primary)",
                  color: "var(--color-primary-foreground)",
                }}
              >
                <LogIn className="h-4 w-4" />
                <span className="hidden sm:inline">Sign In</span>
              </Link>
            ) : (
              <>
                <button
                  className="rounded-full p-2 transition-all duration-200 hover:bg-white/8 active:scale-90"
                  style={{ color: "var(--color-muted-foreground)" }}
                  aria-label="Notifications"
                >
                  <Bell className="h-5 w-5" />
                </button>

                <div className="relative">
                  <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="flex items-center gap-1.5 rounded-full transition-all duration-200 active:scale-90"
                    aria-label="Profile menu"
                  >
                    <div
                      className="flex h-8 w-8 items-center justify-center rounded-full"
                      style={{
                        background: `linear-gradient(135deg, var(--color-primary), var(--color-accent))`,
                      }}
                    >
                      <User className="h-4 w-4 text-white" />
                    </div>
                    <ChevronDown
                      className="h-3 w-3 transition-transform duration-200"
                      style={{
                        color: "var(--color-muted-foreground)",
                        transform: menuOpen ? "rotate(180deg)" : "rotate(0deg)",
                      }}
                    />
                  </button>

                  <AnimatePresence>
                    {menuOpen && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.92, y: -4 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.92, y: -4 }}
                        transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                        className="absolute right-0 top-full mt-2 w-52 rounded-2xl border p-2 shadow-2xl"
                        style={{
                          background: "var(--color-card)",
                          borderColor: "var(--color-border)",
                          boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
                        }}
                      >
                        {[
                          { href: "/profiles", icon: User, label: "Switch Profile" },
                          { href: "/my-list",  icon: Bookmark, label: "My List" },
                          { href: "/history",  icon: Clock, label: "Watch History" },
                        ].map(({ href, icon: Icon, label }) => (
                          <Link
                            key={href}
                            href={href}
                            onClick={() => setMenuOpen(false)}
                            className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm transition-all duration-200 hover:bg-white/6"
                            style={{ color: "var(--color-foreground)" }}
                          >
                            <Icon className="h-4 w-4" style={{ color: "var(--color-primary)" }} />
                            {label}
                          </Link>
                        ))}
                        <hr className="my-1.5" style={{ borderColor: "var(--color-border)" }} />
                        <button
                          onClick={handleSignOut}
                          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm transition-all duration-200 hover:bg-white/6 active:scale-95"
                          style={{ color: "var(--color-destructive)" }}
                        >
                          <LogOut className="h-4 w-4" />
                          Sign Out
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ── Collapsible Sidebar ─────────────────────────────────────────── */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="sidebar-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 z-[110]"
              style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)" }}
              onClick={() => setSidebarOpen(false)}
            />

            {/* Sidebar panel */}
            <motion.aside
              key="sidebar-panel"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
              className="fixed left-0 top-0 bottom-0 z-[120] flex flex-col w-72 shadow-2xl"
              style={{
                background: "var(--color-card)",
                borderRight: "1px solid var(--color-border)",
              }}
            >
              {/* Sidebar header */}
              <div
                className="flex items-center justify-between px-6 py-5 border-b"
                style={{ borderColor: "var(--color-border)" }}
              >
                <LuminaaLogo size="md" />
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="rounded-full p-1.5 transition-all duration-200 hover:bg-white/8 active:scale-90"
                  style={{ color: "var(--color-muted-foreground)" }}
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Navigation links */}
              <nav className="flex-1 overflow-y-auto px-3 py-4">
                <p
                  className="px-3 mb-2 text-[10px] font-bold uppercase tracking-[0.2em]"
                  style={{ color: "var(--color-muted-foreground)" }}
                >
                  Browse
                </p>
                {SIDEBAR_LINKS.map(({ href, label, icon: Icon }, i) => {
                  const isActive = pathname === href;
                  return (
                    <motion.div
                      key={href}
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04, duration: 0.2 }}
                    >
                      <Link
                        href={href}
                        onClick={() => setSidebarOpen(false)}
                        className="flex items-center gap-3 rounded-xl px-3 py-2.5 mb-0.5 text-sm font-medium transition-all duration-200"
                        style={{
                          background: isActive
                            ? `rgba(var(--theme-accent-rgb), 0.14)`
                            : "transparent",
                          color: isActive
                            ? "var(--color-primary)"
                            : "var(--color-muted-foreground)",
                          borderLeft: isActive
                            ? `3px solid var(--color-primary)`
                            : "3px solid transparent",
                        }}
                      >
                        <Icon
                          className="h-4 w-4 flex-shrink-0"
                          style={{
                            color: isActive ? "var(--color-primary)" : undefined,
                          }}
                        />
                        {label}
                      </Link>
                    </motion.div>
                  );
                })}
              </nav>

              {/* Sidebar footer: ThemeSwitcher */}
              <div
                className="px-4 py-4 border-t"
                style={{ borderColor: "var(--color-border)" }}
              >
                <p
                  className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] px-1"
                  style={{ color: "var(--color-muted-foreground)" }}
                >
                  Theme
                </p>
                <ThemeSwitcher />
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
