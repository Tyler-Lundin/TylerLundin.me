import clsx from 'clsx';
import Link from 'next/link';
import { AiOutlineArrowLeft } from 'react-icons/ai';

export default function BackButton({ href }: { href: string }) {

  return (
    <Link href={href} className={clsx(
      'fixed top-16 left-0 flex text-2xl text-black dark:text-white hover:text-gray-300 items-center p-4 bg-zinc-500 border-b border-r border-emerald-400 rounded-br-md dark:bg-zinc-600',
    )}>
      <AiOutlineArrowLeft />
    </Link>
  )
}
