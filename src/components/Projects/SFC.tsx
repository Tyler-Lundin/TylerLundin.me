import { TbBrandNextjs } from 'react-icons/tb';
import { SiTailwindcss, SiMongodb, SiDaisyui } from 'react-icons/si';
import ProjectCard from "../ProjectCard";

const LINKS = [
  { href: 'https://suncrest-fitness-center.vercel.app/', text: 'Live Site' },
  { href: 'https://github.com/Tyler-Lundin/SuncrestFitnessCenter', text: 'Source Code' },
]

const DESCRIPTION = [
  'A website for a local gym.',
  'Built with Next.js, Tailwind CSS, and MongoDB.',
  'Features a blog, class schedule, and contact form.',
]

const ICON_STYLE = "text-lg text-black"
const BUILT_WITH = [
  { href: 'https://nextjs.org/', text: 'Next.js', icon: <TbBrandNextjs className={ICON_STYLE} /> },
  { href: 'https://tailwindcss.com/', text: 'Tailwind CSS', icon: <SiTailwindcss className={ICON_STYLE} /> },
  { href: 'https://www.mongodb.com/', text: 'MongoDB', icon: <SiMongodb className={ICON_STYLE} /> },
  { href: 'https://daisyui.com/', text: 'DaisyUI', icon: <SiDaisyui className={ICON_STYLE} /> },
]


export default function SFC() {
  return (
    <ProjectCard title={'Suncrest Fitness Center'} description={DESCRIPTION} links={LINKS} builtWith={BUILT_WITH} />
  )
}
