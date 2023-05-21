import getPostsMetaData from "@/utils/getPostsMetaData";
import BlogPostPreview from "./BlogPostPreview";

export default function ListOfPosts() {

  const posts = getPostsMetaData();
  const postPreviews = posts.map(({ title, slug, date, subtitle }) => (
    <BlogPostPreview key={slug} title={title} slug={slug} date={date} subtitle={subtitle} />
  ))

  return (
    <ul className={'grid gap-2 h-fit'}>
      {postPreviews}
    </ul>
  )
}
