"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Theme =
  | "cinematic"
  | "action"
  | "romance"
  | "anime"
  | "cartoon"
  | "scifi"
  | "horror";

export interface ThemeConfig {
  id: Theme;
  label: string;
  description: string;
  from: string;
  to: string;
  preview: string; // background CSS for preview swatch
  font: string;
  emoji: string;
}

export const THEMES: ThemeConfig[] = [
  {
    id: "cinematic",
    label: "Cinematic",
    description: "Sepia & elegance",
    from: "#c9a84c",
    to: "#f0d080",
    preview: "linear-gradient(135deg,#0c0a08,#241e14)",
    font: "serif",
    emoji: "🎬",
  },
  {
    id: "action",
    label: "Action",
    description: "Explosive & bold",
    from: "#f59e0b",
    to: "#ef6c00",
    preview: "linear-gradient(135deg,#0a0a08,#1a1008)",
    font: "sans-serif",
    emoji: "💥",
  },
  {
    id: "romance",
    label: "Romance",
    description: "Blush & rose gold",
    from: "#f06292",
    to: "#ad1457",
    preview: "linear-gradient(135deg,#0f080c,#1a0c14)",
    font: "serif",
    emoji: "🌹",
  },
  {
    id: "anime",
    label: "Anime",
    description: "Cyber neon glow",
    from: "#00e5ff",
    to: "#e040fb",
    preview: "linear-gradient(135deg,#080814,#0c1028)",
    font: "sans-serif",
    emoji: "⚡",
  },
  {
    id: "cartoon",
    label: "Cartoon",
    description: "Vibrant & bouncy",
    from: "#7c4dff",
    to: "#ff6d00",
    preview: "linear-gradient(135deg,#0a0c18,#10122a)",
    font: "sans-serif",
    emoji: "🎨",
  },
  {
    id: "scifi",
    label: "Sci-Fi",
    description: "Matrix green code",
    from: "#00ff88",
    to: "#40c4ff",
    preview: "linear-gradient(135deg,#000a08,#001510)",
    font: "monospace",
    emoji: "🤖",
  },
  {
    id: "horror",
    label: "Horror",
    description: "Blood & shadows",
    from: "#cc0022",
    to: "#880000",
    preview: "linear-gradient(135deg,#040204,#0a040a)",
    font: "cursive",
    emoji: "☠️",
  },
];

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: "cinematic",
      setTheme: (theme) => set({ theme }),
    }),
    { name: "luminaa2-theme" }
  )
);
