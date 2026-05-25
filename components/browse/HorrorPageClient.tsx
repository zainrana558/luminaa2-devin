"use client";

import type { MediaItem } from "@/types";
import GenrePageClient from "@/components/browse/GenrePageClient";
import { ThemeApplier } from "@/components/ui/ThemeApplier";

interface HorrorPageClientProps {
  movies: MediaItem[];
  tv: MediaItem[];
}

export default function HorrorPageClient({ movies, tv }: HorrorPageClientProps) {
  return (
    <>
      {/* Auto-apply Horror theme on this page */}
      <ThemeApplier theme="horror" />
      <GenrePageClient
        config={{
          id: "horror",
          label: "Horror",
          description: "Fear · Dread · Terror",
          heroItem: movies[0] ?? tv[0],
          rows: [
            { title: "Horror Movies",   items: movies.slice(1, 20), mediaType: "movie" },
            { title: "Horror TV Series", items: tv.slice(0, 20),    mediaType: "tv"    },
            { title: "More Nightmares", items: [...movies, ...tv].slice(10, 30)         },
          ],
        }}
      />
    </>
  );
}
