import { useEffect, useState, useRef } from "react";
import { ArrowLeft, FileText, Eye, Download, X } from "lucide-react";
import { supabase } from "../lib/supabase";
import Field from "../components/common/Field";
import SectionLabel from "../components/common/SectionLabel";
import DateField from "../components/common/DateField";
import html2pdf from "html2pdf.js";
function formatDisplayDate(dateStr) {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatAmount(value) {
  if (value === null || value === undefined || value === "") return "-";
  return `₹${Number(value).toLocaleString("en-IN")}`;
}
function displayValue(value, type = "text") {
  if (value === null || value === undefined || value === "") {
    switch (type) {
      case "date":
        return "Not Specified";

      case "optional":
        return "Not Applicable";

      case "billing":
        return "Not Available";

      default:
        return "Not Provided";
    }
  }

  return value;
}
const Divider = () => (
  <div
    style={{
      borderTop: "1px dashed #cbd5e1",
      margin: "14px 0",
    }}
  />
);

export default function InvoiceEditorPage({ deal, onBack }) {
  const today = new Date();
  const year = today.getFullYear();
  const randomNumber = String(Math.floor(Math.random() * 9000) + 1000);
  const defaultInvoiceNumber = `INV-${year}-${randomNumber}`;

  const [invoice, setInvoice] = useState({
    invoiceNumber: defaultInvoiceNumber,
    invoiceDate: today.toISOString().slice(0, 10),
    dueDate: "",

    clientName: "",
    companyName: "",
    clientEmail: "",
    clientPhone: "",
    billingAddress: "",
    gstNumber: "",
  });

  const [billingProfile, setBillingProfile] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    loadBillingProfile();
  }, []);

  async function loadBillingProfile() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data } = await supabase
      .from("billing_profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    setBillingProfile(data);
  }

  const update = (field, value) => {
    setInvoice((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const lineItems = (deal?.deliverables || []).map((item) => ({
    label: item.type,
    qty: item.qty,
    rate: item.rate ?? null,
    amount: item.rate ? item.rate * item.qty : null,
  }));

  const subtotal = Number(deal?.commercials || 0);
  const gst = 0;
  const total = subtotal + gst;

  return (
    <div
      style={{
        flex: 1,
        height: "100%",
        overflow: "auto",
        background: "#f3f4f6",
        padding: 40,
      }}
    >
      {/* Header */}
      <div
        style={{
          maxWidth: 900,
          margin: "0 auto 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <button className="dp-btn-secondary" onClick={onBack}>
          <ArrowLeft size={18} />
          Back
        </button>

        <div
          className="dp-display"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 30,
            fontWeight: 700,
          }}
        >
          <FileText size={28} />
          Invoice Editor
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <button
            className="dp-btn-secondary"
            onClick={() => setShowPreview(true)}
          >
            <Eye size={18} />
            Preview
          </button>

        </div>
      </div>

      {/* A4 Paper */}
      <div
        style={{
          width: "100%",
          maxWidth: 794,
          minHeight: 1123,
          background: "#fff",
          margin: "0 auto",
          padding: 40,
          boxSizing: "border-box",
          boxShadow: "0 15px 40px rgba(0,0,0,.12)",
          borderRadius: 10,
        }}
      >
        {/* Hero */}
        <div
          style={{
            background: "linear-gradient(135deg,#2563eb,#1d4ed8)",
            color: "#fff",
            borderRadius: 18,
            padding: 28,
            marginBottom: 32,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <div
              className="dp-display"
              style={{ fontSize: 30, fontWeight: 700, marginBottom: 6 }}
            >
              Create Invoice
            </div>
            <div style={{ opacity: 0.9, fontSize: 15 }}>
              Generate a professional invoice for your collaboration.
            </div>
          </div>

          <div
            style={{
              background: "rgba(255,255,255,.18)",
              padding: "14px 18px",
              borderRadius: 12,
              textAlign: "right",
            }}
          >
            <div style={{ fontSize: 12, opacity: 0.8 }}>Invoice No.</div>
            <div style={{ fontSize: 22, fontWeight: 700 }}>
              {invoice.invoiceNumber}
            </div>
          </div>
        </div>

        {/* Progress */}
        <div
          style={{
            background: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: 18,
            padding: 20,
            marginBottom: 32,
          }}
        >
          <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 18 }}>
            🚀 Invoice Progress
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 14,
              fontSize: 15,
            }}
          >
            <div>🟢 Deal Imported</div>
            <div>🟢 Billing Profile Connected</div>
            <div>🟠 Client Details Pending</div>
            <div>⚪ Preview & Download</div>
          </div>
        </div>

        <SectionLabel>Invoice Details</SectionLabel>

        <Field label="Invoice Number">
          <input
            className="dp-input"
            value={invoice.invoiceNumber}
            onChange={(e) => update("invoiceNumber", e.target.value)}
          />
        </Field>

        <Field label="Invoice Date">
          <DateField
            value={invoice.invoiceDate}
            onChange={(value) => update("invoiceDate", value)}
          />
        </Field>

        <Field label="Due Date">
          <DateField
            value={invoice.dueDate}
            onChange={(value) => update("dueDate", value)}
            placeholder="Select due date"
            minDate={invoice.invoiceDate}
          />
        </Field>

        <SectionLabel>From</SectionLabel>

        <p style={{ color: "#6b7280", marginBottom: 20, fontSize: 14 }}>
          These details are fetched from your Billing Profile.
        </p>

        <Field label="Name">
          <input className="dp-input" value={billingProfile?.full_name || ""} readOnly />
        </Field>

        <Field label="Email">
          <input className="dp-input" value={billingProfile?.email || ""} readOnly />
        </Field>

        <Field label="Phone Number">
          <input className="dp-input" value={billingProfile?.phone || ""} readOnly />
        </Field>

        <div
          style={{
            marginTop: 4,
            marginBottom: 24,
            padding: 14,
            borderRadius: 10,
            background: "#f9fafb",
            border: "1px dashed #d1d5db",
            color: "#6b7280",
            fontSize: 14,
          }}
        >
          ✨ These details are synced from your Billing Profile.
          <br />
          To make changes, go to <strong>Profile → Billing Profile</strong>.
        </div>

        <SectionLabel>Payment Details</SectionLabel>

        <p style={{ color: "#6b7280", marginBottom: 20, fontSize: 14 }}>
          These payment details are automatically fetched from your Billing Profile.
        </p>

        <Field label="Account Holder">
          <input className="dp-input" readOnly value={billingProfile?.account_holder || ""} />
        </Field>

        <Field label="Bank Name">
          <input className="dp-input" readOnly value={billingProfile?.bank_name || ""} />
        </Field>

        <Field label="Account Number">
          <input className="dp-input" readOnly value={billingProfile?.account_number || ""} />
        </Field>

        <Field label="IFSC Code">
          <input className="dp-input" readOnly value={billingProfile?.ifsc || ""} />
        </Field>

        <Field label="UPI ID">
          <input className="dp-input" readOnly value={billingProfile?.upi_id || ""} />
        </Field>

        <div
          style={{
            marginTop: 4,
            marginBottom: 24,
            padding: 14,
            borderRadius: 10,
            background: "#f9fafb",
            border: "1px dashed #d1d5db",
            color: "#6b7280",
            fontSize: 14,
          }}
        >
          💳 These payment details are synced with your Billing Profile and will
          appear on the final invoice.
        </div>

        <SectionLabel>Bill To</SectionLabel>

        <p style={{ color: "#6b7280", marginBottom: 20, fontSize: 14 }}>
          Enter your client's billing details.
        </p>

        <Field label="Client Name">
          <input
            className="dp-input"
            value={invoice.clientName}
            onChange={(e) => update("clientName", e.target.value)}
            placeholder="John Doe"
          />
        </Field>

        <Field label="Company Name">
          <input
            className="dp-input"
            value={invoice.companyName}
            onChange={(e) => update("companyName", e.target.value)}
            placeholder="Marvel Studios"
          />
        </Field>

        <Field label="Email">
          <input
            type="email"
            className="dp-input"
            value={invoice.clientEmail}
            onChange={(e) => update("clientEmail", e.target.value)}
            placeholder="billing@company.com"
          />
        </Field>

        <Field label="Phone">
          <input
            className="dp-input"
            value={invoice.clientPhone}
            onChange={(e) =>
              update("clientPhone", e.target.value.replace(/\D/g, "").slice(0, 10))
            }
            placeholder="+91 9876543210"
          />
        </Field>

        <Field label="Billing Address">
          <textarea
            rows={4}
            className="dp-input"
            value={invoice.billingAddress}
            onChange={(e) => update("billingAddress", e.target.value)}
            placeholder="Flat / Office No., Street, City, State, Pincode"
          />
        </Field>

        <Field label="GST Number">
          <input
            className="dp-input"
            value={invoice.gstNumber}
            onChange={(e) => update("gstNumber", e.target.value)}
            placeholder="Optional"
          />
        </Field>

        <div
          style={{
            marginTop: 4,
            marginBottom: 24,
            padding: 16,
            background: "#f9fafb",
            border: "1px dashed #d1d5db",
            borderRadius: 10,
            color: "#6b7280",
            fontSize: 14,
          }}
        >
          🚀 <strong>Coming Soon:</strong> Select an existing client from your saved
          contacts instead of entering these details every time.
        </div>

        <SectionLabel>Deliverables</SectionLabel>

        <p style={{ color: "#6b7280", marginBottom: 20, fontSize: 14 }}>
          These deliverables are automatically fetched from the selected deal.
        </p>

        <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 24 }}>
          <thead>
            <tr style={{ background: "#f9fafb" }}>
              <th style={{ width: 60, padding: 14, border: "1px solid #e5e7eb", textAlign: "center" }}>#</th>
              <th style={{ padding: 14, border: "1px solid #e5e7eb", textAlign: "left" }}>Deliverable</th>
              <th style={{ width: 120, padding: 14, border: "1px solid #e5e7eb", textAlign: "center" }}>Quantity</th>
            </tr>
          </thead>
          <tbody>
            {(deal?.deliverables || []).map((item, index) => (
              <tr key={item.id || index}>
                <td style={{ padding: 14, border: "1px solid #e5e7eb", textAlign: "center" }}>
                  {index + 1}
                </td>
                <td style={{ padding: 14, border: "1px solid #e5e7eb" }}>{item.type}</td>
                <td style={{ padding: 14, border: "1px solid #e5e7eb", textAlign: "center" }}>
                  {item.qty}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 20 }}>
          <div
            style={{
              width: 340,
              border: "1px solid #e5e7eb",
              borderRadius: 10,
              overflow: "hidden",
              background: "#fff",
            }}
          >
            <div
              style={{
                padding: "14px 18px",
                background: "#f9fafb",
                borderBottom: "1px solid #e5e7eb",
                fontWeight: 700,
                fontSize: 17,
              }}
            >
              Invoice Summary
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "16px 18px",
                borderBottom: "1px solid #e5e7eb",
              }}
            >
              <span>Subtotal</span>
              <strong>{formatAmount(subtotal)}</strong>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "16px 18px",
                borderBottom: "1px solid #e5e7eb",
                color: "#6b7280",
              }}
            >
              <span>GST</span>
              <span>{formatAmount(gst)}</span>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "18px",
                background: "#f9fafb",
                fontSize: 20,
                fontWeight: 700,
              }}
            >
              <span>Total</span>
              <span>{formatAmount(total)}</span>
            </div>
          </div>
        </div>

        <div
          style={{
            padding: 14,
            borderRadius: 10,
            background: "#f9fafb",
            border: "1px dashed #d1d5db",
            color: "#6b7280",
            fontSize: 14,
          }}
        >
          ✨ Deliverables and amount are synced with the selected deal. GST,
          discounts, taxes and editable line items will be supported in a future
          update.
        </div>
      </div>

      {showPreview && (
        <InvoicePreviewModal
          invoice={invoice}
          billingProfile={billingProfile}
          deal={deal}
          lineItems={lineItems}
          subtotal={subtotal}
          gst={gst}
          total={total}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  );
}

