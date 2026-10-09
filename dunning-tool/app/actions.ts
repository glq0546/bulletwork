"use server";

import { revalidatePath } from "next/cache";
import { sendReminder } from "@/lib/dunning";
import { supabaseAdmin } from "@/lib/supabase";

export async function sendReminderAction(invoiceId: string) {
  const result = await sendReminder(invoiceId);

  if (result.ok) {
    revalidatePath("/dashboard");
    return { ok: true };
  }

  return { ok: false, error: result.error || "Unknown error" };
}

export async function markAsPaidAction(invoiceId: string) {
  const { error } = await supabaseAdmin
    .from("invoices")
    .update({ status: "paid" })
    .eq("id", invoiceId);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/dashboard");
  return { ok: true };
}

export async function createInvoiceAction(formData: FormData) {
  const { data: invoice, error } = await supabaseAdmin
    .from("invoices")
    .insert({
      user_id: "00000000-0000-0000-0000-000000000000", // TODO: get from auth session
      client_id: formData.get("client_id") as string,
      invoice_number: formData.get("invoice_number") as string,
      amount: parseFloat(formData.get("amount") as string),
      currency: "USD",
      due_date: formData.get("due_date") as string,
      description: formData.get("description") as string,
      status: "pending",
    })
    .select()
    .single();

  if (error) return { ok: false, error: error.message };

  revalidatePath("/dashboard");
  return { ok: true, invoice };
}
