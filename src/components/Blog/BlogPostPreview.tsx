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
      'bg-zinc-100 border border-zinc-400 dark:border-emerald-400 dark:bg-zinc-900 rounded-md',
      'hover:bg-zinc-200 dark:hover:bg-zinc-800',
      'text-gray-800 dark:text-white',
    )}>
      <li className={'flex flex-col gap-2'}>
        <h2 className={'text-xl md:text-2xl font-bold'}>{title}</h2>
        <h3 className={'text-md md:text-xl font-light'}>{subtitle}</h3>
        <span className={'text-sm font-light'}>{date}</span>
      </li>
    </Link>
  )
}
