import clsx from "clsx";
import type { IBlogPost } from "@/types/BlogPost";
import Link from "next/link";

export interface BlogPostPreviewProps {
  slug: string;
  title: string;
  subtitle: string;
  date: string;
}

export default function BlogPostPreview({ slug, title, subtitle, date }: BlogPostPreviewProps) {

  return (
    <Link href={`/posts/${slug}`} key={slug} className={clsx(
      'flex flex-col gap-2',
      'p-4 transition-all duration-300 ease-in-out ',
      'bg-zinc-100 border border-zinc-300 dark:border-black dark:bg-zinc-600 rounded-md',
      'hover:invert',
      'text-gray-800 dark:text-white',
    )}>
      <li className={'flex flex-col gap-2'}>
        <h2 className={'text-2xl font-bold'}>{title}</h2>
        <h3 className={'text-xl font-thin'}>{subtitle}</h3>
        <span className={'text-sm font-thin'}>{date}</span>
      </li>
    </Link>
  )
}