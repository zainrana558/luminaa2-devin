"use client";

import { useState } from "react";
import Image from "next/image";
import { getImageUrl, getTitle, getYear, formatRating } from "@/lib/utils";
import type { MediaItem } from "@/types";

interface MediaCardProps {
  item: MediaItem;
  onClick: (item: MediaItem) => void;
  mediaType?: "movie" | "tv";
}

export default function MediaCard({ item, onClick, mediaType }: MediaCardProps) {
  const [hovered, setHovered] = useState(false);
  const type = mediaType || item.media_type || (item.title ? "movie" : "tv");

  return (
    <button
      onClick={() => onClick({ ...item, media_type: type })}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative overflow-hidden active:scale-95 transition-all duration-200 ease-out"
      style={{
        borderRadius: "10px",
        background: "#1a1a1a",
        border: "none",
        width: "100%",
        flexShrink: 0,
        transform: hovered ? "scale(1.04)" : "scale(1)",
        boxShadow: hovered
          ? "0 12px 32px rgba(0,0,0,0.6), 0 4px 12px rgba(0,0,0,0.4)"
          : "0 2px 8px rgba(0,0,0,0.3)",
        transition: "transform 200ms ease-out, box-shadow 200ms ease-out",
        zIndex: hovered ? 10 : "auto",
      }}
    >
      <div className="relative aspect-[2/3] w-full overflow-hidden" style={{ borderRadius: "10px" }}>
        {/* Poster image with brightness on hover */}
        <Image
          src={getImageUrl(item.poster_path)}
          alt={getTitle(item)}
          fill
          className="object-cover"
          sizes="(max-width: 767px) calc(50vw - 28px), (max-width: 1279px) calc(25vw - 24px), calc(20vw - 24px)"
          style={{
            display: "block",
            filter: hovered ? "brightness(1.08)" : "brightness(1)",
            transition: "filter 200ms ease-out",
          }}
        />

        {/* Bottom info bar — slides up 40px on hover, solid dark bg */}
        <div
          className="absolute left-0 right-0 bottom-0 bg-zinc-900/95 px-2 py-2"
          style={{
            transform: hovered ? "translateY(0)" : "translateY(40px)",
            transition: "transform 200ms ease-out",
          }}
        >
          <p className="truncate text-xs font-medium text-white leading-tight">
            {getTitle(item)}
          </p>
          <p className="text-[10px] text-white/60 mt-0.5">
            {formatRating(item.vote_average)} · {getYear(item)}
          </p>
        </div>
      </div>
    </button>
  );
}
