import Navigation from '@/components/Nav/Navigation'
import Footer from '@/components/Page/Footer'
import './globals.css'
import { Roboto } from 'next/font/google'
import clsx from 'clsx'
import FullLogo from '@/components/FullLogo'

const roboto = Roboto({ weight: ['100', '300', '400', '500', '700', '900'] })

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
      <body className={'min-h-screen min-w-screen'}>
        <header className={clsx(
          'fixed top-0 left-0 w-screen h-16 grid place-items-center',
          ' z-[51] backdrop-blur-lg bg-opacity-50',
          'border-b border-black dark:border-white',
        )}>
          <FullLogo />
          <Navigation />
        </header>
        <div className={clsx('mt-16')}>
          {children}
        </div>
        <Footer />
      </body>
    </html>
  )
}
