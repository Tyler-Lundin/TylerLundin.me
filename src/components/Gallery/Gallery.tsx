'use client';
import clsx from "clsx";
import Image from "next/image";
import list from '../../assets';
import Tilt from 'react-parallax-tilt'


export default function Gallery() {

  return (
    <div className={clsx(
      'w-full',
      'h-full px-8 mb-16',
      'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4',
    )}>
      {list.map(({ src, alt }) => (
        <Tilt key={alt}>
          <div className={clsx(
            'col-span-1',
            'aspect-square',
            'relative',
            'overflow-hidden',
            'flex',
            'pb-[4rem]',
            'px-2',
            'pt-3',
            'bg-zinc-100',
            'rounded-sm',
            'hover:scale-105',
            'shadow-black',
            'shadow-sm',
            'hover:shadow-2xl',
            'hover:bg-white',
            'transition-all',
            'ease-in-out',
          )}>
            <Image
              src={src}
              alt={alt}
              className={'object-cover pointer-events-none'}
            />
            <div className={clsx(
              'w-11/12',
              'h-[3rem]',
              'grid',
              'items-center',
              'absolute',
              'left-1/2',
              'bottom-2',
              'px-2',
              '-translate-x-1/2',
            )}>
              <h5 className={clsx('text-black text-sm font-thin')}> {alt} </h5>
            </div>
          </div>
        </Tilt>
      ))}

    </div>
  )
}