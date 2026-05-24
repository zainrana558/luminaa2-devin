"use client";

import { useEffect, useState } from "react";

/**
 * useNavScroll — returns true when page has scrolled past threshold.
 * Used to switch navbar from transparent gradient to solid dark bg.
 */
export function useNavScroll(threshold = 40): boolean {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > threshold);
    }
    // Check immediately on mount
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);

  return scrolled;
}
