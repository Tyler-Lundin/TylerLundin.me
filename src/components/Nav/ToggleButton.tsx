import useNavigation from "@/hooks/useNavigation";
import clsx from "clsx";
import { AiFillCloseSquare } from "react-icons/ai";
import { CgMenu } from "react-icons/cg";


export default function ToggleButton() {
  const { isNavOpen, handleToggle } = useNavigation()
  return (
    <button className={clsx(
      ' dark:text-white text-black',
      ' z-[42] transition-all ease-in-out',
      !isNavOpen ? 'absolute top-1/2 right-4 md:right-8 lg:right-16 xl:right-24 -translate-y-1/2' : 'absolute top-1/2 right-8  -translate-y-1/2'
    )} onClick={handleToggle}>
      {isNavOpen ? <AiFillCloseSquare color={'coral'} size={45} /> : <CgMenu size={45} />}
    </button>

  )
}
