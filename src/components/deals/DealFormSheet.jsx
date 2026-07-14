import { useState, useEffect } from "react";
import Field from "../common/Field";
import ChipSelect from "../common/ChipSelect";
import SectionLabel from "../common/SectionLabel";
import { X } from "lucide-react";
import {formatDate,formatINR} from "../../utils/formatters";
import DateField from "../common/DateField";
import {
  COLLABORATION_TYPES,
  PAYMENT_STATUS,
  PAYMENT_MODES,
  DELIVERABLE_OPTIONS,
  DEAL_STATUS,
  CURRENCIES,
  CONFIRMATION_MODES,
} from "../../utils/constants";

function DealFormSheet({
  initial,
  brands = [],
  onSave,
  onClose,
}) {
 const [form, setForm] = useState(
  initial ?? {
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
    campaign_links: [],

    commercials: "",
    currency: "INR",
    payment_mode: "UPI",
    payment_status: "Pending",
    payment_deadline: "",
    payment_received_date: "",
    payment_received_amount: "",

    deal_status: "Negotiation",

    invoice_sent: false,
    invoice_number: "",
    transaction_id: "",

    notes: "",
  }
);
const update = (field, value) => {
  setForm((prev) => {
    const next = {
      ...prev,
      [field]: value,
    };

    // Collaboration type
    if (field === "collaboration_type") {
      if (value === "Barter") {
        next.commercials = 0;
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

      // Partially Paid doesn't change anything
      // User enters the amount manually
    }

    // If commercials change while payment is marked Paid,
    // keep received amount synced.
    if (
      field === "commercials" &&
      prev.payment_status === "Paid"
    ) {
      next.payment_received_amount = value;
    }

    return next;
  });
};

  const toggleDeliverable = (item) => {
    setForm((prev) => {
      const exists = prev.deliverables.includes(item);

      return {
        ...prev,
        deliverables: exists
          ? prev.deliverables.filter((d) => d !== item)
          : [...prev.deliverables, item],
      };
    });
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  if (!form.brand_name.trim()) {
    alert("Brand name is required.");
    return;
  }

  if (!form.deal_title.trim()) {
    alert("Deal title is required.");
    return;
  }

  if (!form.confirmation_date) {
    alert("Confirmation date is required.");
    return;
  }

 if (
  form.commercials === "" ||
  Number(form.commercials) <= 0
) {
  alert("Commercial amount must be greater than zero.");
  return;
}
// Overdue requires payment deadline
if (
  form.payment_status === "Overdue" &&
  !form.payment_deadline
) {
  alert("Payment deadline is required for overdue payments.");
  return;
}
// Overdue requires payment deadline
if (
  form.payment_status === "Overdue" &&
  !form.payment_deadline
) {
  alert("Payment deadline is required for overdue payments.");
  return;
}

// Paid or Partially Paid requires payment received date
if (
  (form.payment_status === "Paid" ||
    form.payment_status === "Partially Paid") &&
  !form.payment_received_date
) {
  alert("Payment received date is required.");
  return;
}

// Partially Paid amount must be less than commercials
if (
  form.payment_status === "Partially Paid" &&
  Number(form.payment_received_amount) >= Number(form.commercials)
) {
  alert(
    "Payment received amount must be less than the commercial amount."
  );
  return;
}

// Partially Paid amount must be greater than zero
if (
  form.payment_status === "Partially Paid" &&
  Number(form.payment_received_amount) <= 0
) {
  alert(
    "Payment received amount must be greater than zero."
  );
  return;
}

// Invoice sent requires invoice number
if (
  form.invoice_sent &&
  !form.invoice_number.trim()
) {
  alert("Invoice number is required.");
  return;
}

// Invoice sent requires transaction id
if (
  form.invoice_sent &&
  !form.transaction_id.trim()
) {
  alert("Transaction ID is required.");
  return;
}
// Invoice sent requires invoice number
if (
  form.invoice_sent &&
  !form.invoice_number.trim()
) {
  alert("Invoice number is required.");
  return;
}

// Invoice sent requires transaction id
if (
  form.invoice_sent &&
  !form.transaction_id.trim()
) {
  alert("Transaction ID is required.");
  return;
}
  const emptyToNull = (value) =>
    value === "" || value === undefined ? null : value;

  const deal = {
    ...form,

    // Numbers
    commercials: Number(form.commercials),
    deliverable_count: Number(form.deliverable_count),
    payment_received_amount:
      form.payment_received_amount === ""
        ? null
        : Number(form.payment_received_amount),

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
    campaign_links: form.campaign_links || [],

    // Boolean
    invoice_sent: form.invoice_sent,
  };

console.log("Deal being submitted:", deal);

  try {
    await onSave(deal);
  } catch (err) {
    console.error(err);
    alert(err.message);
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
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
        }}
      >
        <X size={20} />
      </button>
    </div>

    <form
      onSubmit={handleSubmit}
      className="dp-scroll"
      style={{
        overflowY: "auto",
        flex: 1,
        padding: "18px",
      }}
    >

     <SectionLabel>Brand Details</SectionLabel>

<Field label="Brand Name *">
  <input
    className="dp-input"
    value={form.brand_name}
    onChange={(e) => update("brand_name", e.target.value)}
    placeholder="Nike India"
  />
</Field>

<Field label="POC Name">
  <input
    className="dp-input"
    value={form.poc_name}
    onChange={(e) => update("poc_name", e.target.value)}
    placeholder="John Doe"
  />
</Field>

<Field label="Contact Number">
  <input
    className="dp-input"
    value={form.contact_number}
    onChange={(e) => update("contact_number", e.target.value)}
    placeholder="+91 9876543210"
  />
</Field>

<SectionLabel>Deal Details</SectionLabel>

<Field label="Deal Title *">
  <input
    className="dp-input"
    value={form.deal_title}
    onChange={(e) => update("deal_title", e.target.value)}
    placeholder="Instagram Reel Campaign"
  />
</Field>

<Field label="Collaboration Type">
<ChipSelect
    options={COLLABORATION_TYPES}
    value={form.collaboration_type}
    onChange={(v) => update("collaboration_type", v)}
    />
</Field>


<SectionLabel>Confirmation</SectionLabel>

<Field label="Confirmation Date *">
 <DateField
  value={form.confirmation_date}
  onChange={(value) => update("confirmation_date", value)}
  placeholder="Select confirmation date"
/>
</Field>

<Field label="Confirmation Mode">
  <ChipSelect
    options={CONFIRMATION_MODES}
    value={form.confirmation_mode}
    onChange={(v) =>
      update("confirmation_mode", v)
    }
  />
</Field>

<SectionLabel>Content</SectionLabel>

<Field label="Deliverables">
  <ChipSelect
    options={DELIVERABLE_OPTIONS}
    value={form.deliverables}
    onChange={toggleDeliverable}
    multi
  />
</Field>

<Field label="Deliverable Count">
  <input
    type="number"
    min="1"
    className="dp-input"
    value={form.deliverable_count}
    onChange={(e) =>
      update("deliverable_count", Number(e.target.value))
    }
  />
</Field>

<Field label="Content Due Date">
  <DateField
  value={form.content_due_date}
  onChange={(value) => update("content_due_date", value)}
  placeholder="Select content due date"
/>
</Field>

<Field label="Content Submitted Date">
 <DateField
  value={form.content_submitted_date}
  onChange={(value) => update("content_submitted_date", value)}
  placeholder="Select content submitted date"
/>
</Field>

<Field label="Posted Date">
 <DateField
  value={form.posted_date}
  onChange={(value) => update("posted_date", value)}
  placeholder="Select posted date"
/>
</Field>

<Field label="Campaign Links">
  <textarea
    rows={3}
    className="dp-input"
    value={(form.campaign_links || []).join("\n")}
    onChange={(e) =>
      update(
        "campaign_links",
        e.target.value
          .split("\n")
          .map((x) => x.trim())
          .filter(Boolean)
      )
    }
    placeholder={`One link per line\nhttps://instagram.com/reel/...`}
  />
</Field>

<SectionLabel>Commercials</SectionLabel>

<Field label="Commercials (₹) *">
  <input
    type="number"
    className="dp-input"
    value={form.commercials}
    onChange={(e) =>
      update("commercials", e.target.value)
    }
  />
</Field>

<Field label="Currency">
  <ChipSelect
    options={CURRENCIES}
    value={form.currency}
    onChange={(v) => update("currency", v)}
  />
</Field>

<Field label="Payment Mode">
 <ChipSelect
    options={PAYMENT_MODES}
    value={form.payment_mode}
    onChange={(v) =>
      update("payment_mode", v)
    }
  />
</Field>

<Field label="Payment Status">
 <ChipSelect
    options={PAYMENT_STATUS}
    value={form.payment_status}
    onChange={(v) =>
      update("payment_status", v)
    }
  />
</Field>

<Field
  label={
    form.payment_status === "Overdue"
      ? "Payment Deadline *"
      : "Payment Deadline"
  }
>
 <DateField
  value={form.payment_deadline}
  onChange={(value) => update("payment_deadline", value)}
  placeholder={
    form.payment_status === "Overdue"
      ? "Payment deadline (required)"
      : "Select payment deadline"
  }
/>
</Field>

<Field label="Payment Received Date">
  <DateField
    value={form.payment_received_date}
    onChange={(value) =>
      update("payment_received_date", value)
    }
    placeholder="Select payment received date"
  />
</Field>

<Field label="Payment Received Amount">
 <input
    type="number"
    className="dp-input"
    value={form.payment_received_amount}
    disabled={
        form.payment_status === "Pending" ||
        form.payment_status === "Overdue"
    }
    onChange={(e)=>
        update("payment_received_amount", e.target.value)
    }
/>
</Field>

<SectionLabel>Status</SectionLabel>

<Field label="Deal Status">
<ChipSelect
    options={DEAL_STATUS}
    value={form.deal_status}
    onChange={(v) =>
      update("deal_status", v)
    }
  />
</Field>

<SectionLabel>Invoice</SectionLabel>

<Field label="Invoice Sent">
  <ChipSelect
    options={[true, false]}
    labels={{
      true: "Yes",
      false: "No",
    }}
    value={form.invoice_sent}
    onChange={(v) =>
      update("invoice_sent", v)
    }
  />
</Field>

{form.invoice_sent && (
  <>
    <Field label="Invoice Number *">
      <input
        className="dp-input"
        value={form.invoice_number}
        onChange={(e) =>
          update("invoice_number", e.target.value)
        }
      />
    </Field>

    <Field label="Transaction ID *">
      <input
        className="dp-input"
        value={form.transaction_id}
        onChange={(e) =>
          update("transaction_id", e.target.value)
        }
      />
    </Field>
  </>
)}

<SectionLabel>Notes</SectionLabel>

<Field label="Notes">
  <textarea
    rows={4}
    className="dp-input"
    value={form.notes}
    onChange={(e) =>
      update("notes", e.target.value)
    }
    placeholder="Any additional information..."
  />
</Field>

  <div
    style={{
      padding: 16,
      borderTop: "1px solid var(--line)",
    }}
  >
    <button
      type="submit"
      className="dp-btn-signal"
    >
      {initial ? "Save Changes" : "Save Deal"}
    </button>
  </div>
    </form>
  </div>
</>
  );
}
export default DealFormSheet;