"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Palette } from "lucide-react";
import { useThemeStore, THEMES, type Theme } from "@/lib/store/themeStore";

export default function ThemeSwitcher() {
  const [open, setOpen] = useState(false);
  const { theme, setTheme } = useThemeStore();
  const ref = useRef<HTMLDivElement>(null);
  const current = THEMES.find((t) => t.id === theme)!;

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  function handleSelect(id: Theme) {
    setTheme(id);
    setOpen(false);
  }

  return (
    <div ref={ref} className="relative">
      {/* Trigger button */}
      <motion.button
        onClick={() => setOpen((o) => !o)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        className="flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition-all duration-300"
        style={{
          background: "rgba(var(--theme-accent-rgb), 0.12)",
          border: "1px solid rgba(var(--theme-accent-rgb), 0.3)",
          color: "var(--color-primary)",
        }}
        aria-label="Switch theme"
      >
        <span
          className="h-3 w-3 rounded-full flex-shrink-0"
          style={{ background: `linear-gradient(135deg, ${current.from}, ${current.to})` }}
        />
        <span className="hidden sm:inline">{current.label}</span>
        <Palette className="h-3.5 w-3.5" />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: -8 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="absolute right-0 top-full mt-2 w-72 rounded-2xl border p-3 shadow-2xl z-[200]"
            style={{
              background: "var(--color-card)",
              borderColor: "var(--color-border)",
              boxShadow: "0 24px 48px rgba(0,0,0,0.6), 0 0 0 1px rgba(var(--theme-accent-rgb),0.1)",
            }}
          >
            <p
              className="mb-3 px-1 text-xs font-semibold uppercase tracking-widest"
              style={{ color: "var(--color-muted-foreground)" }}
            >
              Cinematic Theme
            </p>

            <div className="grid grid-cols-2 gap-2">
              {THEMES.map((t) => {
                const isActive = t.id === theme;
                return (
                  <motion.button
                    key={t.id}
                    onClick={() => handleSelect(t.id)}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2.5 rounded-xl p-2.5 text-left transition-all duration-200"
                    style={{
                      background: isActive
                        ? `rgba(var(--theme-accent-rgb), 0.18)`
                        : "transparent",
                      border: `1px solid ${isActive ? "rgba(var(--theme-accent-rgb), 0.4)" : "transparent"}`,
                    }}
                  >
                    {/* Preview swatch */}
                    <div
                      className="relative h-9 w-9 flex-shrink-0 rounded-lg overflow-hidden"
                      style={{ background: t.preview }}
                    >
                      <div
                        className="absolute inset-0 rounded-lg"
                        style={{
                          background: `linear-gradient(135deg, ${t.from}44, ${t.to}44)`,
                        }}
                      />
                      <div
                        className="absolute inset-0 flex items-center justify-center text-sm"
                        style={{ color: t.from }}
                      >
                        <span
                          className="font-black text-xs"
                          style={{
                            background: `linear-gradient(90deg, ${t.from}, ${t.to})`,
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            backgroundClip: "text",
                          }}
                        >
                          L2
                        </span>
                      </div>
                    </div>

                    <div className="min-w-0">
                      <p
                        className="text-xs font-semibold truncate"
                        style={{ color: isActive ? "var(--color-primary)" : "var(--color-foreground)" }}
                      >
                        {t.emoji} {t.label}
                      </p>
                      <p
                        className="text-[10px] truncate"
                        style={{ color: "var(--color-muted-foreground)" }}
                      >
                        {t.description}
                      </p>
                    </div>

                    {isActive && (
                      <motion.div
                        layoutId="theme-check"
                        className="ml-auto h-1.5 w-1.5 flex-shrink-0 rounded-full"
                        style={{ background: "var(--color-primary)" }}
                      />
                    )}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
