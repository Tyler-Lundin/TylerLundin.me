'use client';
import { atom, useAtom } from "jotai";
import Polaroid from "./Polaroid";

const SwappingGalleryAtom = atom(0);

const Polaroids = [
  { src: '/Tyler.jpg', alt: 'Mustache - Jan 2023' },
  { src: '/Muscles.jpg', alt: 'Flexing - Feb 2023' },
  { src: '/Blonde.jpeg', alt: 'Blonde - Oct 2017' },
  { src: '/Gym.jpg', alt: 'Gym - Nov 2022' },
];

export default function SwappingGallery({ offset = 0 }: { offset?: number }) {
  const [currentIndex, setCurrentIndex] = useAtom(SwappingGalleryAtom);
  const handleClick = () => {
    setCurrentIndex((currentIndex + 1) % Polaroids.length);
  }

  return (
    <div onClick={handleClick} className={'w-fit h-fit'}>
      <Polaroid src={Polaroids[(currentIndex + offset) % Polaroids.length].src} alt={Polaroids[(currentIndex + offset) % Polaroids.length].alt} />
    </div>
  )
}
