"use client";

import { create } from "zustand";

export type ServerName = "Alpha" | "Beta" | "Gamma";

interface PlayerState {
  activeServer: ServerName;
  setServer: (server: ServerName) => void;
  isTheaterMode: boolean;
  toggleTheaterMode: () => void;
}

export const usePlayerStore = create<PlayerState>()((set) => ({
  activeServer: "Alpha",
  setServer: (server) => set({ activeServer: server }),
  isTheaterMode: false,
  toggleTheaterMode: () => set((s) => ({ isTheaterMode: !s.isTheaterMode })),
}));
