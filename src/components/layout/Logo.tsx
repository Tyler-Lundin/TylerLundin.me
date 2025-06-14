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
        <span style={{ fontFamily: roboto.style.fontFamily }} className="text-md font-light tracking-tight text-neutral-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-300">
          tyler
        </span>
        <span style={{ fontFamily: roboto.style.fontFamily }} className="text-md font-light tracking-tight text-neutral-900 dark:text-white group-hover:text-indigo-500 dark:group-hover:text-indigo-300 transition-colors duration-300">
          web
        </span>
        <span style={{ fontFamily: roboto.style.fontFamily }} className="text-sm lg:text-base font-thin text-indigo-700 dark:text-emerald-400 group-hover:text-indigo-600 dark:group-hover:text-emerald-300 transition-colors duration-300">
          .dev
        </span>
      </div>
      <div className="mt-0.5 h-0.5 w-full bg-indigo-500/40 dark:bg-indigo-400/40 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300" />
    </Link>
  );
}
