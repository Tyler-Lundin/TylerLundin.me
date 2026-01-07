
import { Metadata } from 'next';
import { ProjectWizard } from '@/components/dev/projects/ProjectWizard';
import { projectTemplates } from '@/config/templates';

export const metadata: Metadata = {
  title: 'New Project | Dev Dashboard',
  description: 'Initialize a new project from a template or a fresh start.',
};

export default function NewProjectPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <header className="mb-10">
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">Initialize New Project</h1>
        <p className="text-neutral-500 dark:text-gray-400">
          Pick a preset, spin up a working repo and deployment, and store all identifiers.
        </p>
      </header>

      <ProjectWizard templates={projectTemplates} />
    </div>
  );
}
