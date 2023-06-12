

export default function Loading() {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 dark:border-gray-100"></div>
        <div className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mt-4">Loading...</div>
      </div>
    </div>
  )
}
