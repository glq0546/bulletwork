import { DashboardStats as Stats } from "@/types";

interface Props {
  stats: Stats;
}

export function DashboardStats({ stats }: Props) {
  const statCards = [
    {
      label: "Outstanding",
      value: stats.outstanding,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
    },
    {
      label: "Due within 3 days",
      value: stats.due_soon,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200",
    },
    {
      label: "Overdue",
      value: stats.overdue,
      color: "text-red-600",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
      {statCards.map((s) => (
        <div
          key={s.label}
          className={`rounded-xl border ${s.borderColor} ${s.bgColor} p-6`}
        >
          <p className="text-sm font-medium text-gray-500">{s.label}</p>
          <p className={`mt-2 text-3xl font-bold ${s.color}`}>{s.value}</p>
        </div>
      ))}
    </div>
  );
}
