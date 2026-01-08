'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { checkAndAttachDeploymentAction } from '@/app/dev/actions/repo';

export default function DeploymentChecker({ 
  projectId, 
  repoUrl, 
  hasDeployment 
}: { 
  projectId: string; 
  repoUrl?: string; 
  hasDeployment: boolean; 
}) {
  const router = useRouter();

  useEffect(() => {
    if (!repoUrl || hasDeployment) return;

    const check = async () => {
      try {
        const res = await checkAndAttachDeploymentAction(projectId, repoUrl);
        if (res.success && res.url) {
            console.log('Deployment attached:', res.url);
            router.refresh();
        }
      } catch (e) {
        console.error(e);
      }
    };

    // Run check once
    check();
  }, [projectId, repoUrl, hasDeployment, router]);

  return null;
}