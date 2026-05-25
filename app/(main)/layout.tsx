import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/layout/Navbar";
import MobileNav from "@/components/layout/MobileNav";
import PageTransition from "@/components/layout/PageTransition";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen" style={{ background: "var(--color-background)" }}>
      <Navbar isGuest={!user} />

      <main className="pb-20 pt-16 md:pb-0">
        {/* Constrained inner content — hero banners opt out via negative margins */}
        <div
          style={{
            maxWidth: "1400px",
            margin: "0 auto",
            paddingLeft:  "clamp(16px, 4vw, 48px)",
            paddingRight: "clamp(16px, 4vw, 48px)",
          }}
        >
          <PageTransition>{children}</PageTransition>
        </div>
      </main>

      <MobileNav isGuest={!user} />
    </div>
  );
}
