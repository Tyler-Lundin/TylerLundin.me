interface Props {
  params: { slug: string }
}

export default function PortalProjectPage({ params }: Props) {
  const { slug } = params
  return (
    <div className="min-h-[60vh] max-w-5xl mx-auto px-4 pt-10">
      <h1 className="text-2xl font-semibold">Project</h1>
      <p className="text-sm text-gray-500">Summary for {slug}</p>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="text-xs text-gray-500">Status</div>
          <div className="text-xl font-medium">—</div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="text-xs text-gray-500">Client-visible Links</div>
          <div className="text-gray-600">—</div>
        </div>
      </div>
    </div>
  )
}

