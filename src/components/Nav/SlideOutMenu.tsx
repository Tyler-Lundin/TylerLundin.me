import useNavigation from "@/hooks/useNavigation";
import clsx from "clsx";
import Links from "./Links";



export default function SlideOutMenu() {
  const { isNavOpen } = useNavigation()

  return (
    <nav className={clsx(
      'transition-all p-8 ease-in-out w-screen min xl:w-1/4 h-screen fixed top-0 right-0 z-[41] bg-emerald-400 dark:bg-emerald-500',
      isNavOpen ? 'translate-x-0' : 'translate-x-full'
    )}>
      {isNavOpen && <Links />}
    </nav>
  )
}
