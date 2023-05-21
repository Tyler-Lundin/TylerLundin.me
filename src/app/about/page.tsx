import BackButton from "@/components/BackButton";
import ResponsivePage from "@/components/Page/ResponsivePage";
import AboutMe from "@/posts/about_me.mdx";
import getPost from "@/utils/getPost";
import clsx from "clsx";
import Markdown from "markdown-to-jsx";


export default function AboutPage() {
  const slug = 'about_me';
  const post = getPost(slug);
  const { title, date, subtitle, content } = post;
  return (
    <ResponsivePage>
      <div className={clsx('py-16',)}>
        <BackButton href={'/'} />
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
