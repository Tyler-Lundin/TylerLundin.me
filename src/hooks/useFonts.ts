import { Roboto, Amarante, Zen_Antique, Roboto_Mono } from "next/font/google"


const a = Roboto({ subsets: ['latin'], weight: ['100', '300', '400', '500', '700', '900'] })
const b = Roboto_Mono({ subsets: ['latin'], weight: ['100', '300', '400', '500', '700'] })
const c = Zen_Antique({ subsets: ['latin'], weight: ['400'] })


export default function useFonts() {
  return {
    a,
    b,
    c,
  }
}
