import { SiRedux, SiReact, SiStyledcomponents, SiFirebase } from 'react-icons/si';
import ProjectCard from "../ProjectCard";

const LINKS = [
  { href: "https://myjournal.app/", text: "Live Site" },
  { href: "https://github.com/Tyler-Lundin/my-journal", text: "Source Code" },
  // { href: "https://www.youtube.com/watch?v=3hLmDS179YE", text: "Video" },
]

const DESCRIPTION = [
  "A minimal journaling app.",
  "Built with React, Styled Components, and Firebase.",
  "This was my first \"completed\" react project.",
]

const ICON_STYLE = "text-lg text-black"
const BUILT_WITH = [
  { href: 'https://reactjs.org/', text: 'React', icon: <SiReact className={ICON_STYLE} /> },
  { href: 'https://firebase.google.com/', text: 'Firebase', icon: <SiFirebase className={ICON_STYLE} /> },
  { href: 'https://redux.js.org/', text: 'Redux', icon: <SiRedux className={ICON_STYLE} /> },
  { href: 'https://styled-components.com/', text: 'Styled C..', icon: <SiStyledcomponents className={ICON_STYLE} /> },
]

export default function MyJournal() {
  return (
    <ProjectCard title={'My Journal'} description={DESCRIPTION} links={LINKS} builtWith={BUILT_WITH} />
  )
}
