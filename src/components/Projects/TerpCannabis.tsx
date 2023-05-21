import useFonts from "@/hooks/useFonts";
import clsx from "clsx";
import Section from "../Page/Section";


export default function TerpCannabis() {
  const { c } = useFonts();
  return (
    <Section>
      <h2 className={clsx('text-3xl text-center uppercase font-black text-black dark:text-zinc-200', c.className)}> Terp Cannabis </h2>
      <Section>
        <h3 className={clsx('text-2xl text-center uppercase font-black text-black dark:text-zinc-200', c.className)}> </h3>
      </Section>
    </Section>
  )
}
