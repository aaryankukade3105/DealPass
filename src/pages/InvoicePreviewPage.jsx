import { useEffect, useState, useRef } from "react";
import { ArrowLeft, FileText, Eye, Download, X, Landmark } from "lucide-react";
import { supabase } from "../lib/supabase";
import Field from "../common/Field";
import SectionLabel from "../common/SectionLabel";
import DateField from "../common/DateField";
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

function displayValue(value, fallback = "—") {
  if (value === null || value === undefined || value === "") return fallback;
  return value;
}

const INK = "#151A2D";
const SLATE = "#5B6472";
const BORDER = "#E4E6EF";
const ACCENT = "#2F3B8C"; // deep indigo — reads as "corporate", not playful

const InvoiceStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

    .dp-invdoc {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      color: ${INK};
    }
    .dp-invdoc .num {
      font-variant-numeric: tabular-nums;
      font-feature-settings: "tnum" 1;
    }
    .dp-invdoc .eyebrow {
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: ${SLATE};
    }
    .dp-invdoc table {
      width: 100%;
      border-collapse: collapse;
    }
    .dp-invdoc th {
      text-align: left;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: #fff;
      background: ${INK};
      padding: 10px 14px;
    }
    .dp-invdoc td {
      padding: 12px 14px;
      font-size: 13.5px;
      border-bottom: 1px solid ${BORDER};
    }
    .dp-invdoc tbody tr:nth-child(even) { background: #FAFAFD; }
  `}</style>
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
    clientCity: "",
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

      {/* Form — Invoice Details, Bill To */}
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

        <SectionLabel>Bill To</SectionLabel>

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
            rows={3}
            className="dp-input"
            value={invoice.billingAddress}
            onChange={(e) => update("billingAddress", e.target.value)}
            placeholder="Flat / Office No., Street, City, State, Pincode"
          />
        </Field>

        <Field label="City">
          <input
            className="dp-input"
            value={invoice.clientCity}
            onChange={(e) => update("clientCity", e.target.value)}
            placeholder="Mumbai"
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
    if (!element) return;

    const options = {
      margin: 0,
      filename: `${invoice.invoiceNumber}.pdf`,
      image: { type: "jpeg", quality: 1 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    };

    html2pdf().set(options).from(element).save();
  };

  const billToLine2 = [invoice.clientCity, invoice.billingAddress]
    .filter(Boolean)
    .join(" — ");

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(15,18,32,.6)",
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
            maxWidth: 760,
            background: "#fff",
            borderRadius: 12,
            boxShadow: "0 25px 70px rgba(0,0,0,.35)",
            overflow: "hidden",
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
              zIndex: 2,
            }}
          >
            <div style={{ fontWeight: 700, fontSize: 16, color: INK }}>
              Invoice Preview
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button className="dp-btn-primary" onClick={downloadPDF}>
                <Download size={16} />
                Download PDF
              </button>

              <button className="dp-btn-secondary" onClick={onClose}>
                <X size={16} />
                Close
              </button>
            </div>
          </div>

          {/* ---------------- Professional invoice document ---------------- */}
          <div ref={invoiceRef} className="dp-invdoc" style={{ background: "#fff" }}>
            <InvoiceStyles />

            {/* Letterhead */}
            <div
              style={{
                padding: "44px 48px 28px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                borderBottom: `3px solid ${ACCENT}`,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 10,
                    background: ACCENT,
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 800,
                    fontSize: 17,
                    flexShrink: 0,
                  }}
                >
                  DP
                </div>
                <div>
                  <div style={{ fontSize: 19, fontWeight: 800, letterSpacing: -0.2 }}>
                    DealPass
                  </div>
                  <div style={{ fontSize: 12.5, color: SLATE, marginTop: 1 }}>
                    Creator Collaboration Invoicing
                  </div>
                </div>
              </div>

              <div style={{ textAlign: "right" }}>
                <div
                  style={{
                    fontSize: 26,
                    fontWeight: 800,
                    letterSpacing: 0.4,
                    color: ACCENT,
                  }}
                >
                  INVOICE
                </div>
                <div className="num" style={{ fontSize: 13, color: SLATE, marginTop: 4 }}>
                  {invoice.invoiceNumber}
                </div>
              </div>
            </div>

            {/* Meta strip: dates */}
            <div
              style={{
                display: "flex",
                gap: 40,
                padding: "20px 48px",
                background: "#FAFAFD",
                borderBottom: `1px solid ${BORDER}`,
              }}
            >
              <div>
                <div className="eyebrow">Invoice Date</div>
                <div className="num" style={{ fontSize: 14, fontWeight: 600, marginTop: 3 }}>
                  {formatDisplayDate(invoice.invoiceDate)}
                </div>
              </div>
              <div>
                <div className="eyebrow">Due Date</div>
                <div className="num" style={{ fontSize: 14, fontWeight: 600, marginTop: 3 }}>
                  {invoice.dueDate ? formatDisplayDate(invoice.dueDate) : "On Receipt"}
                </div>
              </div>
              {deal?.deal_title && (
                <div>
                  <div className="eyebrow">Reference</div>
                  <div style={{ fontSize: 14, fontWeight: 600, marginTop: 3 }}>
                    {deal.deal_title}
                  </div>
                </div>
              )}
            </div>

            {/* Bill From / Bill To */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 32,
                padding: "28px 48px",
              }}
            >
              <div>
                <div className="eyebrow" style={{ marginBottom: 8 }}>
                  Billed From
                </div>
                <div style={{ fontSize: 15, fontWeight: 700 }}>
                  {displayValue(billingProfile?.full_name, "Your Name")}
                </div>
                <div style={{ fontSize: 13, color: SLATE, marginTop: 6, lineHeight: 1.6 }}>
                  {displayValue(billingProfile?.address)}
                  <br />
                  {billingProfile?.email && <>{billingProfile.email}<br /></>}
                  {billingProfile?.phone && <>{billingProfile.phone}<br /></>}
                  {billingProfile?.pan_number && <>PAN: {billingProfile.pan_number}<br /></>}
                  {billingProfile?.gst_number && <>GSTIN: {billingProfile.gst_number}</>}
                </div>
              </div>

              <div>
                <div className="eyebrow" style={{ marginBottom: 8 }}>
                  Billed To
                </div>
                <div style={{ fontSize: 15, fontWeight: 700 }}>
                  {displayValue(invoice.companyName || invoice.clientName, "Client Name")}
                </div>
                {invoice.companyName && invoice.clientName && (
                  <div style={{ fontSize: 13, color: SLATE, marginTop: 2 }}>
                    Attn: {invoice.clientName}
                  </div>
                )}
                <div style={{ fontSize: 13, color: SLATE, marginTop: 6, lineHeight: 1.6 }}>
                  {billToLine2 && <>{billToLine2}<br /></>}
                  {invoice.clientEmail && <>{invoice.clientEmail}<br /></>}
                  {invoice.clientPhone && <>{invoice.clientPhone}<br /></>}
                  {invoice.gstNumber && <>GSTIN: {invoice.gstNumber}</>}
                </div>
              </div>
            </div>

            {/* Line items */}
            <div style={{ padding: "0 48px" }}>
              <table>
                <thead>
                  <tr>
                    <th style={{ width: "50%" }}>Description</th>
                    <th style={{ textAlign: "center", width: "12%" }}>Qty</th>
                    <th style={{ textAlign: "right", width: "19%" }}>Rate</th>
                    <th style={{ textAlign: "right", width: "19%" }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {lineItems.length === 0 ? (
                    <tr>
                      <td colSpan={4} style={{ textAlign: "center", color: SLATE }}>
                        No deliverables added.
                      </td>
                    </tr>
                  ) : (
                    lineItems.map((item, i) => (
                      <tr key={i}>
                        <td style={{ fontWeight: 500 }}>{item.label}</td>
                        <td className="num" style={{ textAlign: "center" }}>
                          {item.qty}
                        </td>
                        <td className="num" style={{ textAlign: "right" }}>
                          {item.rate ? formatAmount(item.rate) : "Included"}
                        </td>
                        <td className="num" style={{ textAlign: "right", fontWeight: 600 }}>
                          {item.amount ? formatAmount(item.amount) : "—"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div style={{ display: "flex", justifyContent: "flex-end", padding: "24px 48px 0" }}>
              <div style={{ width: 280 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "8px 0",
                    fontSize: 13.5,
                    color: SLATE,
                  }}
                >
                  <span>Subtotal</span>
                  <span className="num">{formatAmount(subtotal)}</span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "8px 0",
                    fontSize: 13.5,
                    color: SLATE,
                    borderBottom: `1px solid ${BORDER}`,
                  }}
                >
                  <span>GST</span>
                  <span className="num">{formatAmount(gst)}</span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "14px 0 6px",
                    fontSize: 19,
                    fontWeight: 800,
                    color: ACCENT,
                  }}
                >
                  <span>Total Due</span>
                  <span className="num">{formatAmount(total)}</span>
                </div>
              </div>
            </div>

            {/* Payment details */}
            <div style={{ padding: "28px 48px 0" }}>
              <div className="eyebrow" style={{ marginBottom: 10 }}>
                Payment Details
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  border: `1px solid ${BORDER}`,
                  borderRadius: 10,
                  padding: "16px 20px",
                  gap: 20,
                }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "auto 1fr",
                    columnGap: 14,
                    rowGap: 6,
                    fontSize: 13,
                  }}
                >
                  <span style={{ color: SLATE }}>Bank</span>
                  <span style={{ fontWeight: 600 }}>
                    {displayValue(billingProfile?.bank_name)}
                  </span>

                  <span style={{ color: SLATE }}>Account No.</span>
                  <span className="num" style={{ fontWeight: 600 }}>
                    {displayValue(billingProfile?.account_number)}
                  </span>

                  <span style={{ color: SLATE }}>IFSC</span>
                  <span className="num" style={{ fontWeight: 600 }}>
                    {displayValue(billingProfile?.ifsc)}
                  </span>

                  <span style={{ color: SLATE }}>UPI</span>
                  <span style={{ fontWeight: 600 }}>
                    {displayValue(billingProfile?.upi_id)}
                  </span>
                </div>

                <div
                  style={{
                    width: 72,
                    height: 72,
                    flexShrink: 0,
                    border: `1.5px dashed ${ACCENT}77`,
                    borderRadius: 8,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: ACCENT,
                  }}
                >
                  <Landmark size={22} />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div
              style={{
                margin: "32px 48px 0",
                borderTop: `1px solid ${BORDER}`,
                padding: "20px 0 40px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-end",
              }}
            >
              <div style={{ fontSize: 12.5, color: SLATE, maxWidth: 380, lineHeight: 1.6 }}>
                This is a computer-generated invoice for services rendered as per the
                collaboration agreement. Please process payment by the due date above.
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: INK }}>
                Thank you for the collaboration.
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
