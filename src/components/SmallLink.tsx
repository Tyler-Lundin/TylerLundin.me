import clsx from "clsx";
import Link from "next/link";

export default function SmallLink({
  label,
  linkTo,
}: {
  label: string,
  linkTo: string,
}) {
  return (
    <Link href={linkTo} className={clsx(
      'bg-black text-zinc-200 dark:bg-zinc-200 dark:text-black',
      'px-2 py-1',
      'rounded-sm transition-all duration-300 ease-in-out',
      'hover: bg-zinc-200 dark:hover:bg-black hover:text-black dark:hover:text-zinc-200',
    )}>
      {label}
    </Link>
  )
}
