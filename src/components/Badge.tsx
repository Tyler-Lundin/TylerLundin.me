import Image from "next/image";
import TerminalBanner from "./TerminalBanner";
import { motion } from "framer-motion";

export function Badge({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      animate={{
        y: [0, -10, 0],
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      <div className="relative w-[320px] sm:w-[400px] h-[480px] sm:h-[600px] mx-auto">
        {/* SVG background with cutout */}
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 400 600"
          xmlns="http://www.w3.org/2000/svg"
          className="absolute top-0 left-0 w-full h-full shadow-lg border border-black/25 dark:border-white/25 rounded-2xl"
        >
          <defs>
            <mask className='' id="pillCutout">
              {/* Full white = visible */}
              <rect width="400" height="600" fill="white" />
              {/* Black = cutout */}
              <rect x="150" y="15" width="100" height="20" rx="10" ry="10" fill="black" />
            </mask>
          </defs>

          <rect
            width="400"
            height="600"
            fill="rgba(199, 199, 199, 0.75)"
            mask="url(#pillCutout)"
            rx="12"
          />
        </svg>

        {/* Content inside badge */}
        <div className="absolute inset-0 flex flex-col items-center justify-center px-4">
          {children}
          <small className="text-xs sm:text-md -z-10 absolute left-3 -translate-x-1/2 -rotate-90 whitespace-nowrap font-thin text-black dark:text-white/50">
          CLEARANCE LVL: MEDIOCRE • EXPIRES: NEVER
          </small>
          <small className="text-xs sm:text-md -z-10 absolute right-3 translate-x-1/2 rotate-90 whitespace-nowrap font-thin text-black dark:text-white/50">
          AUTHORIZED PERSONNEL ONLY • TYLER&apos;S LAB A12-04
          </small>
        </div>
      </div>
    </motion.div>
  );
}

export function BadgeContent() {
  return (
    <>
      {/* Profile Image with Glass Effect */}
      <div className="relative w-24 h-24 sm:w-32 sm:h-32 mx-auto">
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 blur-xl" />
        <div className="relative w-full h-full rounded-full overflow-hidden border border-black/25 backdrop-blur-sm">
          <Image
            src="/images/tyler.png"
            alt="Tyler"
            fill
            className="object-cover"
          />
        </div>
      </div>

      {/* Name with Glass Effect */}
      <h1 className="text-4xl sm:text-5xl font-black text-neutral-800 tracking-tight text-center">
        <span className="relative">
          Tyler <br/> Lundin
          <span className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 blur-xl -z-10" />
        </span>
      </h1>
      <TerminalBanner />
    </>
  )
}