import ListOfPosts from "@/components/Blog/ListOfPosts";
import ResponsivePage from "@/components/Page/ResponsivePage";
import Section from "@/components/Page/Section";


export default function BlogPage() {

  return (
    <ResponsivePage>
      <h1 className={'text-4xl font-black text-center py-8'}> Blog Posts </h1>
      <ListOfPosts />
      <div className={'h-16'} />
    </ResponsivePage>
  )
}
