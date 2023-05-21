import { atom, useAtom } from 'jotai';

const isNavOpenAtom = atom(false);

export default function useNavigation() {
  const [isNavOpen, setIsNavOpen] = useAtom(isNavOpenAtom);
  const handleToggle = () => setIsNavOpen(!isNavOpen)
  const closeNav = () => setIsNavOpen(false)
  return {
    isNavOpen,
    handleToggle,
    closeNav,
  }
}
