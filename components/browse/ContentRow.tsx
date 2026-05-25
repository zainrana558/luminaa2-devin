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
  const [atEnd, setAtEnd] = useState(false);

  // Section entrance — heading fade + translateX(-16px)→0
  const [headingRef, headingVisible] = useIntersectionObserver<HTMLDivElement>();
  // Cards entrance
  const [rowRef, rowVisible] = useIntersectionObserver<HTMLDivElement>();

  // Track scroll boundaries to show/hide arrows
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

  function scroll(direction: "left" | "right") {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.clientWidth * 0.75;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  }

  if (!items.length) return null;

  return (
    <div className="space-y-2 px-4 md:px-8" style={{ paddingBottom: "64px" }}>
      <style>{`
        .content-row-cards > div { flex: 0 0 calc(50% - 10px); width: calc(50% - 10px); }
        @media (min-width: 768px)  { .content-row-cards > div { flex: 0 0 calc(25% - 15px); width: calc(25% - 15px); } }
        @media (min-width: 1280px) { .content-row-cards > div { flex: 0 0 calc(20% - 16px); width: calc(20% - 16px); } }
      `}</style>
      {/* Heading: fade + translateX(-16px)→0, 4px left accent bar */}
      <div
        ref={headingRef}
        style={{
          opacity: headingVisible ? 1 : 0,
          transform: headingVisible ? "translateX(0)" : "translateX(-16px)",
          transition: "opacity 280ms ease-out, transform 280ms ease-out",
          paddingLeft: "14px",
          position: "relative",
          marginBottom: "20px",
        }}
      >
        {/* 4px left accent bar — gradient per spec */}
        <span
          aria-hidden
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: "4px",
            borderRadius: "2px",
            background: "linear-gradient(to bottom, #7c3aed, #ec4899)",
            opacity: headingVisible ? 1 : 0,
            transition: "opacity 280ms ease-out 80ms",
          }}
        />
        <h2 style={{ fontSize: "clamp(1.1rem, 2vw, 1.35rem)", fontWeight: 700, color: "#ffffff" }}>{title}</h2>
      </div>

      <div className="group relative" ref={rowRef}>
        {/* Left arrow — hidden at scroll start */}
        <button
          onClick={() => scroll("left")}
          className="absolute -left-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-background/80 p-2 shadow-lg backdrop-blur transition-all duration-300 ease-in-out active:scale-95"
          style={{
            opacity: atStart ? 0 : undefined,
            pointerEvents: atStart ? "none" : "auto",
          }}
          aria-hidden={atStart}
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        {/* Cards with stagger entrance */}
        <div
          ref={scrollRef}
          className="content-row-cards flex overflow-x-auto scroll-smooth pb-2"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none", gap: "20px" }}
        >
          {items.map((item, i) => (
            <div
              key={item.id}
              style={{
                opacity: rowVisible ? 1 : 0,
                transform: rowVisible ? "translateY(0)" : "translateY(24px)",
                transition: `opacity 250ms ease-out ${i * 40}ms, transform 250ms ease-out ${i * 40}ms`,
              }}
            >
              <MediaCard
                item={item}
                onClick={onItemClick}
                mediaType={mediaType}
              />
            </div>
          ))}
        </div>

        {/* Right arrow — hidden at scroll end */}
        <button
          onClick={() => scroll("right")}
          className="absolute -right-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-background/80 p-2 shadow-lg backdrop-blur transition-all duration-300 ease-in-out active:scale-95"
          style={{
            opacity: atEnd ? 0 : undefined,
            pointerEvents: atEnd ? "none" : "auto",
          }}
          aria-hidden={atEnd}
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
