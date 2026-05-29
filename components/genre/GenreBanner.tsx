"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

const genres = [
  {
    slug: "anime",
    label: "Anime",
    accent: "#f472b6",
    glow: "rgba(244,114,182,0.35)",
    css: `
      @keyframes petal-fall {
        0%   { transform: translateY(-20px) rotate(0deg); opacity: 0; }
        20%  { opacity: 1; }
        100% { transform: translateY(80px) rotate(360deg); opacity: 0; }
      }
    `,
    particles: [
      { left: "20%", delay: "0s",   size: 6,  color: "#f472b6" },
      { left: "50%", delay: "0.4s", size: 8,  color: "#fb7185" },
      { left: "75%", delay: "0.8s", size: 5,  color: "#f472b6" },
      { left: "35%", delay: "1.2s", size: 7,  color: "#fda4af" },
    ],
    animName: "petal-fall",
  },
  {
    slug: "cartoon",
    label: "Cartoon",
    accent: "#4ade80",
    glow: "rgba(74,222,128,0.35)",
    css: `
      @keyframes leaf-drift {
        0%   { transform: translateY(-20px) translateX(0px) rotate(0deg); opacity: 0; }
        20%  { opacity: 1; }
        100% { transform: translateY(80px) translateX(15px) rotate(180deg); opacity: 0; }
      }
    `,
    particles: [
      { left: "15%", delay: "0s",   size: 8,  color: "#4ade80" },
      { left: "45%", delay: "0.5s", size: 6,  color: "#86efac" },
      { left: "70%", delay: "1s",   size: 9,  color: "#4ade80" },
      { left: "30%", delay: "1.5s", size: 5,  color: "#bbf7d0" },
    ],
    animName: "leaf-drift",
  },
  {
    slug: "horror",
    label: "Horror",
    accent: "#ef4444",
    glow: "rgba(239,68,68,0.35)",
    css: `
      @keyframes ash-float {
        0%   { transform: translateY(80px) rotate(0deg); opacity: 0; }
        20%  { opacity: 0.7; }
        100% { transform: translateY(-20px) rotate(90deg); opacity: 0; }
      }
    `,
    particles: [
      { left: "20%", delay: "0s",   size: 4,  color: "#9ca3af" },
      { left: "55%", delay: "0.6s", size: 5,  color: "#6b7280" },
      { left: "80%", delay: "1.1s", size: 3,  color: "#9ca3af" },
      { left: "40%", delay: "1.7s", size: 4,  color: "#d1d5db" },
    ],
    animName: "ash-float",
  },
  {
    slug: "comedy",
    label: "Comedy",
    accent: "#facc15",
    glow: "rgba(250,204,21,0.35)",
    css: `
      @keyframes confetti-fall {
        0%   { transform: translateY(-20px) rotate(0deg); opacity: 0; }
        20%  { opacity: 1; }
        100% { transform: translateY(80px) rotate(720deg); opacity: 0; }
      }
    `,
    particles: [
      { left: "10%", delay: "0s",   size: 6,  color: "#facc15" },
      { left: "40%", delay: "0.3s", size: 5,  color: "#f87171" },
      { left: "65%", delay: "0.7s", size: 7,  color: "#60a5fa" },
      { left: "85%", delay: "1.1s", size: 5,  color: "#4ade80" },
    ],
    animName: "confetti-fall",
  },
  {
    slug: "action",
    label: "Action",
    accent: "#f97316",
    glow: "rgba(249,115,22,0.35)",
    css: `
      @keyframes ember-rise {
        0%   { transform: translateY(80px) scale(1); opacity: 0; }
        30%  { opacity: 1; }
        100% { transform: translateY(-20px) scale(0.3); opacity: 0; }
      }
    `,
    particles: [
      { left: "25%", delay: "0s",   size: 5,  color: "#f97316" },
      { left: "50%", delay: "0.4s", size: 7,  color: "#fb923c" },
      { left: "70%", delay: "0.9s", size: 4,  color: "#fbbf24" },
      { left: "35%", delay: "1.4s", size: 6,  color: "#f97316" },
    ],
    animName: "ember-rise",
  },
  {
    slug: "romance",
    label: "Romance",
    accent: "#fb7185",
    glow: "rgba(251,113,133,0.35)",
    css: `
      @keyframes heart-float {
        0%   { transform: translateY(60px) scale(0.8); opacity: 0; }
        30%  { opacity: 1; }
        100% { transform: translateY(-20px) scale(1.2); opacity: 0; }
      }
    `,
    particles: [
      { left: "20%", delay: "0s",   size: 8,  color: "#fb7185" },
      { left: "50%", delay: "0.5s", size: 6,  color: "#fda4af" },
      { left: "75%", delay: "1s",   size: 9,  color: "#fb7185" },
      { left: "38%", delay: "1.5s", size: 7,  color: "#fecdd3" },
    ],
    animName: "heart-float",
  },
  {
    slug: "scifi",
    label: "Sci-Fi",
    accent: "#818cf8",
    glow: "rgba(129,140,248,0.35)",
    css: `
      @keyframes dot-twinkle {
        0%, 100% { opacity: 0.1; transform: scale(1); }
        50%       { opacity: 1;   transform: scale(1.5); }
      }
    `,
    particles: [
      { left: "15%", delay: "0s",   size: 4,  color: "#818cf8" },
      { left: "40%", delay: "0.6s", size: 3,  color: "#c7d2fe" },
      { left: "65%", delay: "1.2s", size: 5,  color: "#818cf8" },
      { left: "82%", delay: "0.3s", size: 3,  color: "#a5b4fc" },
    ],
    animName: "dot-twinkle",
  },
];

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { ease: [0.25, 0.46, 0.45, 0.94], duration: 0.5 } },
};

export default function GenreBanner() {
  const router = useRouter();

  return (
    <section className="px-4 py-6 md:px-8">
      <motion.h2
        className="mb-4 text-lg font-semibold md:text-xl"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.5 }}
      >
        Browse by Genre
      </motion.h2>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-50px" }}
        className="flex gap-3 overflow-x-auto pb-2"
        style={{ scrollbarWidth: "none" }}
      >
        {genres.map((genre) => (
          <motion.button
            key={genre.slug}
            variants={cardVariants}
            whileHover={{
              scale: 1.06,
              boxShadow: `0 0 24px 0 ${genre.glow}`,
              transition: { type: "spring", stiffness: 60, damping: 20 },
            }}
            onClick={() => router.push(`/${genre.slug}`)}
            className="relative flex-shrink-0 overflow-hidden rounded-2xl"
            style={{
              width: "clamp(140px, 18vw, 180px)",
              height: "clamp(170px, 22vw, 220px)",
              background: "rgba(255,255,255,0.05)",
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
              border: "1px solid rgba(255,255,255,0.10)",
              minWidth: 140,
            }}
          >
            {/* CSS animation preview */}
            <style>{genre.css}</style>
            <div className="absolute inset-0 overflow-hidden">
              {genre.particles.map((p, i) => (
                <span
                  key={i}
                  className="absolute rounded-full"
                  style={{
                    left: p.left,
                    top: "10%",
                    width: p.size,
                    height: p.size,
                    background: p.color,
                    animation: `${genre.animName} 2.4s ${p.delay} infinite ease-in-out`,
                  }}
                />
              ))}
            </div>

            {/* Label */}
            <div className="absolute bottom-0 left-0 right-0 px-3 pb-4">
              <p
                className="text-sm font-bold"
                style={{ color: genre.accent }}
              >
                {genre.label}
              </p>
            </div>
          </motion.button>
        ))}
      </motion.div>
    </section>
  );
}
