export default function DashboardHeader({ title }: { title: string }) {
    return (
      <header className="flex items-center justify-between pb-4 border-b border-neutral-300">
        <h1 className="text-4xl font-semibold text-gray-800">{title}</h1>
      </header>
    );
  }
  