import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id")
          .eq("account_id", user.id)
          .limit(1);

        let profileId: string | null = null;

        if (!profiles || profiles.length === 0) {
          const displayName =
            user.user_metadata?.full_name ||
            user.user_metadata?.name ||
            user.email?.split("@")[0] ||
            "User";
          const avatarUrl = user.user_metadata?.avatar_url || null;

          const { data: newProfile } = await supabase
            .from("profiles")
            .insert({
              account_id: user.id,
              name: displayName.slice(0, 20),
              avatar_url: avatarUrl,
            })
            .select("id")
            .single();

          if (newProfile) {
            profileId = newProfile.id;
          }
        } else {
          profileId = profiles[0].id;
        }

        if (profileId) {
          const response = NextResponse.redirect(`${origin}/browse`);
          response.cookies.set("profile_id", profileId, {
            path: "/",
            maxAge: 60 * 60 * 24 * 365,
          });
          return response;
        }
      }

      return NextResponse.redirect(`${origin}/profiles`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`);
}
