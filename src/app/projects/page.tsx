import ResponsivePage from "@/components/Page/ResponsivePage";
import MyJournal from "@/components/Projects/MyJournal";
import SFC from "@/components/Projects/SFC";

export default function ProjectsPage() {

  return (
    <ResponsivePage>
      <div className="flex flex-wrap place-content-center items-center justify-center w-full h-full mb-12">
        <SFC />
        <MyJournal />
      </div>


    </ResponsivePage>
  )
}
