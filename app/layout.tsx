import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Luminaa2 — Premium Streaming",
  description:
    "Ultra-premium cinematic streaming platform with 7 immersive themes — Action, Romance, Anime, Cartoon, Sci-Fi, Cinematic, Horror.",
  keywords: ["streaming", "movies", "anime", "tv shows", "horror", "cinematic"],
  openGraph: {
    title: "Luminaa2 — Premium Streaming",
    description: "Seven cinematic worlds. One premium platform.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0c0a08",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`dark ${inter.variable} ${playfair.variable} bg-background`}
      data-theme="cinematic"
    >
      <body className="min-h-screen bg-background text-foreground antialiased font-sans">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
