import useFonts from "@/hooks/useFonts";
import clsx from "clsx";
import LargeLink from "../LargeLink";


const LARGE_LINKS = [
  { linkTo: '/projects', label: 'Projects' },
  { linkTo: '/blog', label: 'Blog' },
  { linkTo: '/gallery', label: 'Gallery' },
]


export default function HeroMenu() {
  const { a } = useFonts();
  return (
    <>
      <ul className={clsx('grid gap-1 h-fit w-full ', a.className)}>
        {LARGE_LINKS.map((button, i) => (
          <LargeLink key={i} linkTo={button.linkTo} label={button.label} />
        ))}
      </ul>
    </>
  )
}
