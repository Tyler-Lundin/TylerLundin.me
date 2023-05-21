import ListOfPosts from "@/components/Blog/ListOfPosts";
import ResponsivePage from "@/components/Page/ResponsivePage";
import Section from "@/components/Page/Section";


export default function BlogPage() {

  return (
    <ResponsivePage>
      <Section>
        <ListOfPosts />
      </Section>
    </ResponsivePage>
  )
}