function InvoicePreviewModal({
  invoice,
  billingProfile,
  deal,
  lineItems,
  subtotal,
  gst,
  total,
  onClose,
}) {
const invoiceRef = useRef(null);
const downloadPDF = () => {
  const element = invoiceRef.current;

  if (!element) {
    alert("Invoice not found.");
    return;
  }

  html2pdf()
    .set({
      margin: 10,
      filename: `${invoice.invoiceNumber}.pdf`,
      image: {
        type: "jpeg",
        quality: 1,
      },
      html2canvas: {
        scale: 2,
        useCORS: true,
      },
      jsPDF: {
        unit: "mm",
        format: "a4",
        orientation: "portrait",
      },
    })
    .from(element)
    .save();
};
  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,.55)",
          zIndex: 50,
        }}
      />

      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 51,
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
          overflowY: "auto",
          padding: "40px 20px",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 640,
            background: "#fff",
            borderRadius: 10,
            boxShadow: "0 20px 60px rgba(0,0,0,.3)",
          }}
        >
          {/* Toolbar */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "14px 24px",
              borderBottom: "1px solid #e5e7eb",
              position: "sticky",
              top: 0,
              background: "#fff",
              borderRadius: "10px 10px 0 0",
            }}
          >
            <div style={{ fontWeight: 700, fontSize: 16 }}>
             Preview & Download
            </div>

            <div style={{ display: "flex", gap: 10 }}>
            <button
    className="dp-btn-primary"
    onClick={downloadPDF}
