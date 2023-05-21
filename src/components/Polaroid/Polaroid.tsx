'use client';
import { Permanent_Marker } from "next/font/google";
import Image from "next/image";
import Tilt from 'react-parallax-tilt'

const marker = Permanent_Marker({ weight: '400', subsets: ['latin'] })

const
  PolaroidHover = 'hover:scale-105 shadow-black shadow-sm hover:shadow-2xl hover:bg-white',
  PolaroidBG = `${PolaroidHover} transition-all ease-in-out aspect-square relative overflow-hidden flex pb-[3rem] px-2 pt-3 bg-zinc-100 rounded-sm `;

export default function Polaroid({
  src,
  alt,
  className = '',
}: {
  src: string,
  alt: string,
  className?: string,
}) {

  if (!src) return (<div className={PolaroidBG} />)

  return (
    <Tilt>
      <div className={PolaroidBG}>
        <Image
          src={src}
          alt={alt}
          className={`${className} object-cover pointer-events-none`}
          priority
        />
        <div className={'w-11/12 h-8 grid items-center absolute left-1/2 bottom-2 px-2 -translate-x-1/2'}>
          <h5 className={`${marker.className} text-black `}> {alt} </h5>
        </div>
      </div>
    </Tilt>
  )
}
