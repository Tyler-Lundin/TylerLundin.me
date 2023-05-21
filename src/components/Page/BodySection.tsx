import { type ReactNode } from "react";


export default function BodySection({ children }: { children: ReactNode }) {

  return (
    <div className={'w-full min-h-screen bg-zinc-900 py-16 px-8 '}>
      {children}
    </div>
  )
}