>
                <Download size={16} />
                Download PDF
              </button>

              <button
                onClick={onClose}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 4,
                      color: "#000", // Black icon
                }}
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Ledger-style invoice document */}
         <div
    ref={invoiceRef}
    style={{
        padding: "36px 40px",
              fontFamily:
                "'JetBrains Mono','Courier New',ui-monospace,monospace",
              fontSize: 13.5,
              lineHeight: 1.7,
              color: "#1f2937",
            }}
          >
            <div style={{ textAlign: "center", fontWeight: 700, letterSpacing: 2 }}>
              TAX INVOICE
            </div>

            <Divider />

            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontWeight: 700 }}>DealPass</span>
              <span>Invoice #{invoice.invoiceNumber}</span>
            </div>
            <div>Invoice Date: {formatDisplayDate(invoice.invoiceDate)}</div>
            <div>
  Due Date: {invoice.dueDate ? formatDisplayDate(invoice.dueDate) : displayValue("", "date")}
</div>

            <Divider />

            <div style={{ fontWeight: 700 }}>FROM</div>
            <div>{displayValue(billingProfile?.full_name, "billing")}</div>
            <div>{displayValue(billingProfile?.address, "billing")}</div>
            <div>Phone: {billingProfile?.phone || "-"}</div>
            <div>Email: {displayValue(billingProfile?.email, "billing")}</div>
            <div>PAN: {displayValue(billingProfile?.pan_number, "optional")}</div>
