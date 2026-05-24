"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Play, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { getImageUrl, getTitle } from "@/lib/utils";
import type { MediaItem } from "@/types";
import { useHeroScene } from "@/hooks/useHeroScene";

interface HeroBannerProps {
  items: MediaItem[];
  onPlay: (item: MediaItem) => void;
  onInfo: (item: MediaItem) => void;
}

export default function HeroBanner({ items, onPlay, onInfo }: HeroBannerProps) {
  const [current, setCurrent] = useState(0);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const item = items[current];

  // Existing autoplay — unchanged
  useEffect(() => {
    if (items.length <= 1) return;
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % items.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [items.length]);

  // Sparse ambient particles via hook
  useHeroScene(canvasRef);

  // Mouse parallax — max 15px offset, throttled via CSS transform
  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 15;
    const y = ((e.clientY - rect.top)  / rect.height - 0.5) * 15;
    setMouse({ x, y });
  }

  if (!item) return null;

  const mediaType = item.media_type || (item.title ? "movie" : "tv");

  return (
    <div
      className="relative h-[70vh] w-full overflow-hidden md:h-[85vh]"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setMouse({ x: 0, y: 0 })}
    >
      {/* Backdrop with crossfade on slide change + parallax */}
      <AnimatePresence mode="sync">
        <motion.div
          key={current}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="absolute inset-0"
          style={{
            transform: `translate(${mouse.x}px, ${mouse.y}px) scale(1.06)`,
            transition: "transform 0.25s ease-out",
          }}
        >
          <Image
            src={getImageUrl(item.backdrop_path, "original")}
            alt={getTitle(item)}
            fill
            className="object-cover"
            priority
          />
        </motion.div>
      </AnimatePresence>

      {/* Ambient particles canvas — z above image, below gradients */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
        style={{ zIndex: 1, width: "100%", height: "100%" }}
      />

      {/* Gradients — bleed into page background, no hard edge */}
      <div className="absolute inset-0" style={{ zIndex: 2 }}>
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-transparent" />
        {/* Extra bottom bleed for seamless page merge */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </div>

      {/* Text content — entrance animation on load, crossfade on slide change */}
      <div className="absolute bottom-16 left-4 max-w-xl space-y-4 md:bottom-24 md:left-8" style={{ zIndex: 3 }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="space-y-4"
          >
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="text-3xl font-bold drop-shadow-lg md:text-5xl"
            >
              {getTitle(item)}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: "easeOut", delay: 0.1 }}
              className="line-clamp-3 text-sm text-foreground/80 drop-shadow md:text-base"
            >
              {item.overview}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
              className="flex items-center gap-3"
            >
              <Button
                size="lg"
                onClick={() => onPlay({ ...item, media_type: mediaType })}
                className="gap-2"
              >
                <Play className="h-5 w-5 fill-current" />
                Play
              </Button>
              <Button
                size="lg"
                variant="secondary"
                onClick={() => onInfo({ ...item, media_type: mediaType })}
                className="gap-2"
              >
                <Info className="h-5 w-5" />
                More Info
              </Button>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Dot indicators — unchanged */}
      {items.length > 1 && (
        <div className="absolute bottom-6 right-4 flex gap-1.5 md:bottom-12 md:right-8" style={{ zIndex: 3 }}>
          {items.slice(0, 5).map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-1 rounded-full transition-all ${
                i === current ? "w-8 bg-primary" : "w-4 bg-foreground/30"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
