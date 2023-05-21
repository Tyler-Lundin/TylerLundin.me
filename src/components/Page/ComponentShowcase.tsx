

export default function ComponentShowcase({ children }: { children: React.ReactNode }) {

  return (
    <div className={'grid md:grid-cols-2 w-full brightness-110 p-12'}>
      {children}
    </div>
  )
}
