"use client";

import { useRef, useCallback } from "react";

/**
 * Magnetic hover effect — button gently follows cursor up to `strength` px.
 * Returns ref + mouse event handlers to spread onto the element.
 */
export function useMagneticHover(strength = 0.35) {
  const ref = useRef<HTMLElement>(null);

  const onMouseMove = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) * strength;
      const dy = (e.clientY - cy) * strength;
      el.style.transform = `translate(${dx}px, ${dy}px)`;
    },
    [strength]
  );

  const onMouseLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = "translate(0px, 0px)";
  }, []);

  return { ref, onMouseMove, onMouseLeave } as {
    ref: React.RefObject<HTMLElement>;
    onMouseMove: (e: React.MouseEvent<HTMLElement>) => void;
    onMouseLeave: () => void;
  };
}
