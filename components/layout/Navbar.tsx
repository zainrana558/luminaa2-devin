"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Bell, User, LogOut, LogIn, ChevronDown } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavScroll } from "@/hooks/useNavScroll";

interface NavbarProps {
  isGuest?: boolean;
}

export default function Navbar({ isGuest = false }: NavbarProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const scrolled = useNavScroll();
  const router = useRouter();

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
    <nav
      className="fixed top-0 w-full transition-all duration-300 ease-out"
      style={{
        height: "64px",
        zIndex: 1000,
        background: scrolled ? "rgba(13,13,13,0.98)" : "#0d0d0d",
        borderBottom: scrolled ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(255,255,255,0.04)",
      }}
    >
      <div className="flex h-full items-center justify-between" style={{ padding: "0 48px" }}>
        <div className="flex items-center gap-8">
          <Link
            href="/browse"
            className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"
            style={{ fontSize: "1.5rem", fontWeight: 800, lineHeight: 1 }}
          >
            Lumina
          </Link>
          <div className="hidden items-center md:flex" style={{ gap: "32px" }}>
            <Link href="/browse" className="text-muted-foreground hover:text-foreground transition-all duration-300 ease-in-out" style={{ fontSize: "0.9rem", fontWeight: 500 }}>
              Home
            </Link>
            <Link href="/movies" className="text-muted-foreground hover:text-foreground transition-all duration-300 ease-in-out" style={{ fontSize: "0.9rem", fontWeight: 500 }}>
              Movies
            </Link>
            <Link href="/tv" className="text-muted-foreground hover:text-foreground transition-all duration-300 ease-in-out" style={{ fontSize: "0.9rem", fontWeight: 500 }}>
              TV Shows
            </Link>
            <Link href="/anime" className="text-muted-foreground hover:text-foreground transition-all duration-300 ease-in-out" style={{ fontSize: "0.9rem", fontWeight: 500 }}>
              Anime
            </Link>
            <Link href="/horror" className="text-muted-foreground hover:text-foreground transition-all duration-300 ease-in-out" style={{ fontSize: "0.9rem", fontWeight: 500 }}>
              Horror
            </Link>
            <Link href="/comedy" className="text-muted-foreground hover:text-foreground transition-all duration-300 ease-in-out" style={{ fontSize: "0.9rem", fontWeight: 500 }}>
              Comedy
            </Link>
            <Link href="/action" className="text-muted-foreground hover:text-foreground transition-all duration-300 ease-in-out" style={{ fontSize: "0.9rem", fontWeight: 500 }}>
              Action
            </Link>
            <Link href="/cartoon" className="text-muted-foreground hover:text-foreground transition-all duration-300 ease-in-out" style={{ fontSize: "0.9rem", fontWeight: 500 }}>
              Cartoon
            </Link>
            <Link href="/romance" className="text-muted-foreground hover:text-foreground transition-all duration-300 ease-in-out" style={{ fontSize: "0.9rem", fontWeight: 500 }}>
              Romance
            </Link>
            <Link href="/scifi" className="text-muted-foreground hover:text-foreground transition-all duration-300 ease-in-out" style={{ fontSize: "0.9rem", fontWeight: 500 }}>
              Sci-Fi
            </Link>
            {!isGuest && (
              <Link href="/my-list" className="text-muted-foreground hover:text-foreground transition-all duration-300 ease-in-out" style={{ fontSize: "0.9rem", fontWeight: 500 }}>
                My List
              </Link>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          {searchOpen ? (
            <form onSubmit={handleSearch} className="flex items-center">
              <Input
                type="text"
                placeholder="Titles, people, genres"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-48 md:w-64"
                autoFocus
                onBlur={() => !searchQuery && setSearchOpen(false)}
              />
            </form>
          ) : (
            <button onClick={() => setSearchOpen(true)} className="text-muted-foreground hover:text-foreground transition-all duration-300 ease-in-out active:scale-95">
              <Search className="h-5 w-5" />
            </button>
          )}

          {isGuest ? (
            <Link
              href="/login"
              className="flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-all duration-300 ease-in-out active:scale-95"
            >
              <LogIn className="h-4 w-4" />
              Sign In
            </Link>
          ) : (
            <>
              <button className="text-muted-foreground hover:text-foreground transition-all duration-300 ease-in-out active:scale-95">
                <Bell className="h-5 w-5" />
              </button>

              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-all duration-300 ease-in-out active:scale-95"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <ChevronDown className="h-3 w-3" />
                </button>

                {menuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 rounded-2xl border border-border bg-card p-2 shadow-xl">
                    <Link
                      href="/profiles"
                      className="flex items-center gap-2 rounded-full px-3 py-2 text-sm hover:bg-secondary transition-all duration-300 ease-in-out"
                      onClick={() => setMenuOpen(false)}
                    >
                      <User className="h-4 w-4" />
                      Switch Profile
                    </Link>
                    <Link
                      href="/history"
                      className="flex items-center gap-2 rounded-full px-3 py-2 text-sm hover:bg-secondary transition-all duration-300 ease-in-out"
                      onClick={() => setMenuOpen(false)}
                    >
                      Watch History
                    </Link>
                    <hr className="my-1 border-border" />
                    <button
                      onClick={handleSignOut}
                      className="flex w-full items-center gap-2 rounded-full px-3 py-2 text-sm text-destructive hover:bg-secondary transition-all duration-300 ease-in-out active:scale-95"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
