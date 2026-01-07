import { AiTaskTemplate } from '@/types/ai-tasks';

export const aiTaskTemplates: AiTaskTemplate[] = [
  {
    id: 'deps-upgrade',
    title: 'Upgrade Dependencies',
    description: 'Check for outdated npm packages, update package.json, and verify the build passes.',
    category: 'maintenance',
    estimatedDuration: '5m',
    inputsSchema: [
      { key: 'target', label: 'Target Packages', type: 'text', placeholder: 'all', defaultValue: 'all' },
      { key: 'semver', label: 'Semver Policy', type: 'select', options: ['minor', 'patch', 'latest'], defaultValue: 'minor' }
    ]
  },
  {
    id: 'fix-lint',
    title: 'Auto-Fix Lint Errors',
    description: 'Run eslint --fix and attempt to resolve remaining errors with AI.',
    category: 'maintenance',
    estimatedDuration: '2m',
  },
  {
    id: 'unit-tests',
    title: 'Generate Unit Tests',
    description: 'Analyze modified files and generate Jest/Vitest test cases.',
    category: 'testing',
    estimatedDuration: '8m',
    inputsSchema: [
      { key: 'path', label: 'File Path / Glob', type: 'text', placeholder: 'src/utils/*.ts' }
    ]
  },
  {
    id: 'tailwindcss-migration',
    title: 'Migrate CSS to Tailwind',
    description: 'Convert standard CSS/Modules to Tailwind utility classes.',
    category: 'refactor',
    estimatedDuration: '10m',
    inputsSchema: [
      { key: 'component', label: 'Component Path', type: 'text', placeholder: 'src/components/Button.tsx' }
    ]
  },
  {
    id: 'api-route',
    title: 'Scaffold API Route',
    description: 'Create a new Next.js API route with validation and error handling.',
    category: 'feature',
    estimatedDuration: '3m',
    inputsSchema: [
      { key: 'method', label: 'HTTP Method', type: 'select', options: ['GET', 'POST', 'PUT', 'DELETE'], defaultValue: 'GET' },
      { key: 'route', label: 'Route Path', type: 'text', placeholder: '/api/v1/resource' }
    ]
  }
];
