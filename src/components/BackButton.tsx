import clsx from 'clsx';
import Link from 'next/link';
import { AiOutlineArrowLeft } from 'react-icons/ai';

export default function BackButton({ href }: { href: string }) {

  return (
    <Link href={href} className={clsx(
      'fixed top-16 left-0 flex text-2xl text-black hover:opacity-50 focus:opacity-50 items-center p-4 border-black dark:border-white border-b border-r bg-emerald-400 rounded-br-md z-50',
    )}>
      <AiOutlineArrowLeft />
    </Link>
  )
}
