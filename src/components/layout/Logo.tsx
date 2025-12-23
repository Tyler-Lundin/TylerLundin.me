import Link from "next/link";
import { Sora } from "next/font/google";

const sora = Sora({ subsets: ["latin"], display: "swap" });



export function OrbitDotMark() {
  return (
    <span className="relative inline-flex h-6 w-6 items-center justify-center">

      {/* core dot */}
      <span className="h-2 w-2 rounded-full bg-indigo-500/90 group-hover:bg-indigo-500 transition-colors duration-300" />

      {/* orbit ring */}
      <span className="absolute inset-0 rounded-full  border border-neutral-950/20 dark:border-white/20 opacity-80" />

      {/* rotating satellite */}
      <span className="orbit absolute inset-0">
        <span className="scaling satellite absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 h-1.5 w-1.5  rounded-full bg-emerald-400 dark:bg-emerald-400 group-hover:bg-indigo-500/70 dark:group-hover:bg-indigo-300/70 transition-colors duration-300" />
      </span>

      <style jsx>{`
        .orbit {
          animation: tyler-orbit 10s linear infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .orbit {
            animation: none;
          }
        }
        @keyframes tyler-orbit {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .scaling {
  animation: orbit-scaling 10s linear infinite;
}

@media (prefers-reduced-motion: reduce) {
  .scaling {
    animation: none;
  }
}

@keyframes orbit-scaling {
  from {
    transform: scale(.8);
  }
  50% {
    transform: scale(1.5)
  }
  to {
    transform: scale(.8);
  }
}

      `}</style>
    </span>
  );
}

export function Logo() {
  return (
    <Link
      href="/"
      className={`group inline-flex items-center gap-2 pt-1 select-none ${sora.className}`}
      aria-label="tylerweb.dev"
    >
      <OrbitDotMark />

      <div className="flex items-baseline gap-1">
        <span className="text-[15px] lg:text-base font-semibold tracking-[-0.02em] text-neutral-950 dark:text-white">
          tylerweb
        </span>
        <span className="text-[13px] lg:text-sm font-semibold tracking-[0.08em] text-neutral-900/55 dark:text-white/55 group-hover:text-indigo-500 dark:group-hover:text-indigo-300 transition-colors duration-300">
          .dev
        </span>
      </div>
    </Link>
  );
}

