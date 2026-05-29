"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const progressSchema = z.object({
  profile_id: z.string().uuid(),
  media_id: z.number(),
  media_type: z.enum(["movie", "tv"]),
  title: z.string(),
  poster_path: z.string().nullable(),
  progress: z.number().min(0),
  duration: z.number().min(0),
  season_number: z.number().optional(),
  episode_number: z.number().optional(),
});

export async function saveProgress(data: z.infer<typeof progressSchema>) {
  const supabase = await createClient();
  const parsed = progressSchema.safeParse(data);
  if (!parsed.success) return { error: "Invalid data" };

  const { error } = await supabase.from("watch_progress").upsert(
    { ...parsed.data, updated_at: new Date().toISOString() },
    { onConflict: "profile_id,media_id,media_type" }
  );

  if (error) return { error: error.message };
  return { success: true };
}

export async function getProgress(profileId: string, mediaId: number, mediaType: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("watch_progress")
    .select("*")
    .eq("profile_id", profileId)
    .eq("media_id", mediaId)
    .eq("media_type", mediaType)
    .maybeSingle();

  return data;
}

export async function getContinueWatching(profileId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("watch_progress")
    .select("*")
    .eq("profile_id", profileId)
    .gt("progress", 0)
    .order("updated_at", { ascending: false })
    .limit(20);

  return data || [];
}

export async function addToHistory(profileId: string, mediaId: number, mediaType: string, title: string, posterPath: string | null) {
  const supabase = await createClient();
  await supabase.from("watch_history").insert({
    profile_id: profileId,
    media_id: mediaId,
    media_type: mediaType,
    title,
    poster_path: posterPath,
  });
}

export async function getWatchHistory(profileId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("watch_history")
    .select("*")
    .eq("profile_id", profileId)
    .order("watched_at", { ascending: false })
    .limit(50);

  return data || [];
}
