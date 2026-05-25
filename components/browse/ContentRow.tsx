"use client";

import { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import MediaCard from "./MediaCard";
import type { MediaItem } from "@/types";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";

interface ContentRowProps {
  title: string;
  items: MediaItem[];
  onItemClick: (item: MediaItem) => void;
  mediaType?: "movie" | "tv";
}

export default function ContentRow({ title, items, onItemClick, mediaType }: ContentRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd,   setAtEnd]   = useState(false);

  const [headingRef, headingVisible] = useIntersectionObserver<HTMLDivElement>();
  const [rowRef, rowVisible]         = useIntersectionObserver<HTMLDivElement>();

  function updateBoundaries() {
    const el = scrollRef.current;
    if (!el) return;
    setAtStart(el.scrollLeft <= 8);
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 8);
  }

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateBoundaries();
    el.addEventListener("scroll", updateBoundaries, { passive: true });
    return () => el.removeEventListener("scroll", updateBoundaries);
  }, [items]);

  function scroll(dir: "left" | "right") {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.clientWidth * 0.75;
    scrollRef.current.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
  }

  if (!items.length) return null;

  return (
    <div
      style={{
        paddingBottom: "52px",
        paddingLeft: "clamp(16px, 3vw, 48px)",
        paddingRight: "clamp(16px, 3vw, 48px)",
      }}
    >
      {/* Section heading with animated accent bar */}
      <div
        ref={headingRef}
        style={{
          opacity: headingVisible ? 1 : 0,
          transform: headingVisible ? "translateX(0)" : "translateX(-16px)",
          transition: "opacity 320ms ease-out, transform 320ms ease-out",
          paddingLeft: "14px",
          position: "relative",
          marginBottom: "20px",
        }}
      >
        <span
          aria-hidden
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: "4px",
            borderRadius: "2px",
            background: "linear-gradient(to bottom, var(--color-primary), var(--color-accent))",
            opacity: headingVisible ? 1 : 0,
            transition: "opacity 320ms ease-out 100ms",
          }}
        />
        <h2
          style={{
            fontSize: "clamp(1.05rem, 2vw, 1.3rem)",
            fontWeight: 700,
            color: "var(--color-foreground)",
            letterSpacing: "0.01em",
          }}
        >
          {title}
        </h2>
      </div>

      <div className="group relative" ref={rowRef}>
        {/* ── Responsive card sizing ── */}
        <style>{`
          .c-row-cards { display: flex; overflow-x: auto; gap: 14px; scroll-snap-type: x mandatory; scrollbar-width: none; }
          .c-row-cards::-webkit-scrollbar { display: none; }
          .c-row-cards > div { flex: 0 0 calc(50% - 10px); scroll-snap-align: start; }
          @media (min-width: 640px)  { .c-row-cards > div { flex: 0 0 calc(33.33% - 10px); } }
          @media (min-width: 768px)  { .c-row-cards > div { flex: 0 0 calc(25%    - 12px); } }
          @media (min-width: 1024px) { .c-row-cards > div { flex: 0 0 calc(20%    - 12px); } }
          @media (min-width: 1280px) { .c-row-cards > div { flex: 0 0 calc(16.66% - 12px); } }
        `}</style>

        {/* Left arrow */}
        <button
          onClick={() => scroll("left")}
          className="absolute -left-3 top-1/2 z-10 -translate-y-1/2 rounded-full p-2 shadow-lg backdrop-blur-sm transition-all duration-200 hover:scale-110 active:scale-90"
          style={{
            background: "rgba(0,0,0,0.7)",
            border: "1px solid rgba(var(--theme-accent-rgb),0.2)",
            color: "var(--color-foreground)",
            opacity: atStart ? 0 : 1,
            pointerEvents: atStart ? "none" : "auto",
          }}
          aria-hidden={atStart}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <div ref={scrollRef} className="c-row-cards pb-2">
          {items.map((item, i) => (
            <div
              key={item.id}
              style={{
                opacity: rowVisible ? 1 : 0,
                transform: rowVisible ? "translateY(0)" : "translateY(20px)",
                transition: `opacity 280ms ease-out ${i * 35}ms, transform 280ms ease-out ${i * 35}ms`,
                flexShrink: 0,
              }}
            >
              <MediaCard item={item} onClick={onItemClick} mediaType={mediaType} />
            </div>
          ))}
        </div>

        {/* Right arrow */}
        <button
          onClick={() => scroll("right")}
          className="absolute -right-3 top-1/2 z-10 -translate-y-1/2 rounded-full p-2 shadow-lg backdrop-blur-sm transition-all duration-200 hover:scale-110 active:scale-90"
          style={{
            background: "rgba(0,0,0,0.7)",
            border: "1px solid rgba(var(--theme-accent-rgb),0.2)",
            color: "var(--color-foreground)",
            opacity: atEnd ? 0 : 1,
            pointerEvents: atEnd ? "none" : "auto",
          }}
          aria-hidden={atEnd}
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
