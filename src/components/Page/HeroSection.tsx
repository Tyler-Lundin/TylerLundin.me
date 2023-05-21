import clsx from 'clsx';
import type { ReactNode } from 'react';




interface HeroSectionProps {
  className?: string;
  children: ReactNode;
}

export default function HeroSection({ className, children }: HeroSectionProps) {
  return (
    <div className={clsx(
      'p-4 md:p-8 lg:p-16 xl:p-24',
      className,
    )}>
      {children}
    </div>
  )
}


