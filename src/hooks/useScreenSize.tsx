import { useEffect, useState } from "react"

type SizeType = 'sm' | 'md' | 'lg'

export default function useScreenSize(): SizeType {
  const [screenSize, setScreenSize] = useState<SizeType>('lg')

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setScreenSize('sm')
      } else if (window.innerWidth < 992) {
        setScreenSize('md')
      } else {
        setScreenSize('lg')
      }
    }

    handleResize()

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return screenSize
}
