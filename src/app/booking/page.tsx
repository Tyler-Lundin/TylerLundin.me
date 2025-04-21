'use client';

import { siteConfig } from '@/config/site';

export default function BookingPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Schedule a Call</h1>
          <p className="mt-4 text-lg text-gray-600">
            Let&apos;s discuss your project and how we can work together.
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-1 shadow-gray-300">
          <iframe
            src={siteConfig.booking_url}
            width="100%"
            height="800"
            className="rounded-lg"
          />
        </div>
      </div>
    </main>
  );
} 