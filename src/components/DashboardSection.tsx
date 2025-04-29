export default function DashboardSection({
    title,
    children,
  }: {
    title: string;
    children: React.ReactNode;
  }) {
    return (
      <section className="bg-white p-6 rounded-2xl shadow-md space-y-4">
        <h2 className="text-2xl font-medium text-gray-700">{title}</h2>
        <div>{children}</div>
      </section>
    );
  }
  