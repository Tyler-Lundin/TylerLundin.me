'use client';


export default function BookingPage() {

  if (true) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-white to-white via-transparent">
      <h1 className="text-4xl font-bold">Coming Soon</h1>
    </div>
  )

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 py-20">
      <div className="max-w-7xl mx-auto px-1 md:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Schedule a Call</h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
            Let&apos;s discuss your project and how we can work together.
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 md:rounded-lg shadow-lg shadow-gray-300 dark:shadow-gray-800">
          <iframe
            src="https://www.foxlot.app/embed/fbc00a64-0f0d-4631-9fb6-681d4193e02c/iframe"
            width="100%"
            height="600"
            frameBorder="0"
            className="rounded-lg"
          />
        </div>
      </div>
    </main>
  );
} 