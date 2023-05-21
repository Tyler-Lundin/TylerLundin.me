import BackButton from "@/components/BackButton";
import ListOfPosts from "@/components/Blog/ListOfPosts";
import ResponsivePage from "@/components/Page/ResponsivePage";
import Section from "@/components/Page/Section";
import getPost from "@/utils/getPost";
import getPostsMetaData from "@/utils/getPostsMetaData";
import clsx from "clsx";
import Markdown from "markdown-to-jsx";


export const generateStaticParams = async () => {
  const posts = getPostsMetaData();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export default async function PostsPage({ params }: { params: { slug: string } }) {
  const slug = params.slug;
  const post = getPost(slug);
  const { title, date, subtitle, content } = post;
  return (
    <ResponsivePage>
      <div className={clsx('py-16',)}>
        <BackButton href={'/blog'} />
        <div className={clsx('max-w-4xl',)}>
          <h1 className={clsx('text-4xl font-bold',)}>{title}</h1>
          <p className={clsx('text-gray-500',)}>{date}</p>
          <article className={clsx(
            'mt-4',
            'prose lg:prose-xl',
            'dark:invert',
          )}>
            <Markdown>{content}</Markdown>
          </article>
        </div>
      </div>
    </ResponsivePage>
  )
}
