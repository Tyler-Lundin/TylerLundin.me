import clsx from "clsx";
import Link from "next/link";


export default function RetroLink({
  label,
  onClick,
  linkTo,
}: {
  label: string,
  onClick?: () => void,
  linkTo?: string,
}) {
  return (
    <Link target={'_self'} href={linkTo || '#'}
      className={clsx(
        'tracking-wider px-2 py-1 relative',
        'transition-all duration-300 overflow-hidden h-fit w-full hover:bg-transparent',
        'rounded-md text-black text-left text-3xl lg:text-5xl self-middle uppercase hover:text-white',
        'hover:bg-transparent hover:text-zinc-900 dark:hover:text-white',
        'focus:bg-transparent focus:text-zinc-900 dark:focus:text-white',
        'active:bg-transparent active:text-zinc-900 dark:active:text-white',
        'font-black bg-zinc-900 text-white dark:bg-zinc-200 dark:text-zinc-900',
      )}> {label}
    </Link>
  )
}
