"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Play, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getImageUrl, getTitle } from "@/lib/utils";
import type { MediaItem } from "@/types";

interface HeroBannerProps {
  items: MediaItem[];
  onPlay: (item: MediaItem) => void;
  onInfo: (item: MediaItem) => void;
}

export default function HeroBanner({ items, onPlay, onInfo }: HeroBannerProps) {
  const [current, setCurrent] = useState(0);
  const item = items[current];

  useEffect(() => {
    if (items.length <= 1) return;
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % items.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [items.length]);

  if (!item) return null;

  const mediaType = item.media_type || (item.title ? "movie" : "tv");

  return (
    <div className="relative h-[70vh] w-full overflow-hidden md:h-[85vh]">
      <Image
        src={getImageUrl(item.backdrop_path, "original")}
        alt={getTitle(item)}
        fill
        className="object-cover"
        priority
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-transparent" />

      <div className="absolute bottom-16 left-4 max-w-xl space-y-4 md:bottom-24 md:left-8">
        <h1 className="text-3xl font-bold drop-shadow-lg md:text-5xl">
          {getTitle(item)}
        </h1>
        <p className="line-clamp-3 text-sm text-foreground/80 drop-shadow md:text-base">
          {item.overview}
        </p>
        <div className="flex items-center gap-3">
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
        </div>
      </div>

      {items.length > 1 && (
        <div className="absolute bottom-6 right-4 flex gap-1.5 md:bottom-12 md:right-8">
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
