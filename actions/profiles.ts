"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const profileSchema = z.object({
  name: z.string().min(1).max(20),
  avatar_url: z.string().url().nullable().optional(),
});

export async function getProfiles() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("account_id", user.id)
    .order("created_at");

  return data || [];
}

export async function createProfile(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const parsed = profileSchema.safeParse({
    name: formData.get("name"),
    avatar_url: formData.get("avatar_url") || null,
  });

  if (!parsed.success) return { error: "Invalid profile data" };

  const { data: existing } = await supabase
    .from("profiles")
    .select("id")
    .eq("account_id", user.id);

  if (existing && existing.length >= 5) {
    return { error: "Maximum 5 profiles per account" };
  }

  const { error } = await supabase.from("profiles").insert({
    account_id: user.id,
    name: parsed.data.name,
    avatar_url: parsed.data.avatar_url || null,
  });

  if (error) return { error: error.message };

  revalidatePath("/profiles");
  return { success: true };
}

export async function deleteProfile(profileId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .delete()
    .eq("id", profileId);

  if (error) return { error: error.message };

  revalidatePath("/profiles");
  return { success: true };
}

export async function updateProfile(profileId: string, formData: FormData) {
  const supabase = await createClient();
  const parsed = profileSchema.safeParse({
    name: formData.get("name"),
    avatar_url: formData.get("avatar_url") || null,
  });

  if (!parsed.success) return { error: "Invalid profile data" };

  const { error } = await supabase
    .from("profiles")
    .update({
      name: parsed.data.name,
      avatar_url: parsed.data.avatar_url || null,
    })
    .eq("id", profileId);

  if (error) return { error: error.message };

  revalidatePath("/profiles");
  return { success: true };
}