<div>GST: {displayValue(billingProfile?.gst_number, "optional")}</div>
            <Divider />

            <div style={{ fontWeight: 700 }}>BILL TO</div>
            <div>
  {displayValue(invoice.companyName || invoice.clientName)}
</div>
            {invoice.clientName && invoice.companyName && (
              <div>Attn: {invoice.clientName}</div>
            )}
            <div style={{ whiteSpace: "pre-line" }}>
            {displayValue(invoice.billingAddress)}
            </div>
            {invoice.clientEmail && <div>Email: {invoice.clientEmail}</div>}
            {invoice.clientPhone && <div>Phone: {invoice.clientPhone}</div>}
         <div>GST: {displayValue(invoice.gstNumber, "optional")}</div>

            <Divider />

            {/* Line items */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 50px 90px 90px",
                fontWeight: 700,
              }}
            >
              <span>Description</span>
              <span style={{ textAlign: "center" }}>Qty</span>
              <span style={{ textAlign: "right" }}>Rate</span>
              <span style={{ textAlign: "right" }}>Amount</span>
            </div>

            {lineItems.length === 0 ? (
              <div style={{ color: "#9ca3af", padding: "6px 0" }}>
                No deliverables added.
              </div>
            ) : (
              lineItems.map((item, i) => (
                <div
                  key={i}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 50px 90px 90px",
                  }}
                >
                  <span>{item.label}</span>
                  <span style={{ textAlign: "center" }}>{item.qty}</span>
                  <span style={{ textAlign: "right" }}>
                    {item.rate ? formatAmount(item.rate) : "Included"}
                  </span>
                  <span style={{ textAlign: "right" }}>
                    {item.amount ? formatAmount(item.amount) : ""}
                  </span>
                </div>
              ))
            )}

            <Divider />

            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Subtotal</span>
              <span>{formatAmount(subtotal)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>GST</span>
              <span>{formatAmount(gst)}</span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontWeight: 700,
              }}
            >
              <span>TOTAL</span>
              <span>{formatAmount(total)}</span>
            </div>

            <Divider />

            <div style={{ fontWeight: 700 }}>Payment Details</div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div>
                <div>Bank: {billingProfile?.bank_name || "-"}</div>
                <div>Account: {billingProfile?.account_number || "-"}</div>
                <div>IFSC: {billingProfile?.ifsc || "-"}</div>
                <div>UPI: {billingProfile?.upi_id || "-"}</div>
              </div>

              <div
                style={{
                  width: 80,
                  height: 80,
                  border: "1px dashed #cbd5e1",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                  fontSize: 11,
                  color: "#9ca3af",
                }}
              >
                QR Code
              </div>
            </div>

            <Divider />

            <div style={{ textAlign: "center" }}>Thank you.</div>
          </div>
        </div>
      </div>
    </>
  );
}