import useFonts from "@/hooks/useFonts";
import clsx from "clsx";
import LargeLink from "../LargeLink";
import SmallLink from "../SmallLink";


const LARGE_LINKS = [
  { linkTo: '/projects', label: 'Projects' },
  { linkTo: '/blog', label: 'Blog' },
  { linkTo: '/gallery', label: 'Photo Gallery' },
]

const SMALL_LINKS = [
  { label: 'CONTACT', linkTo: '/contact' },
  { label: 'SOCIALS', linkTo: '/socials' },
  { label: 'REVIEWS', linkTo: '/reviews' },
]

export default function HeroMenu() {
  const { a, b, c } = useFonts();
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
