"use client";

import { useState } from "react";
import Image from "next/image";
import { Play, Plus, Star } from "lucide-react";
import { motion } from "framer-motion";
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
    <motion.button
      onClick={() => onClick({ ...item, media_type: type })}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      animate={{
        scale: hovered ? 1.06 : 1,
        y: hovered ? -4 : 0,
      }}
      transition={{ type: "spring", stiffness: 340, damping: 24 }}
      className="relative overflow-hidden text-left focus:outline-none"
      style={{
        borderRadius: "12px",
        background: "var(--color-card)",
        border: `1px solid ${hovered ? "rgba(var(--theme-accent-rgb), 0.35)" : "transparent"}`,
        boxShadow: hovered
          ? `0 16px 40px rgba(0,0,0,0.7), 0 0 0 1px rgba(var(--theme-accent-rgb),0.18), 0 8px 16px rgba(var(--theme-accent-rgb),0.12)`
          : "0 2px 12px rgba(0,0,0,0.4)",
        transition: "border-color 0.25s ease, box-shadow 0.25s ease",
        width: "100%",
        zIndex: hovered ? 10 : "auto",
      }}
    >
      {/* Poster */}
      <div className="relative aspect-[2/3] w-full overflow-hidden" style={{ borderRadius: "12px 12px 0 0" }}>
        <Image
          src={getImageUrl(item.poster_path)}
          alt={getTitle(item)}
          fill
          className="object-cover"
          sizes="(max-width: 767px) calc(50vw - 28px), (max-width: 1279px) calc(25vw - 24px), calc(20vw - 24px)"
          style={{
            filter: hovered ? "brightness(0.75)" : "brightness(1)",
            transition: "filter 0.25s ease",
          }}
        />

        {/* Play button overlay */}
        <motion.div
          animate={{ opacity: hovered ? 1 : 0, scale: hovered ? 1 : 0.7 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div
            className="flex h-12 w-12 items-center justify-center rounded-full shadow-lg"
            style={{
              background: "var(--color-primary)",
              boxShadow: `0 0 20px rgba(var(--theme-accent-rgb), 0.6)`,
            }}
          >
            <Play className="h-5 w-5 fill-current" style={{ color: "var(--color-primary-foreground)" }} />
          </div>
        </motion.div>

        {/* Top-right: rating badge */}
        <div
          className="absolute left-2 top-2 flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold"
          style={{
            background: "rgba(0,0,0,0.7)",
            backdropFilter: "blur(8px)",
            color: "var(--color-primary)",
          }}
        >
          <Star className="h-2.5 w-2.5 fill-current" />
          {formatRating(item.vote_average)}
        </div>
      </div>

      {/* Info bar */}
      <div
        className="px-2.5 py-2 space-y-0.5"
        style={{ borderRadius: "0 0 12px 12px" }}
      >
        <p
          className="truncate text-xs font-semibold leading-tight"
          style={{ color: "var(--color-card-foreground)" }}
        >
          {getTitle(item)}
        </p>
        <p
          className="text-[10px]"
          style={{ color: "var(--color-muted-foreground)" }}
        >
          {getYear(item)} · {type === "movie" ? "Movie" : "TV"}
        </p>
      </div>
    </motion.button>
  );
}
