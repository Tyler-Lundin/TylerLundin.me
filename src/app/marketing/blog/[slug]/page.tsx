import DevBlogView from '@/app/dev/blog/[slug]/page'

export default function MarketingBlogView(props: any) {
  // Forward props to the dev page
  return DevBlogView(props as any)
}

