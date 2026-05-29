"use client";

import Image from "next/image";
import { Play, Star } from "lucide-react";
import { getImageUrl, getTitle, getYear, formatRating } from "@/lib/utils";
import type { MediaItem } from "@/types";

interface MediaCardProps {
  item: MediaItem;
  onClick: (item: MediaItem) => void;
  mediaType?: "movie" | "tv";
}

export default function MediaCard({ item, onClick, mediaType }: MediaCardProps) {
  const type = mediaType || item.media_type || (item.title ? "movie" : "tv");

  return (
    <button
      onClick={() => onClick({ ...item, media_type: type })}
      className="group relative flex-shrink-0 w-36 md:w-44 overflow-hidden rounded-lg transition-transform duration-300 hover:scale-105 hover:z-10"
    >
      <div className="relative aspect-[2/3] w-full overflow-hidden rounded-lg bg-muted">
        <Image
          src={getImageUrl(item.poster_path)}
          alt={getTitle(item)}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 144px, 176px"
        />
        <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/40" />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
          <div className="rounded-full bg-primary/90 p-3">
            <Play className="h-6 w-6 fill-white text-white" />
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
          <p className="truncate text-xs font-medium">{getTitle(item)}</p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-0.5">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              {formatRating(item.vote_average)}
            </span>
            <span>{getYear(item)}</span>
          </div>
        </div>
      </div>
    </button>
  );
}
