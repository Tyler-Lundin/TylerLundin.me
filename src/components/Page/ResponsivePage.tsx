'use client';
import { ReactNode } from "react";
import { Inter } from 'next/font/google';
import useNavigation from "@/hooks/useNavigation";
import clsx from "clsx";
import { motion } from 'framer-motion'
import { usePathname } from "next/navigation";

const inter = Inter({ subsets: ['latin'], weight: 'variable' })

export default function ResponsivePage({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const { isNavOpen } = useNavigation();
  return (
    <motion.main
      key={pathname}
      initial="initialState"
      animate="animateState"
      exit="exitState"
      transition={{
        duration: 0.75,
      }}
      variants={{
        initialState: {
          opacity: 0,
          clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
        },
        animateState: {
          opacity: 1,
          clipPath: "polygon(0 0, 100% 0, 100% 100%, 0% 100%)"
        },
        exitState: {
          clipPath: "polygon(50% 0, 50% 0, 50% 100%, 50% 100%)"
        },
      }}
      className={clsx(
        'w-screen h-fit min-h-[calc(100vh_-_4rem)] overflow-x-hidden transition-all ease-in-out',
        'grid place-items-center',
        isNavOpen && 'w-screen md:w-2/3 lg:w-3/4',
        inter.className,
      )}>
      {children}
    </motion.main>
  )
}

