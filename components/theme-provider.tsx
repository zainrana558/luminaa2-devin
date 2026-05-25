"use client";

import { useEffect } from "react";
import { useThemeStore } from "@/lib/store/themeStore";

/**
 * ThemeProvider — syncs Zustand theme to [data-theme] on <html>.
 * Must be rendered inside the RootLayout body.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useThemeStore((s) => s.theme);

  useEffect(() => {
    const html = document.documentElement;
    // Apply theme attribute
    html.setAttribute("data-theme", theme);
    // Trigger smooth CSS transition class briefly
    html.classList.add("theme-transition");
    const timer = setTimeout(() => html.classList.remove("theme-transition"), 600);
    return () => clearTimeout(timer);
  }, [theme]);

  return <>{children}</>;
}
