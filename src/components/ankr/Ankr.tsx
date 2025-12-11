import Image from "next/image"


export default function Ankr() {
  return (<>
    <AnkrCharacter />
  </>)
}


const AnkrCharacter = () => {
  return (<Image src="/images/ankr.png" alt="Ankr Ai Assistant" width={100} height={100} className="fixed bottom-2 right-4 z-50 scale-x-[-1]" />)
}


