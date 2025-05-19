import Link from 'next/link';
import { Roboto } from 'next/font/google';

const roboto = Roboto({
  weight: ['200', '300', '400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
})

export function Logo() {
  return (
    <Link href="/" className="group inline-block">
      <div className="flex items-baseline space-x-1">
        <span style={{ fontFamily: roboto.style.fontFamily }} className="text-xl lg:text-3xl font-light tracking-tight text-neutral-900 dark:text-white group-hover:text-white transition-colors duration-300">
          Tyler
        </span>
        <span style={{ fontFamily: roboto.style.fontFamily }} className="text-xl lg:text-3xl font-light tracking-tight text-neutral-900 dark:text-white group-hover:text-indigo-400 transition-colors duration-300">
          Lundin
        </span>
        <span style={{ fontFamily: roboto.style.fontFamily }} className="text-sm lg:text-base font-thin text-indigo-700 dark:text-emerald-300 group-hover:text-indigo-300 transition-colors duration-300">
          .me
        </span>
      </div>
      <div className="mt-0.5 h-0.5 w-full bg-indigo-500/40 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300" />
    </Link>
  );
}
