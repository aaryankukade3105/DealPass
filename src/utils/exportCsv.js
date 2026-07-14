import Papa from "papaparse";

export function exportDealsCSV(deals) {
  const rows = deals.map((deal) => ({
    Brand: deal.brand_name,
    "Deal Title": deal.deal_title,
    Type: deal.collaboration_type,
    Commercials: deal.commercials,
    Currency: deal.currency,
    "Deal Status": deal.deal_status,
    "Payment Status": deal.payment_status,
    "Payment Mode": deal.payment_mode,
    "Payment Received": deal.payment_received_amount,
    "Confirmation Date": deal.confirmation_date,
    "Content Due": deal.content_due_date,
    "Content Submitted": deal.content_submitted_date,
    Posted: deal.posted_date,
    "Payment Deadline": deal.payment_deadline,
    "Payment Received Date": deal.payment_received_date,
    Deliverables: (deal.deliverables || []).join(", "),
    "POC Name": deal.poc_name,
    Contact: deal.contact_number,
    "Invoice Sent": deal.invoice_sent ? "Yes" : "No",
    "Invoice Number": deal.invoice_number,
    "Transaction ID": deal.transaction_id,
    Notes: deal.notes,
  }));

  const csv = Papa.unparse(rows);

  const blob = new Blob([csv], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");

  link.href = url;

  link.download = `DealPass_${new Date()
    .toISOString()
    .split("T")[0]}.csv`;

  document.body.appendChild(link);

  link.click();

  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}