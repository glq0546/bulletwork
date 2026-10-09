export interface Client {
  id: string;
  name: string;
  email: string;
  company: string | null;
  phone: string | null;
  address: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Invoice {
  id: string;
  user_id: string;
  client_id: string;
  invoice_number: string;
  amount: number;
  currency: string;
  status: "pending" | "paid" | "overdue" | "cancelled";
  description: string | null;
  due_date: string;
  sent_at: string | null;
  created_at: string;
  updated_at: string;
  clients?: Client;
  users?: User;
}

export interface User {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
  stripe_customer_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface ReminderLog {
  id: string;
  user_id: string;
  client_id: string;
  invoice_id: string;
  template_name: string;
  email_subject: string;
  email_body: string;
  status: "sent" | "failed";
  sent_at: string;
}

export interface DashboardStats {
  outstanding: number;
  due_soon: number;
  overdue: number;
  collected_this_month: number;
}

export type FilterTab = "due_soon" | "overdue" | "all";
