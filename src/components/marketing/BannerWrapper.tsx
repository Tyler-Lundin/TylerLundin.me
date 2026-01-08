'use client';

import { usePathname } from 'next/navigation';

export default function BannerWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Disable banner on dashboard/management routes
  const isDashboard = 
    pathname.startsWith('/dev') || 
    pathname.startsWith('/portal') || 
    pathname.startsWith('/marketing') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/onboard');

  if (isDashboard) return null;

  return <>{children}</>;
}
