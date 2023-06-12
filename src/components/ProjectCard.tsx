import useFonts from "@/hooks/useFonts";
import clsx from "clsx";
import { BsHandThumbsDown, BsHandThumbsUp } from "react-icons/bs";
import Section from "./Page/Section";

type ProjectCardProps = {
  title: string;
  description: string[];
  links: { href: string; text: string; icon?: JSX.Element }[];
  builtWith: { href: string; text: string; icon: JSX.Element; }[];
}

export default function ProjectCard({ title, description, links, builtWith }: ProjectCardProps) {
  const { a } = useFonts();


  return (
    <Section>
      <div className="grid p-3 md:p-6 lg:p-8 w-full max-w-xl h-full items-center dark:bg-zinc-700 border border-emerald-400 bg-zinc-300 rounded-lg">
        <h2 className={clsx('text-xl lg:text-3xl uppercase dark:text-emerald-400 font-black', a.className)}> {title} </h2>
        <div className={'flex  gap-3 items-center font-light my-4'}>
          {links.map(({ href, text, icon }) => (
            <a className={clsx("dark:hover:bg-emerald-400 hover:bg-emerald-400 transition-all text-lg flex items-center gap-2 bg-black text-white px-2 rounded-lg dark:bg-white dark:text-black", a.className)} href={href} target="_blank" key={href}>{text} {icon} </a>
          ))}
        </div>
        <div className={'flex  gap-3 items-center font-light flex-wrap'}>
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
        <hr className={'my-4 border-black dark:border-emerald-400'} />
        <ul className={'flex gap-2'}>
          <li> <button className="flex items-center gap-2 hover:bg-black hover:text-zinc-300 text-black dark:text-white px-2 py-1 rounded-lg"><BsHandThumbsUp /> Like  </button> </li>
          <li> <button className="flex items-center gap-2 hover:bg-black hover:text-zinc-300 text-black dark:text-white px-2 py-1 rounded-lg"><BsHandThumbsDown /> Dislike  </button> </li>
        </ul>
      </div>
    </Section>

  )
}
