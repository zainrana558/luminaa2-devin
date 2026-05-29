"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Bell, User, LogOut, LogIn, ChevronDown } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface NavbarProps {
  isGuest?: boolean;
}

export default function Navbar({ isGuest = false }: NavbarProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
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
    <nav className="fixed top-0 z-50 w-full bg-gradient-to-b from-background/95 to-transparent backdrop-blur-sm">
      <div className="flex items-center justify-between px-4 py-3 md:px-8">
        <div className="flex items-center gap-8">
          <Link
            href="/browse"
            className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"
          >
            Lumina
          </Link>
          <div className="hidden items-center gap-6 md:flex">
            <Link href="/browse" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Home
            </Link>
            <Link href="/movies" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Movies
            </Link>
            <Link href="/tv" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              TV Shows
            </Link>
            {!isGuest && (
              <Link href="/my-list" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
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
            <button onClick={() => setSearchOpen(true)} className="text-muted-foreground hover:text-foreground">
              <Search className="h-5 w-5" />
            </button>
          )}

          {isGuest ? (
            <Link
              href="/login"
              className="flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors"
            >
              <LogIn className="h-4 w-4" />
              Sign In
            </Link>
          ) : (
            <>
              <button className="text-muted-foreground hover:text-foreground">
                <Bell className="h-5 w-5" />
              </button>

              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-1 text-muted-foreground hover:text-foreground"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br from-purple-500 to-pink-500">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <ChevronDown className="h-3 w-3" />
                </button>

                {menuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 rounded-lg border border-border bg-card p-2 shadow-xl">
                    <Link
                      href="/profiles"
                      className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-secondary"
                      onClick={() => setMenuOpen(false)}
                    >
                      <User className="h-4 w-4" />
                      Switch Profile
                    </Link>
                    <Link
                      href="/history"
                      className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-secondary"
                      onClick={() => setMenuOpen(false)}
                    >
                      Watch History
                    </Link>
                    <hr className="my-1 border-border" />
                    <button
                      onClick={handleSignOut}
                      className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-destructive hover:bg-secondary"
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
