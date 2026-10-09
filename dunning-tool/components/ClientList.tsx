"use client";

import { useState } from "react";
import { Invoice, Client } from "@/types";
import { sendReminderAction } from "@/app/actions";

interface Props {
  invoices: (Invoice & { clients: Client })[];
}

function formatMoney(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function ClientList({ invoices }: Props) {
  const [filter, setFilter] = useState<"due_soon" | "overdue" | "all">("all");
  const [sendingId, setSendingId] = useState<string | null>(null);

  const filtered = invoices.filter((inv) => {
    const today = new Date();
    const due = new Date(inv.due_date);
    const daysDiff = Math.floor(
      (due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (inv.status === "overdue") return filter === "overdue" || filter === "all";
    if (daysDiff <= 3 && daysDiff >= 0)
      return filter === "due_soon" || filter === "all";
    return filter === "all";
  });

  const handleSendReminder = async (invoiceId: string) => {
    setSendingId(invoiceId);
    const res = await sendReminderAction(invoiceId);

    if (res.ok) {
      alert("Reminder sent!");
    } else {
      alert("Failed to send reminder. Please try again.");
    }
    setSendingId(null);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Filter tabs */}
      <div className="flex border-b border-gray-200">
        {(["due_soon", "overdue", "all"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
              filter === tab
                ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50/50"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab === "due_soon" ? "Due Soon" : tab === "overdue" ? "Overdue" : "All Outstanding"}
          </button>
        ))}
      </div>

      {/* Invoice list */}
      <ul className="divide-y divide-gray-100">
        {filtered.length === 0 && (
          <li className="px-6 py-8 text-center text-sm text-gray-500">
            No invoices found. Create your first invoice to get started.
          </li>
        )}
        {filtered.map((inv) => {
          const daysOverdue =
            inv.status === "overdue"
              ? Math.floor(
                  (Date.now() - new Date(inv.due_date).getTime()) /
                    (1000 * 60 * 60 * 24)
                )
              : 0;

          const isDueSoon =
            inv.status === "pending" &&
            new Date(inv.due_date) <= addDays(new Date(), 3);

          return (
            <li key={inv.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-sm font-semibold text-gray-900">
                      {inv.clients.name}
                    </h3>
                    {isDueSoon && (
                      <span className="px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                        Due soon
                      </span>
                    )}
                    {inv.status === "overdue" && (
                      <span className="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                        {daysOverdue}d overdue
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    {inv.invoice_number} &middot;{" "}
                    {formatMoney(inv.amount, inv.currency)} &middot; due{" "}
                    {formatDate(inv.due_date)}
                  </p>
                </div>
                <button
                  onClick={() => handleSendReminder(inv.id)}
                  disabled={sendingId === inv.id}
                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sendingId === inv.id ? "Sending..." : "Send reminder"}
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
