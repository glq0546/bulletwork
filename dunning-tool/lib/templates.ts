export interface ReminderTemplate {
  key: string;
  subject: string;
  body: string;
  tone: "polite" | "firm" | "urgent" | "final";
}

export const REMINDER_TEMPLATES: Record<string, ReminderTemplate> = {
  due_in_3_days: {
    key: "due_in_3_days",
    subject: "Reminder: Invoice {{invoice_number}} due in 3 days",
    body: `Dear {{client_name}},

I hope this message finds you well.

This is a friendly reminder that invoice {{invoice_number}} for {{amount}} is due in 3 days ({{due_date}}).

Please arrange payment at your earliest convenience.

Best regards,
{{sender_name}}`,
    tone: "polite",
  },

  due_today: {
    key: "due_today",
    subject: "Action needed: Invoice {{invoice_number}} due today",
    body: `Dear {{client_name}},

This is a final reminder that invoice {{invoice_number}} for {{amount}} is due today.

Please ensure payment is processed today to avoid any late fees.

Best regards,
{{sender_name}}`,
    tone: "firm",
  },

  overdue_1_day: {
    key: "overdue_1_day",
    subject: "Overdue: Invoice {{invoice_number}} — Please pay now",
    body: `Dear {{client_name}},

Invoice {{invoice_number}} for {{amount}} is now 1 day overdue (was due {{due_date}}).

Please process the payment immediately to avoid further action.

Sincerely,
{{sender_name}}`,
    tone: "urgent",
  },

  overdue_7_days: {
    key: "overdue_7_days",
    subject: "URGENT: Invoice {{invoice_number}} — {{days_overdue}} days overdue",
    body: `Dear {{client_name}},

Invoice {{invoice_number}} for {{amount}} is now {{days_overdue}} days overdue.

Please process the payment within 48 hours to avoid additional late fees or collection proceedings.

Sincerely,
{{sender_name}}`,
    tone: "urgent",
  },

  final_notice: {
    key: "final_notice",
    subject: "FINAL NOTICE: Invoice {{invoice_number}} — Account at risk",
    body: `Dear {{client_name}},

After multiple reminders, invoice {{invoice_number}} for {{amount}} remains unpaid ({{days_overdue}} days overdue).

Unless payment is received within 7 days, this matter will be referred to a collection agency and may affect your credit score.

Sincerely,
{{sender_name}}`,
    tone: "final",
  },
};

// Placeholder replacement
export function renderTemplate(
  template: ReminderTemplate,
  vars: Record<string, string>
): { subject: string; body: string } {
  let subject = template.subject;
  let body = template.body;

  for (const [key, value] of Object.entries(vars)) {
    const placeholder = `{{${key}}}`;
    subject = subject.split(placeholder).join(value);
    body = body.split(placeholder).join(value);
  }

  return { subject, body };
}

// Select which template to use based on due date
export function selectTemplateKey(dueDate: Date, now: Date = new Date()): string | null {
  const msPerDay = 1000 * 60 * 60 * 24;
  const daysDiff = Math.floor((dueDate.getTime() - now.getTime()) / msPerDay);

  if (daysDiff > 3) return null;            // Too early — don't send yet
  if (daysDiff === 3) return "due_in_3_days";    // 3 days before due
  if (daysDiff === 2) return "due_in_3_days";    // 2 days before
  if (daysDiff === 1) return "due_in_3_days";    // 1 day before
  if (daysDiff === 0) return "due_today";         // Due today
  if (daysDiff >= -1) return "overdue_1_day";    // 1 day overdue
  if (daysDiff >= -7) return "overdue_7_days";   // 2-7 days overdue
  return "final_notice";                          // >7 days overdue
}
