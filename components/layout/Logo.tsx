"use client";

import { GraduationCap, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export function Logo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizes = {
    sm: { icon: 24, text: "text-xl" },
    md: { icon: 32, text: "text-2xl" },
    lg: { icon: 48, text: "text-4xl" },
  };

  const currentSize = sizes[size];

  return (
    <motion.div
      className="flex items-center gap-2 cursor-pointer select-none"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <div className="relative">
        <motion.div
          animate={{
            rotate: [0, -10, 10, -10, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatDelay: 3,
          }}
        >
          <GraduationCap
            size={currentSize.icon}
            className="text-docker"
            strokeWidth={2.5}
          />
        </motion.div>
        <motion.div
          className="absolute -top-1 -right-1"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.7, 1, 0.7],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
        >
          <Sparkles
            size={currentSize.icon * 0.4}
            className="text-docker"
            fill="currentColor"
          />
        </motion.div>
      </div>
      <h2
        className={`text-docker dark:text-white ${currentSize.text} font-black tracking-tight`}
      >
        Tutorcito
      </h2>
    </motion.div>
  );
}
