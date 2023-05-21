import Navigation from '@/components/Nav/Navigation'
import Footer from '@/components/Page/Footer'
import './globals.css'
import clsx from 'clsx'
import FullLogo from '@/components/FullLogo'
import { ThemeToggle } from '@/components/ThemeToggle'
import Providers from '@/components/Providers'


export const metadata = {
  title: 'Tyler Lundin',
  description: 'My personal Website to display myself',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={'min-h-screen min-w-screen bg-slate-200 dark:bg-zinc-900 antialiased'}>
        <Providers>
          <header className={clsx(
            'fixed top-0 left-0 w-screen h-16 grid place-items-center',
            ' z-[51] backdrop-blur-lg bg-opacity-50',
            'border-b border-black dark:border-white',
          )}>
            <FullLogo />
            <Navigation />
            <ThemeToggle />
          </header>
          <div className={clsx('mt-16 z-0')}>
            {children}
          </div>
          <Footer />
        </Providers>
      </body>
    </html>
  )
}
