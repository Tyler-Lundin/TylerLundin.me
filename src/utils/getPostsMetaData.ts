import { readdirSync, readFileSync } from "fs";
import matter from "gray-matter";


export default function getPostsMetaData() {

  const files = readdirSync('src/posts');
  const markdownPosts = files.filter((file) => file.endsWith('.mdx')).filter((file) => file !== 'about_me.mdx');
  const posts = markdownPosts.map((fileName) => {
    const fileContents = readFileSync(`src/posts/${fileName}`, 'utf8');
    const matterResult = matter(fileContents);
    return {
      title: matterResult.data.title,
      slug: fileName.replace('.mdx', ''),
      date: matterResult.data.date,
      subtitle: matterResult.data.subtitle,
    }
  })
  return posts.sort((a, b) => {
    if (a.date < b.date) {
      return 1;
    } else {
      return -1;
    }
  }
  )
}


