import useNavigation from "@/hooks/useNavigation";
import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { name: 'home', href: '/' },
  { name: 'about me', href: '/about' },
  // { name: 'reviews', href: '/reviews' },
  { name: 'blog', href: '/blog' },
  { name: 'contact me', href: '/contact' },
];

export default function Links() {
  const
    Inactive = 'transition-all ease-in-out py-2 dark:hover:text-emerald-400 hover:font-black',
    Active = 'transition-all ease-in-out py-3 text-black font-black dark:text-emerald-400 hover:opacity-100',
    pathname = usePathname(),
    { handleToggle } = useNavigation();

  return (
    <ul className={clsx('text-4xl font-thin py-4 w-fit')}>
      {
        LINKS.map(({ name, href }, index) => (
          <li onClick={handleToggle} key={`${name} ${index}`} className={`${pathname === href ? Active : Inactive}`}>
            <Link href={href} > {name} </Link>
          </li>
        ))
      }
    </ul>
  )
}
