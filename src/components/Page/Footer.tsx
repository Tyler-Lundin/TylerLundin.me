'use client';
import useNavigation from "@/hooks/useNavigation";
import clsx from "clsx";
import Links from "../Nav/Links";
import Smiley from "../Smiley";

export default function Footer() {
  const { isNavOpen } = useNavigation();
  const YEAR = new Date().getFullYear();
  return (
    <div className={clsx(
      'w-full h-fit bg-emerald-400 dark:bg-black px-8 pb-8 grid text-left transition-all',
      isNavOpen && 'w-screen md:w-2/3 lg:w-3/4',
    )}>
      <span className={'grid place-content-center items-center '}>
        <span className={'text-4xl w-fit font-bold justify-self-center bg-slate-200 dark:bg-zinc-900 rounded-full p-3 -translate-y-1/2'}>
          <Smiley />
        </span>
        <h2 className={'text-center dark:text-white font-light'}>
          © {YEAR} Tyler Lundin. All rights reserved.
        </h2>
        <h2 className={'text-center dark:text-white font-light'}>
          Site built with Next.js, Tailwind CSS, and TypeScript.
        </h2>
        <h2 className={' text-center dark:text-white font-light'}>
          Thanks for visiting!
        </h2>
      </span>
    </div>
  )
}

