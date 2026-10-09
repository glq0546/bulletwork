"use client";

import type { DashboardStats } from "@/types";
import { DashboardStats as DashboardStatsView } from "./DashboardStats";

interface Props {
  stats: DashboardStats;
}

export function DashboardHeader({ stats }: Props) {
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Dunning Dashboard
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Automated payment reminders for freelancers
            </p>
          </div>
        </div>
        <DashboardStatsView stats={stats} />
      </div>
    </header>
  );
}
