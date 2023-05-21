import useFonts from "@/hooks/useFonts";
import clsx from "clsx";
import Section from "./Page/Section";

type ProjectCardProps = {
  title: string;
  description: string[];
  links: { href: string; text: string; }[];
  builtWith: { href: string; text: string; icon: JSX.Element; }[];
}

export default function ProjectCard({ title, description, links, builtWith }: ProjectCardProps) {
  const { a } = useFonts();

  return (
    <Section>
      <div className="grid p-8 place-content-center items-center dark:bg-zinc-900 border border-emerald-400 bg-zinc-100 rounded-lg">
        <h2 className={clsx('text-xl text-center uppercase font-black text-black dark:text-zinc-200', a.className)}> {title} </h2>
        <div className={'flex place-content-center gap-3 items-center font-light my-4'}>
          {links.map(({ href, text }, i) => (
            <a className={clsx("hover:font-black transition-all text-lg", i === 0 && 'text-emerald-400', a.className)} href={href} target="_blank" key={href}> {text} </a>
          ))}
        </div>
        <div className={'flex place-content-center gap-3 items-center font-light flex-wrap'}>
          {builtWith.map(({ href, text, icon }) => (
            <a href={href} target="_blank" key={href}>
              <span className={clsx("text-sm text-black bg-emerald-400 px-2 items-center rounded-lg flex gap-1", a.className)}> {icon} <small>{text}</small> </span>
            </a>
          ))}
        </div>
        <ul className={'py-2'}>
          {description.map((text, i) => (
            <li key={i} className={clsx('text-sm text-black dark:text-zinc-200', a.className)}> <small>{text}</small> </li>
          ))}
        </ul>
      </div>
    </Section>

  )
}
