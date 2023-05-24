import useNavigation from "@/hooks/useNavigation"


export default function NavOverlay() {
  const { isNavOpen, closeNav } = useNavigation();
  if (!isNavOpen) return null
  return (
    <div onClick={closeNav} className="w-screen h-screen fixed top-0 left-0 bg-black bg-opacity-70 z-50" />
  )
}
