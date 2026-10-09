import { supabaseAdmin } from "./supabase";
import { REMINDER_TEMPLATES, renderTemplate } from "./templates";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// ── Helpers ──────────────────────────────────────────────

function formatMoney(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });
}

// ── Core: send a single reminder ─────────────────────────

export async function sendReminder(invoiceId: string): Promise<{ ok: boolean; error?: string }> {
  // 1. Fetch invoice + client + user
  const { data: invoice, error: fetchErr } = await supabaseAdmin
    .from("invoices")
    .select("*, clients(*)")
    .eq("id", invoiceId)
    .single();

  if (fetchErr || !invoice) return { ok: false, error: "Invoice not found" };

  // 2. Select template based on due date
  const now = new Date();
  const due = new Date(invoice.due_date);
  const isOverdue = now > due;

  let templateKey: string;
  if (isOverdue) {
    const daysOverdue = Math.floor((now.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
    if (daysOverdue <= 1) templateKey = "overdue_1_day";
    else if (daysOverdue <= 7) templateKey = "overdue_7_days";
    else templateKey = "final_notice";
  } else {
    const daysLeft = Math.floor((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    templateKey = daysLeft <= 3 ? "due_in_3_days" : "due_today";
  }

  const template = REMINDER_TEMPLATES[templateKey];

  // 3. Build email content
  const vars: Record<string, string> = {
    invoice_number: invoice.invoice_number,
    client_name: invoice.clients.name,
    amount: formatMoney(invoice.amount, invoice.currency),
    due_date: formatDate(invoice.due_date),
    sender_name: "Your Name", // TODO: pull from users table
    days_overdue: String(Math.floor((now.getTime() - due.getTime()) / (1000 * 60 * 60 * 24))),
  };

  const { subject, body } = renderTemplate(template, vars);

  // 4. Send via Resend
  const { error: sendErr } = await resend.emails.send({
    from: "invoices@yourdomain.com",
    to: invoice.clients.email,
    subject,
    html: `<p>${body.replace(/\n/g, "<br/>")}</p>`,
  });

  // 5. Log the reminder
  await supabaseAdmin.from("reminder_logs").insert({
    user_id: invoice.user_id,
    client_id: invoice.client_id,
    invoice_id: invoice.id,
    template_name: templateKey,
    email_subject: subject,
    email_body: body,
    status: sendErr ? "failed" : "sent",
  });

  return { ok: !sendErr, error: sendErr?.message };
}

// ── Cron: run the full dunning engine ────────────────────

export async function runDunningEngine(): Promise<void> {
  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];

  // ── Upcoming (due within 3 days, still pending) ──
  const { data: upcoming } = await supabaseAdmin
    .from("invoices")
    .select("*, clients(*)")
    .eq("status", "pending")
    .gte("due_date", todayStr)
    .lte("due_date", new Date(now.getTime() + 3 * 86400000).toISOString().split("T")[0]);

  for (const inv of upcoming || []) {
    await sendReminder(inv.id);
  }

  // ── Overdue (past due, still pending) ──
  const { data: overdue } = await supabaseAdmin
    .from("invoices")
    .select("*, clients(*)")
    .in("status", ["pending", "overdue"])
    .lt("due_date", todayStr);

  for (const inv of overdue || []) {
    await sendReminder(inv.id);
  }

  console.log(`[DunningEngine] ${now.toISOString()} — sent ${(upcoming || []).length + (overdue || []).length} reminders`);
}
