'use client';

import { useEffect, useState } from 'react';
import { getLinkPreview } from 'link-preview-js';

interface ProjectPreviewProps {
  title: string;
  description: string;
  techStack: string[];
  projectUrl: string;
  isExpanded?: boolean;
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
  techStack,
  projectUrl,
  isExpanded = false,
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
      } catch(error){
        console.log('Error fetching link preview:', error);
      }finally {
        setIsLoading(false);
      }
    };

    fetchPreview();
  }, [projectUrl, isInternalLink]);

  return (
    <div className={`bg-white dark:bg-neutral-800 border border-black/25 dark:border-white/25 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer ${
      isExpanded ? 'w-full max-w-2xl' : 'w-full max-w-md'
    }`}>
      {!isInternalLink && (
        <div className="relative aspect-video bg-gray-100 dark:bg-neutral-700 overflow-hidden">
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-indigo-500 dark:border-emerald-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : preview?.image ? (
            <img
              src={preview.image}
              alt={preview.title || title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 bg-indigo-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                {preview?.favicon ? (
                  <img
                    src={preview.favicon}
                    alt=""
                    className="w-8 h-8"
                  />
                ) : (
                  <svg className="w-8 h-8 text-indigo-500 dark:text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="p-4 sm:p-6">
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          {title}
        </h3>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-3 sm:mb-4">
          {description}
        </p>
        <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-4">
          {techStack.map((tech) => (
            <span
              key={tech}
              className="px-2 sm:px-3 py-0.5 sm:py-1 bg-gray-100 dark:bg-neutral-700 text-gray-700 dark:text-gray-300 rounded-full text-xs sm:text-sm"
            >
              {tech}
            </span>
          ))}
        </div>
        <a 
          href={projectUrl}
          target={isInternalLink ? undefined : "_blank"}
          rel={isInternalLink ? undefined : "noopener noreferrer"}
          className="inline-block text-sm sm:text-base text-indigo-600 dark:text-emerald-300 font-medium hover:text-indigo-500 dark:hover:text-emerald-200 transition-colors duration-200"
        >
          {isInternalLink ? "Let's Build Your Project →" : "View Project →"}
        </a>
      </div>
    </div>
  );
}
