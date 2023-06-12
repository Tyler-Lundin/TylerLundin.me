'use client';
import useFonts from "@/hooks/useFonts";
import clsx from "clsx";
import SocialMediaLinks from "../SocialMediaLinks";
import HeroMenu from "./HeroMenu";
import { motion } from "framer-motion";


export default function Hero() {
  const { a, c } = useFonts();
  return (
    <motion.div
      role="presentation"
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={clsx(
        'w-fit h-fit backdrop-blur-2xl p-8 rounded-xl pt-8',
      )}>
      <h1 className={clsx('text-5xl w-fit lg:text-8xl text-center uppercase font-black text-black dark:text-zinc-200', c.className)}> Tyler Lundin </h1>
      <h2 className={clsx('w-full h-fit mx-auto  text-xl bg-emerald-400 text-black font-black lg:text-2xl text-center rounded-md uppercase my-2 ', a.className)}> Modern Web Developer </h2>
      <motion.div
        initial={{ y: 75, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.75 }}
        className={clsx('w-full h-fit mx-auto text-center')}>
        <HeroMenu />
      </motion.div>
      <SocialMediaLinks />
    </motion.div>
  )
}
