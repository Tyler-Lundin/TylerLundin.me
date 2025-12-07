import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | Tyler Lundin',
  description: 'Privacy policy for tylerlundin.me',
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen py-20 bg-white/95 py-40 dark:invert opacity-90">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="prose prose-lg mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
          
          <p className="text-gray-600 mb-6">
            Last updated: {new Date().toLocaleDateString()}
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Information We Collect</h2>
          <p className="text-gray-600 mb-4">
            This website is built using Next.js and hosted on Vercel. We collect minimal information about our visitors:
          </p>
          <ul className="list-disc pl-6 text-gray-600 mb-6">
            <li>Basic analytics data provided by Vercel</li>
            <li>Information you voluntarily provide through the contact form</li>
            <li>Standard server logs including IP addresses and browser information</li>
          </ul>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">How We Use Your Information</h2>
          <p className="text-gray-600 mb-4">
            The information we collect is used to:
          </p>
          <ul className="list-disc pl-6 text-gray-600 mb-6">
            <li>Improve website performance and user experience</li>
            <li>Respond to inquiries and messages</li>
            <li>Analyze website traffic and usage patterns</li>
          </ul>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Data Protection</h2>
          <p className="text-gray-600 mb-6">
            We implement appropriate security measures to protect your personal information. However, please note that no method of transmission over the internet is 100% secure.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Contact Us</h2>
          <p className="text-gray-600 mb-6">
            If you have any questions about this Privacy Policy, please contact us through the contact form on the website.
          </p>

          <p className="text-gray-600 text-sm mt-12">
            This privacy policy is subject to change without notice. Please check back periodically for updates.
          </p>
        </div>
      </div>
    </main>
  );
} 
