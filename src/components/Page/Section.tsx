import clsx from 'clsx';
import type { ReactNode } from 'react';

interface SectionProps {
  children: ReactNode;
  className?: string;
}


export default function Section({ children, className = '' }: SectionProps) {

  return (
    <div className={clsx(
      'w-full h-fit grid place-items-center p-6',
      className
    )}>
      {children}
    </div>
  )
}
