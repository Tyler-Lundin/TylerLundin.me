'use client';
import useFonts from "@/hooks/useFonts";
import clsx from "clsx";
import Section from "../Page/Section";
import { SiRedux, SiReact, SiStyledcomponents, SiFirebase } from 'react-icons/si';

const LINKS = [
  { href: "https://myjournal.app/", text: "Live Site" },
  { href: "https://www.youtube.com/watch?v=3hLmDS179YE", text: "Video" },
  { href: "https://github.com/Tyler-Lundin/my-journal", text: "Source Code" },
]

const DESCRIPTION = [
  "A journaling app.",
  "Built with React, Styled Components, and Firebase.",
  "This was my first \"completed\" react project.",
]

const ICON_STYLE = "text-6xl text-black dark:text-zinc-200"
const BUILT_WITH = [
  { href: 'https://reactjs.org/', text: 'React', icon: <SiReact className={ICON_STYLE} /> },
  { href: 'https://firebase.google.com/', text: 'Firebase', icon: <SiFirebase className={ICON_STYLE} /> },
  { href: 'https://redux.js.org/', text: 'Redux', icon: <SiRedux className={ICON_STYLE} /> },
  { href: 'https://styled-components.com/', text: 'Styled C..', icon: <SiStyledcomponents className={ICON_STYLE} /> },
]

export default function MyJournal() {
  const { a } = useFonts();

  return (
    <Section>
      <div className="grid p-8 place-content-center items-center gap-8 dark:bg-zinc-900 dark:shadow-emerald-400 shadow-zinc-500 shadow-xl bg-zinc-100 rounded-lg">
        <h2 className={clsx('text-3xl text-center uppercase font-black text-black dark:text-zinc-200', a.className)}> My Journal </h2>
        <ul className={'text-center'}>
          {DESCRIPTION.map((text, i) => (
            <li key={i} className={clsx('text-lg text-black dark:text-zinc-200', a.className)}> {text} </li>
          ))}
        </ul>
        <div className={'flex place-content-center gap-3 items-center font-thin'}>
          {LINKS.map(({ href, text }) => (
            <a className={clsx("  text-lg", a.className)} href={href} target="_blank" key={href}> {text} </a>
          ))}
        </div>
        <div className={'flex place-content-center gap-3 items-center font-thin'}>
          {BUILT_WITH.map(({ href, text, icon }) => (
            <a href={href} target="_blank" key={href}>
              <span className={'grid place-content-center justify-items-center gap-1 items-center'}>
                {icon}
                <span className={clsx("  text-lg", a.className)}> {text} </span>
              </span>
            </a>
          ))}
        </div>
      </div>
    </Section>
  )
}
