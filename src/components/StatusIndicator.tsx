'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface StatusData {
  status: 'operational' | 'degraded' | 'outage';
  lastChecked: Date;
}

export function StatusIndicator() {
  const [vercelStatus, setVercelStatus] = useState<StatusData | null>(null);
  const [cloudflareStatus, setCloudflareStatus] = useState<StatusData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStatuses = async () => {
      try {
        // Fetch Vercel status
        const vercelRes = await fetch('https://www.vercel-status.com/api/v2/summary.json');
        const vercelData = await vercelRes.json();
        const vercelStatus = vercelData.status.indicator === 'none' ? 'operational' : 
                           vercelData.status.indicator === 'minor' ? 'degraded' : 'outage';
        
        // Fetch Cloudflare status
        const cfRes = await fetch('https://www.cloudflarestatus.com/api/v2/summary.json');
        const cfData = await cfRes.json();
        const cfStatus = cfData.status.indicator === 'none' ? 'operational' : 
                        cfData.status.indicator === 'minor' ? 'degraded' : 'outage';

        setVercelStatus({
          status: vercelStatus,
          lastChecked: new Date()
        });
        
        setCloudflareStatus({
          status: cfStatus,
          lastChecked: new Date()
        });
      } catch (error) {
        console.error('Error fetching status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStatuses();
    // Refresh every 5 minutes
    const interval = setInterval(fetchStatuses, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational':
        return 'bg-emerald-500';
      case 'degraded':
        return 'bg-yellow-500';
      case 'outage':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-1">
          <span className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-pulse" />
          <span className="text-[10px] font-mono text-black/40 dark:text-white/40">LOADING...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-4">
      <Link 
        href="https://www.vercel-status.com" 
        target="_blank" 
        rel="noopener noreferrer"
        className="flex items-center space-x-1 hover:opacity-80 transition-opacity"
      >
        <span className={`w-1.5 h-1.5 rounded-full ${getStatusColor(vercelStatus?.status || '')} animate-pulse`} />
        <span className="text-[10px] font-mono text-black/40 dark:text-white/40">SYSTEM ONLINE</span>
      </Link>
      <Link 
        href="https://www.cloudflarestatus.com" 
        target="_blank" 
        rel="noopener noreferrer"
        className="flex items-center space-x-1 hover:opacity-80 transition-opacity"
      >
        <span className={`w-1.5 h-1.5 rounded-full ${getStatusColor(cloudflareStatus?.status || '')} animate-pulse`} />
        <span className="text-[10px] font-mono text-black/40 dark:text-white/40">NETWORK ACTIVE</span>
      </Link>
    </div>
  );
} 