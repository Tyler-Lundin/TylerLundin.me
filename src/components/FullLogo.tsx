'use client';
import clsx from "clsx";
import Link from "next/link";
import Logo from "./Logo"

export default function FullLogo() {
  return (
    <Link href={'/'} className={clsx(
      'p-1 transition-all flex h-fit',
      'gap-2 w-fit cursor-pointer',
      'absolute top-1/2 left-4 md:left-8 lg:left-16 xl:left-24 -translate-y-1/2',
    )}>

      <Logo width={30} height={30} className={'transition-all'} />
      <h1 className={clsx('text-xl dark:text-white text-black font-black uppercase transition-all self-center')}>Tyler Lundin</h1>
    </Link>
  )
}
