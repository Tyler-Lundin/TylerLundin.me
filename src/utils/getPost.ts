import { readFileSync } from "fs";
import matter from "gray-matter";


export default function getPost(slug: string) {
  const fileContents = readFileSync(`src/posts/${slug}.mdx`, 'utf8');
  const matterResult = matter(fileContents);
  return {
    title: matterResult.data.title,
    date: matterResult.data.date,
    subtitle: matterResult.data.subtitle,
    content: matterResult.content,
  }
}
