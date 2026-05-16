import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ProfileSelector from "@/components/auth/ProfileSelector";

export default async function ProfilesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profiles } = await supabase
    .from("profiles")
    .select("*")
    .eq("account_id", user.id)
    .order("created_at");

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-muted to-background p-4">
      <ProfileSelector profiles={profiles || []} />
    </div>
  );
}
