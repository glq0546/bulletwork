import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { DashboardStats } from "@/components/DashboardStats";
import { ClientList } from "@/components/ClientList";
import { NewInvoiceModal } from "@/components/NewInvoiceModal";
import { DashboardHeader } from "@/components/DashboardHeader";
import type { DashboardStats as DashboardStatsType, Invoice } from "@/types";

export default async function DashboardPage() {
  const supabase = createServerComponentClient({ cookies });

  const { data: invoices } = await supabase
    .from("invoices")
    .select("*, clients(*)")
    .in("status", ["pending", "overdue"])
    .order("due_date", { ascending: true });

  const pendingInvoices = invoices?.filter((i) => i.status === "pending") || [];
  const overdueInvoices = invoices?.filter((i) => i.status === "overdue") || [];

  const now = new Date();
  const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

  const dueSoon = pendingInvoices.filter(
    (i) => new Date(i.due_date) <= threeDaysFromNow
  ).length;

  const stats: DashboardStatsType = {
    outstanding: pendingInvoices.length,
    due_soon: dueSoon,
    overdue: overdueInvoices.length,
    collected_this_month: 0,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader stats={stats} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-semibold text-gray-900">
            Outstanding Invoices
          </h2>
          <NewInvoiceModal />
        </div>

        <ClientList invoices={invoices || []} />
      </main>
    </div>
  );
}
