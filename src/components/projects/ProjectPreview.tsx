'use client';

import { useEffect, useState } from 'react';
import { getLinkPreview } from 'link-preview-js';
import { ConstructionIcon, PlusIcon } from 'lucide-react';

interface ProjectPreviewProps {
  title: string;
  description: string;
  techStack: string[];
  projectUrl: string;
  isInternalLink?: boolean;
}

interface LinkPreview {
  title?: string;
  description?: string;
  image?: string;
  favicon?: string;
}

interface LinkPreviewResponse {
  title?: string;
  description?: string;
  images?: string[];
  favicons?: string[];
}

export function ProjectPreview({
  title,
  description,
  projectUrl,
  isInternalLink = false
}: ProjectPreviewProps) {
  const [preview, setPreview] = useState<LinkPreview | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPreview = async () => {
      if (isInternalLink || !projectUrl) {
        setIsLoading(false);
        return;
      }

      try {
        const data = await getLinkPreview(projectUrl) as LinkPreviewResponse;
        setPreview({
          title: data.title,
          description: data.description,
          image: data.images?.[0],
          favicon: data.favicons?.[0]
        });
      } catch (error) {
        console.log('Error fetching link preview:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPreview();
  }, [projectUrl, isInternalLink]);

  return (
    <a 
      href={projectUrl} 
      target={isInternalLink ? undefined : "_blank"} 
      rel={isInternalLink ? undefined : "noopener noreferrer"} 
      className="group relative block w-full bg-white dark:bg-neutral-800 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer"
    >
      <div className="relative aspect-[16/9] bg-gray-100 dark:bg-neutral-700 overflow-hidden">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/50 dark:to-purple-950/50">
            <div className="w-8 h-8 border-4 border-indigo-500 dark:border-emerald-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : preview?.image ? (
          <div className="relative w-full h-full">
            <img
              src={preview.image}
              alt={preview.title || title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-300" />
          </div>
        ) : (
          <div className={`absolute inset-0 flex items-center justify-center ${isInternalLink ? 'bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 dark:from-emerald-900/30 dark:via-purple-900/30 dark:to-pink-900/30' : 'bg-black'}`}>
            <div className="w-16 h-16 rounded-xl flex items-center justify-center transform transition-transform duration-500 group-hover:scale-110">
              {preview?.favicon ? (
                <img
                  src={preview.favicon}
                  alt=""
                  className="w-10 h-10"
                />
              ) : (
                isInternalLink ? (
                  <PlusIcon className="w-20 h-20 text-green-500" />
                ) : (
                  <ConstructionIcon className="w-10 h-10 text-yellow-500" />
                )
              )}
            </div>
          </div>
        )}
        
        {/* Play button overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-16 h-16 rounded-full bg-white/90 dark:bg-black/90 flex items-center justify-center transform scale-90 group-hover:scale-100 transition-transform duration-300">
            <svg className="w-8 h-8 text-indigo-600 dark:text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          </div>
        </div>
      </div>
      
      <div className="p-4">
        <div className="space-y-2">
          <div className="flex items-start gap-3">
            {preview?.favicon && (
              <img
                src={preview.favicon}
                alt=""
                className="w-6 h-6 rounded-sm mt-1 flex-shrink-0"
              />
            )}
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 truncate group-hover:text-indigo-600 dark:group-hover:text-emerald-500 transition-colors duration-300">
                {title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mt-1">
                {description}
              </p>
            </div>
          </div>
        </div>
      </div>
    </a>
  );
}
