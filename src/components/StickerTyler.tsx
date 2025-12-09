import Image from "next/image";


type StickerTypes = "waving" | "thinking" | "prepared" | "polite"

export default function StickerTyler({ className = "", size = 0, sticker = "waving" }:{ className?:string, size?: number, sticker?:StickerTypes}){

  return(
    <div>
    <Image className={["", className].join(" ")} src={`/images/${sticker}-tyler.png`} alt="sticker tyler" width={1024 / (10 - size)} height={1536 / (10 - size)}/>
    </div>
  )
}
