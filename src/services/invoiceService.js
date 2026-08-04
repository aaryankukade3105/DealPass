import { supabase } from "../lib/supabase";
import { getDealPassId } from "../utils/dealpass";

export async function createInvoice(userId, invoiceData, items = []) {
  // 1. Read next invoice number
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("next_invoice_number")
    .eq("id", userId)
    .single();

  if (profileError) throw profileError;

  // 2. Generate invoice number
  const dealPassId = getDealPassId(userId);

  const invoiceNumber =
    `${dealPassId}-${String(profile.next_invoice_number).padStart(6, "0")}`;

  // 3. Create invoice
  const { data: invoice, error: invoiceError } = await supabase
    .from("invoices")
    .insert({
      ...invoiceData,
      user_id: userId,
      invoice_number: invoiceNumber,
    })
    .select()
    .single();

  if (invoiceError) throw invoiceError;

  // 4. Create invoice items
  if (items.length) {
    const invoiceItems = items.map((item) => ({
      invoice_id: invoice.id,
      deliverable: item.label ?? item.type,
      detail: item.detail ?? null,
      qty: item.qty,
      rate: item.rate ?? 0,
      amount: Number(item.qty || 0) * Number(item.rate || 0),
    }));

    const { error: itemsError } = await supabase
      .from("invoice_items")
      .insert(invoiceItems);

    if (itemsError) throw itemsError;
  }

  // 5. Increment next invoice number
  const { error: updateError } = await supabase
    .from("profiles")
    .update({
      next_invoice_number: profile.next_invoice_number + 1,
    })
    .eq("id", userId);

  if (updateError) throw updateError;

  return invoice;
}

// Updates an existing invoice in place. Never touches invoice_number and
// never touches profiles.next_invoice_number — the number is set exactly
// once, at creation, and stays fixed for the life of the invoice.
export async function updateInvoice(invoiceId, invoiceData, items = []) {
  const { data: invoice, error: invoiceError } = await supabase
    .from("invoices")
    .update({ ...invoiceData })
    .eq("id", invoiceId)
    .select()
    .single();

  if (invoiceError) throw invoiceError;

  // Replace line items wholesale: delete the old set, insert the current one.
  // Simpler and safer than diffing, and invoice_items has no external
  // references that would make deletion unsafe.
  const { error: deleteItemsError } = await supabase
    .from("invoice_items")
    .delete()
    .eq("invoice_id", invoiceId);

  if (deleteItemsError) throw deleteItemsError;

  if (items.length) {
    const invoiceItems = items.map((item) => ({
      invoice_id: invoiceId,
      deliverable: item.label ?? item.type,
      detail: item.detail ?? null,
      qty: item.qty,
      rate: item.rate ?? 0,
      amount: Number(item.qty || 0) * Number(item.rate || 0),
    }));

    const { error: itemsError } = await supabase
      .from("invoice_items")
      .insert(invoiceItems);

    if (itemsError) throw itemsError;
  }

  return invoice;
}
export async function deleteInvoiceByDealId(dealId) {
  const { data: invoice, error } = await supabase
    .from("invoices")
    .select("id")
    .eq("deal_id", dealId)
    .maybeSingle();

  if (error) throw error;

  // No invoice linked to this deal
  if (!invoice) return;

  await deleteInvoice(invoice.id);
}
// Deletes the invoice and its items. Deliberately does NOT touch
// profiles.next_invoice_number — invoice numbers are never reused, even
// for a deleted invoice, so the sequence only ever moves forward.
export async function deleteInvoice(invoiceId) {
  const { error: itemsError } = await supabase
    .from("invoice_items")
    .delete()
    .eq("invoice_id", invoiceId);

  if (itemsError) throw itemsError;

  const { error: invoiceError } = await supabase
    .from("invoices")
    .delete()
    .eq("id", invoiceId);

  if (invoiceError) throw invoiceError;
}
export async function getInvoices() {
  const { data, error } = await supabase
    .from("invoices")
    .select("*")
    .order("invoice_date", { ascending: false });

  if (error) throw error;

  return data ?? [];
}