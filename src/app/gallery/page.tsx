import Gallery from "@/components/Gallery/Gallery";
import ResponsivePage from "@/components/Page/ResponsivePage";
import clsx from "clsx";


export default function GalleryPage() {

  return (
    <ResponsivePage>
      <h1 className={clsx(
        'text-4xl',
        'font-bold',
        'text-center',
        'my-8',
      )}>Gallery</h1>
      <Gallery />
    </ResponsivePage>
  )
}
