'use client';
import useNavigation from "@/hooks/useNavigation";
import clsx from "clsx";
import Links from "../Nav/Links";
import Smiley from "../Smiley";

export default function Footer() {
  const { isNavOpen } = useNavigation();
  return (
    <div className={clsx(
      'w-full h-fit bg-emerald-400 dark:bg-black px-8 pb-8 grid text-left transition-all',
      isNavOpen && 'w-screen md:w-2/3 lg:w-3/4',
    )}>
      <span className={'flex place-content-center items-center gap-8'}>
        <h2 className={'text-center dark:text-white font-light'}>
          © 2021 Tyler Lundin
        </h2>
        <span className={'text-4xl font-bold bg-slate-200 dark:bg-zinc-900 rounded-full p-4 -translate-y-1/2'}>
          <Smiley />
        </span>
        <h2 className={' text-center dark:text-white font-light'}>
          Thanks for visiting!
        </h2>
      </span>
    </div>
  )
}

