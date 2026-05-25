"use client";

import { useEffect, useRef } from "react";
import { useThemeStore, type Theme } from "@/lib/store/themeStore";

/**
 * Temporarily applies a theme when the genre page mounts,
 * and restores the previous theme on unmount.
 */
export function ThemeApplier({ theme }: { theme: Theme }) {
  const { theme: currentTheme, setTheme } = useThemeStore();
  const previousTheme = useRef(currentTheme);

  useEffect(() => {
    previousTheme.current = useThemeStore.getState().theme;
    setTheme(theme);
    return () => {
      setTheme(previousTheme.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme]);

  return null;
}
