import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/layout/Navbar";
import MobileNav from "@/components/layout/MobileNav";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen">
      <Navbar isGuest={!user} />
      <main className="pb-20 pt-16 md:pb-0">{children}</main>
      <MobileNav isGuest={!user} />
    </div>
  );
}
