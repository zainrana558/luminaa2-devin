"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const watchlistSchema = z.object({
  profile_id: z.string().uuid(),
  media_id: z.number(),
  media_type: z.enum(["movie", "tv"]),
  title: z.string(),
  poster_path: z.string().nullable(),
});

export async function addToWatchlist(data: z.infer<typeof watchlistSchema>) {
  const supabase = await createClient();
  const parsed = watchlistSchema.safeParse(data);
  if (!parsed.success) return { error: "Invalid data" };

  const { error } = await supabase.from("watchlist").upsert(
    parsed.data,
    { onConflict: "profile_id,media_id,media_type" }
  );

  if (error) return { error: error.message };
  revalidatePath("/browse");
  return { success: true };
}

export async function removeFromWatchlist(profileId: string, mediaId: number, mediaType: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("watchlist")
    .delete()
    .eq("profile_id", profileId)
    .eq("media_id", mediaId)
    .eq("media_type", mediaType);

  if (error) return { error: error.message };
  revalidatePath("/browse");
  return { success: true };
}

export async function getWatchlist(profileId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("watchlist")
    .select("*")
    .eq("profile_id", profileId)
    .order("added_at", { ascending: false });

  return data || [];
}

export async function isInWatchlist(profileId: string, mediaId: number, mediaType: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("watchlist")
    .select("id")
    .eq("profile_id", profileId)
    .eq("media_id", mediaId)
    .eq("media_type", mediaType)
    .maybeSingle();

  return !!data;
}
