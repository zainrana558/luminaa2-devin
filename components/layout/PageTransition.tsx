"use client";

import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

const variants = {
  hidden:  { opacity: 0, y: 12, filter: "blur(3px)" },
  visible: { opacity: 1, y: 0,  filter: "blur(0px)" },
  exit:    { opacity: 0, y: -8, filter: "blur(2px)" },
};

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        variants={variants}
        initial="hidden"
        animate="visible"
        exit="exit"
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
