"use client";

import { useEffect, useRef, useState } from "react";

/**
 * useIntersectionObserver — fires once when element enters viewport.
 * Returns [ref, isVisible]. isVisible latches true and never goes back.
 */
export function useIntersectionObserver<T extends Element>(
  options: IntersectionObserverInit = { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
): [React.RefObject<T | null>, boolean] {
  const ref = useRef<T>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true);
        observer.disconnect();
      }
    }, options);
    observer.observe(el);
    return () => observer.disconnect();
  }, [options]);

  return [ref, visible];
}
