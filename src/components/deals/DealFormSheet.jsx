import { useState } from "react";
import Field from "../common/Field";
import ChipSelect from "../common/ChipSelect";
import SectionLabel from "../common/SectionLabel";
import { X, Receipt, Link2, PenLine, CheckCircle2 } from "lucide-react";
import { formatDate, formatINR } from "../../utils/formatters";
import DateField from "../common/DateField";
import DeliverablesSelector from "./DeliverablesSelector";
import {
  COLLABORATION_TYPES,
  PAYMENT_STATUS,
  PAYMENT_MODES,
  DEAL_STATUS,
  CURRENCIES,
  CONFIRMATION_MODES,
   PAYMENT_STATUS_COLORS,
  DEAL_STATUS_COLORS,
  COLLABORATION_TYPE_COLORS,
} from "../../utils/constants";

function DealFormSheet({ initial, brands = [], onSave, onClose, showAlert }) {
  // If this deal already has an invoice_number on record, it means an
  // invoice was created and saved for it via Invoice Studio (InvoiceEditorPage
  // writes deals.invoice_number automatically on save). In that case the
  // field below is auto-filled and locked. If there's no invoice_number yet,
  // the user is free to type one in manually — e.g. if they generated the
  // invoice using a different app/tool outside DealPass. This is captured
  // once at mount so it doesn't flip mid-edit as the user types.
  const [autoInvoiceNumber] = useState(() => (initial?.invoice_number || "").trim());

  const [form, setForm] = useState(() => {
    const base = initial ?? {
      brand_name: "",
      poc_name: "",
      contact_number: "",
      deal_title: "",
      collaboration_type: "Paid",
      confirmation_date: "",
      confirmation_mode: "Email",
      deliverables: [],
      deliverable_count: 1,
      content_due_date: "",
      content_submitted_date: "",
      posted_date: "",
      campaign_links: "",
      commercials: "",
      currency: "INR",
      payment_mode: "UPI",
      payment_status: "Pending",
      payment_deadline: "",
      payment_received_date: "",
      payment_received_amount: "",
      deal_status: "Negotiation",
      invoice_number: "",
      transaction_id: "",
      notes: "",
    };

    return {
      ...base,
      // Normalize campaign_links to a plain string once, so the textarea
      // is always bound to a string and never silently mangled by React.
      campaign_links: Array.isArray(base.campaign_links)
        ? base.campaign_links.join(" ")
        : base.campaign_links || "",
      // Make sure the invoice number field always mirrors whatever's on
      // the deal record (auto-synced by Invoice Studio) rather than
      // whatever stale value might otherwise be sitting in local state.
      invoice_number: base.invoice_number || "",
    };
  });

  const [saving, setSaving] = useState(false);
  const isBarter = form.collaboration_type === "Barter";

  const update = (field, value) => {
    setForm((prev) => {
      const next = { ...prev, [field]: value };

      // Collaboration type
      if (field === "collaboration_type") {
        if (value === "Barter") {
          next.commercials = 0;
          next.currency = "N/A";
          next.payment_mode = "Barter";
          next.payment_status = "Barter";
          next.payment_deadline = "";
          next.payment_received_date = "";
          next.payment_received_amount = null;
        } else {
          next.currency = "INR";
          next.payment_mode = "UPI";
          next.payment_status = "Pending";
        }
      }

      // Payment status logic
      if (field === "payment_status") {
        if (value === "Pending") {
          next.payment_received_amount = "";
          next.payment_received_date = "";
        }

        if (value === "Overdue") {
          next.payment_received_amount = "";
          next.payment_received_date = "";
        }

        if (value === "Paid") {
          next.payment_received_amount = next.commercials;
        }

        // Partially Paid doesn't change anything — entered manually
      }

      // If commercials change while payment is marked Paid, keep received amount synced.
      if (field === "commercials" && prev.payment_status === "Paid") {
        next.payment_received_amount = value;
      }

      if (field === "deliverables") {
        next.deliverable_count = value.reduce((total, item) => total + item.qty, 0);
      }

      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.brand_name.trim()) {
      showAlert("warning", "Brand Name Required", "Please enter the brand name.");
      return;
    }

    if (!form.deal_title.trim()) {
      showAlert("warning", "Deal Title Required", "Please enter the deal title.");
      return;
    }

    if (!form.confirmation_date) {
      showAlert("warning", "Confirmation Date Required", "Please select the confirmation date.");
      return;
    }

    if (form.collaboration_type === "Paid" && (form.commercials === "" || Number(form.commercials) <= 0)) {
      showAlert("warning", "Commercial Amount Required", "Please enter a commercial amount greater than ₹0.");
      return;
    }

    if (form.deliverables.length === 0) {
      showAlert("warning", "Deliverables Required", "Please select at least one deliverable.");
      return;
    }

    if (form.payment_status === "Overdue" && !form.payment_deadline) {
      showAlert("warning", "Payment Deadline Required", "Please select the payment deadline.");
      return;
    }

    if (
      (form.payment_status === "Paid" || form.payment_status === "Partially Paid") &&
      !form.payment_received_date
    ) {
      showAlert("warning", "Payment Received Date Required", "Please select the payment received date.");
      return;
    }

    if (form.payment_status === "Partially Paid" && Number(form.payment_received_amount) <= 0) {
      showAlert("warning", "Invalid Payment Amount", "Please enter the amount received.");
      return;
    }

    if (
      form.payment_status === "Partially Paid" &&
      Number(form.payment_received_amount) >= Number(form.commercials)
    ) {
      showAlert(
        "warning",
        "Invalid Payment Amount",
        "Received amount cannot be greater than or equal to the commercial amount."
      );
      return;
    }

    if (form.payment_status === "Paid" && Number(form.payment_received_amount) !== Number(form.commercials)) {
      showAlert(
        "warning",
        "Payment Amount Mismatch",
        "For fully paid deals, the received amount must equal the commercial amount."
      );
      return;
    }

    // Invoice number and transaction ID are optional — a deal can exist
    // without an invoice ever being raised for it, so nothing is enforced
    // here beyond what's already captured above.

    // All validation passed — lock the form so it can't be double-submitted.
    setSaving(true);

    const emptyToNull = (value) => (value === "" || value === undefined ? null : value);

    const deal = {
      ...form,
      currency: form.currency,
      payment_mode: form.payment_mode,
      payment_status: form.payment_status,

      // Numbers
      commercials: Number(form.commercials),
      deliverable_count: form.deliverables.reduce((total, item) => total + item.qty, 0),
      payment_received_amount:
        form.payment_received_amount === "" ? null : Number(form.payment_received_amount),

      // Dates
      confirmation_date: form.confirmation_date,
      content_due_date: emptyToNull(form.content_due_date),
      content_submitted_date: emptyToNull(form.content_submitted_date),
      posted_date: emptyToNull(form.posted_date),
      payment_deadline: emptyToNull(form.payment_deadline),
      payment_received_date: emptyToNull(form.payment_received_date),

      // Optional text
      poc_name: emptyToNull(form.poc_name),
      contact_number: emptyToNull(form.contact_number),
      invoice_number: emptyToNull(form.invoice_number),
      transaction_id: emptyToNull(form.transaction_id),
      notes: emptyToNull(form.notes),

      // Arrays
      deliverables: form.deliverables || [],
      campaign_links:
        typeof form.campaign_links === "string"
          ? form.campaign_links.trim().split(/\s+/).filter(Boolean)
          : form.campaign_links || [],

      // Boolean — there's no manual toggle anymore; a deal is considered
      // "invoiced" simply when it has an invoice number attached, whether
      // that came from Invoice Studio automatically or was typed in here.
      invoice_sent: Boolean(form.invoice_number && form.invoice_number.trim()),
    };

    try {
      await onSave(deal);
    } catch (err) {
      console.error(err);

      showAlert("error", "Failed to Save Deal", err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="dp-sheet-backdrop" onClick={onClose} />

      <div className="dp-sheet">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "16px 18px",
            borderBottom: "1px solid var(--line)",
          }}
        >
          <div className="dp-display" style={{ fontWeight: 700 }}>
            {initial ? "Edit Deal" : "Add Deal"}
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{ background: "none", border: "none", cursor: "pointer" }}
          >
            <X size={20} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="dp-scroll"
          style={{ overflowY: "auto", flex: 1, padding: "18px" }}
        >
          <SectionLabel>Brand Details</SectionLabel>

          <Field label="Brand Name *">
            <input
              className="dp-input"
              value={form.brand_name}
              onChange={(e) => update("brand_name", e.target.value)}
            />
          </Field>

          <Field label="POC Name">
            <input
              className="dp-input"
              value={form.poc_name}
              onChange={(e) => update("poc_name", e.target.value)}
            />
          </Field>

          <Field label="Contact Number">
            <input
              className="dp-input"
              value={form.contact_number}
              onChange={(e) =>
                update("contact_number", e.target.value.replace(/\D/g, "").slice(0, 10))
              }
            />
          </Field>

          <SectionLabel>Deal Details</SectionLabel>

          <Field label="Deal Title *">
            <input
              className="dp-input"
              value={form.deal_title}
              onChange={(e) => update("deal_title", e.target.value)}
            />
          </Field>

      <Field label="Collaboration Type">
  <ChipSelect
    options={COLLABORATION_TYPES}
    value={form.collaboration_type}
    onChange={(v) => update("collaboration_type", v)}
    colors={COLLABORATION_TYPE_COLORS}
  />
</Field>

          <SectionLabel>Confirmation</SectionLabel>

          <Field label="Confirmation Date *">
            <DateField
              value={form.confirmation_date}
              onChange={(value) => update("confirmation_date", value)}
              placeholder="Select confirmation date"
              maxDate={new Date().toISOString().slice(0, 10)}
            />
          </Field>

          <Field label="Confirmation Mode">
            <ChipSelect
              options={CONFIRMATION_MODES}
              value={form.confirmation_mode}
              onChange={(v) => update("confirmation_mode", v)}
            />
          </Field>

          <SectionLabel>Content</SectionLabel>

          <Field label="Deliverables">
            <DeliverablesSelector
              value={form.deliverables}
              onChange={(deliverables) => update("deliverables", deliverables)}
            />
          </Field>

          <Field label="Deliverable Count">
            <input type="number" className="dp-input" value={form.deliverable_count} readOnly />
          </Field>

          <Field label="Content Due Date">
            <DateField
              value={form.content_due_date}
              onChange={(value) => update("content_due_date", value)}
              placeholder="Select due date"
              minDate={form.confirmation_date}
            />
          </Field>

          <Field label="Content Submitted Date">
            <DateField
              value={form.content_submitted_date}
              onChange={(value) => update("content_submitted_date", value)}
              minDate={form.confirmation_date}
              maxDate={new Date().toISOString().slice(0, 10)}
            />
          </Field>

          <Field label="Posted Date">
            <DateField
              value={form.posted_date}
              onChange={(value) => update("posted_date", value)}
              minDate={form.confirmation_date}
              maxDate={new Date().toISOString().slice(0, 10)}
            />
          </Field>

          <Field label="Campaign Links">
            <textarea
              rows={4}
              className="dp-input"
              value={form.campaign_links}
              onChange={(e) => update("campaign_links", e.target.value)}
              placeholder="Paste Instagram/YouTube links separated by spaces"
            
            />
          </Field>

          <SectionLabel>Commercials</SectionLabel>

          {isBarter && (
            <div
              style={{
                marginBottom: 14,
                padding: "10px 12px",
                borderRadius: 10,
                background: "#FFF8E6",
                border: "1px solid #F4D27A",
                color: "#8A5A00",
                fontSize: 13,
                lineHeight: 1.5,
              }}
            >
              ⚠️ Payment details are unavailable because this is a barter collaboration.
            </div>
          )}

          <Field label="Commercials *">
            <input
              type="number"
              className="dp-input"
              disabled={isBarter}
              value={form.commercials}
              onChange={(e) => update("commercials", e.target.value)}
            />
          </Field>

          <Field label="Currency">
            <ChipSelect
              disabled={isBarter}
              options={CURRENCIES}
              value={form.currency}
              onChange={(v) => update("currency", v)}
            />
          </Field>

          <Field label="Payment Mode">
            <ChipSelect
              disabled={isBarter}
              options={PAYMENT_MODES}
              value={form.payment_mode}
              onChange={(v) => update("payment_mode", v)}
            />
          </Field>

    <Field label="Payment Status">
  <ChipSelect
    disabled={isBarter}
    options={PAYMENT_STATUS}
    value={form.payment_status}
    onChange={(v) => update("payment_status", v)}
    colors={PAYMENT_STATUS_COLORS}
  />
</Field>
          <Field label="Payment Deadline">
            <DateField
              disabled={isBarter}
              value={form.payment_deadline}
              onChange={(value) => update("payment_deadline", value)}
              placeholder={
                form.payment_status === "Overdue" ? "Payment deadline (required)" : "Select payment deadline"
              }
              minDate={form.confirmation_date}
            />
          </Field>

          <Field label="Payment Received Date">
            <DateField
              value={form.payment_received_date}
              onChange={(value) => update("payment_received_date", value)}
              placeholder="Select payment received date"
              minDate={form.confirmation_date}
              maxDate={new Date().toISOString().slice(0, 10)}
              disabled={
                isBarter || form.payment_status === "Pending" || form.payment_status === "Overdue"
              }
            />
          </Field>

          <Field label="Payment Received Amount">
            <input
              type="number"
              className="dp-input"
              value={form.payment_received_amount}
              disabled={
                isBarter || form.payment_status === "Pending" || form.payment_status === "Overdue"
              }
              onChange={(e) => update("payment_received_amount", e.target.value)}
            />
          </Field>

          <SectionLabel>Status</SectionLabel>

         <Field label="select your current Deal Status">
  <ChipSelect
    options={DEAL_STATUS}
    value={form.deal_status}
    onChange={(v) => update("deal_status", v)}
    colors={DEAL_STATUS_COLORS}
  />
</Field>

          <SectionLabel>Invoice</SectionLabel>

          <div
            style={{
              border: "1px solid var(--line)",
              borderRadius: 14,
              padding: 16,
              marginBottom: 4,
              background: "var(--surface, #fff)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 10,
                marginBottom: 14,
                flexWrap: "wrap",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 9,
                    background: autoInvoiceNumber ? "#F5F4FF" : "#F1F2F8",
                    border: `1px solid ${autoInvoiceNumber ? "#DCD6FF" : "var(--line)"}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Receipt size={15} color={autoInvoiceNumber ? "#6C5CE7" : "#5B6472"} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13.5 }}>Invoice details</div>
                  <div style={{ fontSize: 11.5, color: "var(--muted, #5B6472)" }}>
                    Optional — fill in only once an invoice exists
                  </div>
                </div>
              </div>

              {autoInvoiceNumber ? (
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                    padding: "5px 10px",
                    borderRadius: 999,
                    background: "#F5F4FF",
                    border: "1px solid #DCD6FF",
                    color: "#4C3FBF",
                    fontSize: 11,
                    fontWeight: 700,
                  }}
                >
                  <Link2 size={11} />
                  Synced from Invoice Studio
                </span>
              ) : form.invoice_number?.trim() ? (
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                    padding: "5px 10px",
                    borderRadius: 999,
                    background: "#F0FDF4",
                    border: "1px solid #BBF7D0",
                    color: "#166534",
                    fontSize: 11,
                    fontWeight: 700,
                  }}
                >
                  <PenLine size={11} />
                  Manual entry
                </span>
              ) : (
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                    padding: "5px 10px",
                    borderRadius: 999,
                    background: "#F7F8FC",
                    border: "1px solid var(--line)",
                    color: "var(--muted, #5B6472)",
                    fontSize: 11,
                    fontWeight: 700,
                  }}
                >
                  Not invoiced yet
                </span>
              )}
            </div>

            <Field label="Invoice Number">
              {autoInvoiceNumber ? (
                <div style={{ position: "relative" }}>
                  <input
                    className="dp-input"
                    value={form.invoice_number}
                    readOnly
                    style={{ paddingRight: 34 }}
                  />
                  <CheckCircle2
                    size={16}
                    color="#6C5CE7"
                    style={{
                      position: "absolute",
                      right: 12,
                      top: "50%",
                      transform: "translateY(-50%)",
                    }}
                  />
                </div>
              ) : (
                <input
                  className="dp-input"
                  value={form.invoice_number}
                  onChange={(e) => update("invoice_number", e.target.value)}
                  placeholder="e.g. INV-2026-1042 (optional)"
                />
              )}
            </Field>

            <div
              style={{
                marginTop: -10,
                marginBottom: 14,
                fontSize: 12,
                lineHeight: 1.5,
                color: "var(--muted, #5B6472)",
              }}
            >
              {autoInvoiceNumber
                ? "This invoice was created and saved in Invoice Studio, so its number is synced here automatically and can't be edited."
                : "Made the invoice somewhere else? Enter its number here. Generate one from Invoice Studio instead and it'll fill in automatically."}
            </div>

            <Field label="Transaction ID">
              <input
                className="dp-input"
                value={form.transaction_id}
                onChange={(e) => update("transaction_id", e.target.value)}
                placeholder="Optional — reference from your payment app or bank"
              />
            </Field>
          </div>

          <SectionLabel>Notes</SectionLabel>

          <Field label="Enter notes if any">
            <textarea
              rows={4}
              className="dp-input"
              value={form.notes}
              onChange={(e) => update("notes", e.target.value)}
              placeholder="Any additional information..."
            />
          </Field>

          <div style={{ padding: 16, borderTop: "1px solid var(--line)" }}>
            <button type="submit" className="dp-btn-signal" disabled={saving}>
              {saving ? "Saving..." : initial ? "Save Changes" : "Save Deal"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

export default DealFormSheet;