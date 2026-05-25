import CherryBlossoms from "@/components/auth/CherryBlossoms";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-4"
      style={{ background: "linear-gradient(135deg, #0a0a0f 0%, #110a1f 40%, #1a0a2e 70%, #0d0a1a 100%)" }}
    >
      <CherryBlossoms />
      <div className="relative z-10 w-full max-w-[420px]">
        {children}
      </div>
    </div>
  );
}
