'use client';
import Image from "next/image";
import { useRouter } from "next/navigation";

interface LogoProps {
  className?: string;
  width?: number;
  height?: number;
}

export default function Logo({ className, width, height }: LogoProps) {
  const router = useRouter();
  const handleClick = () => {
    router.push('/')
  }

  return (
    <Image
      src={'/TL_Logo.svg'}
      width={width ?? 120}
      height={height ?? 120}
      alt={'Logo'}
      className={`${className} cursor-pointer `}
      onClick={handleClick}
    />
  )
}
