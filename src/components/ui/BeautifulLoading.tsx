"use client";

import React from 'react';
import { motion } from 'framer-motion';

export default function BeautifulLoading({ message = "Verifying session..." }: { message?: string }) {
  return (
    <div className="fixed inset-0 z-[10002] flex flex-col items-center justify-center bg-white dark:bg-black overflow-hidden">
      {/* Background fluid elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30 dark:opacity-20">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 180, 270, 360],
            x: [0, 50, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-blue-400/20 blur-[100px] rounded-full"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            rotate: [360, 270, 180, 90, 0],
            x: [0, -50, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] bg-purple-400/20 blur-[100px] rounded-full"
        />
      </div>

      <div className="relative flex flex-col items-center">
        {/* Main Logo/Icon Placeholder with Fluid Ring */}
        <div className="relative w-32 h-32 flex items-center justify-center">
          <motion.div
            animate={{
              rotate: 360,
              borderRadius: ["30% 70% 70% 30% / 30% 30% 70% 70%", "50% 50% 20% 80% / 25% 80% 20% 75%", "30% 70% 70% 30% / 30% 30% 70% 70%"]
            }}
            transition={{
              rotate: { duration: 10, repeat: Infinity, ease: "linear" },
              borderRadius: { duration: 5, repeat: Infinity, ease: "easeInOut" }
            }}
            className="absolute inset-0 border-2 border-blue-500/30 dark:border-blue-400/30"
          />
          <motion.div
            animate={{
              rotate: -360,
              borderRadius: ["50% 50% 20% 80% / 25% 80% 20% 75%", "30% 70% 70% 30% / 30% 30% 70% 70%", "50% 50% 20% 80% / 25% 80% 20% 75%"]
            }}
            transition={{
              rotate: { duration: 15, repeat: Infinity, ease: "linear" },
              borderRadius: { duration: 7, repeat: Infinity, ease: "easeInOut" }
            }}
            className="absolute inset-2 border-2 border-purple-500/30 dark:border-purple-400/30"
          />
          
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="z-10"
          >
            <div className="w-16 h-16 relative">
               <img src="/images/brain-icon.webp" alt="Loading..." className="w-full h-full object-contain filter drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="mt-8 text-center"
        >
          <h2 className="text-xl font-medium tracking-tight text-neutral-900 dark:text-white mb-2">
            {message}
          </h2>
          <div className="flex gap-1 justify-center">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{
                  opacity: [0.3, 1, 0.3],
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
                className="w-1.5 h-1.5 rounded-full bg-blue-500"
              />
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
