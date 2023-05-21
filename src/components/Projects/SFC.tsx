'use client';
import useFonts from "@/hooks/useFonts";
import clsx from "clsx";
import Section from "../Page/Section";
import { TbBrandNextjs } from 'react-icons/tb';
import { SiTailwindcss, SiMongodb, SiDaisyui } from 'react-icons/si';

const LINKS = [
  { href: 'https://suncrest-fitness-center.vercel.app/', text: 'Live Site' },
  { href: 'https://youtube.com/', text: 'Video' },
  { href: '', text: 'Source Code' },
]

const DESCRIPTION = [
  'A website for a local gym.',
  'Built with Next.js, Tailwind CSS, and MongoDB.',
  'Features a blog, class schedule, and contact form.',
]

const ICON_STYLE = "text-6xl text-black dark:text-zinc-200"
const BUILT_WITH = [
  { href: 'https://nextjs.org/', text: 'Next.js', icon: <TbBrandNextjs className={ICON_STYLE} /> },
  { href: 'https://tailwindcss.com/', text: 'Tailwind CSS', icon: <SiTailwindcss className={ICON_STYLE} /> },
  { href: 'https://www.mongodb.com/', text: 'MongoDB', icon: <SiMongodb className={ICON_STYLE} /> },
  { href: 'https://daisyui.com/', text: 'DaisyUI', icon: <SiDaisyui className={ICON_STYLE} /> },
]


export default function SFC() {
  const { a } = useFonts();
  return (
    <Section>
      <div className="grid p-8 place-content-center items-center gap-8 dark:bg-zinc-900 border border-emerald-400 bg-zinc-100 rounded-lg">
        <h2 className={clsx('text-3xl text-center uppercase font-black text-black dark:text-zinc-200', a.className)}> Suncrest Fitness Center </h2>
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
