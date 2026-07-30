import { useEffect, useState, useRef } from "react";
import {
  ArrowLeft,
  FileText,
  Eye,
  Download,
  X,
  Check,
  User,
  Landmark,
  Building2,
  Package,
  Sparkles,
  AlertTriangle,
  QrCode,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import Field from "../components/common/Field";
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
  <div style={{ borderTop: "1px dashed #cbd5e1", margin: "14px 0" }} />
);

/* ---------- shared visual tokens ---------- */
const INK = "#12172B";
const PAPER = "#F7F8FC";
const AMBER = "#FFB100";
const VIOLET = "#6C5CE7";
const SUCCESS = "#16A34A";
const DANGER = "#DC2626";
const SLATE = "#5B6472";

const GlobalStyle = () => (
  <style>{`
    .dp-inv-page * { box-sizing: border-box; }
    .dp-inv-page {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    }

    /* ---------- responsive layout shell ---------- */
    .dp-inv-shell { padding: 36px 24px; }
    @media (max-width: 720px) { .dp-inv-shell { padding: 18px 14px; } }
    @media (max-width: 420px) { .dp-inv-shell { padding: 14px 10px; } }

    .dp-inv-header-row { flex-wrap: wrap; gap: 14px; }
    @media (max-width: 480px) {
      .dp-inv-header-row { gap: 10px; justify-content: center; }
      .dp-inv-header-row > * { flex: 1 1 auto; }
    }
    .dp-inv-title-text { font-size: 26px; }
    @media (max-width: 480px) { .dp-inv-title-text { font-size: 19px; } }

    .dp-inv-layout {
      display: grid;
      grid-template-columns: 260px 1fr;
      gap: 24px;
    }
    @media (max-width: 860px) {
      .dp-inv-layout { grid-template-columns: 1fr; gap: 16px; }
    }

    .dp-inv-sidebar { position: sticky; top: 0; padding: 22px; }
    @media (max-width: 860px) {
      .dp-inv-sidebar { position: static; padding: 16px; }
    }

    .dp-inv-main { padding: 8px 40px 40px; }
    @media (max-width: 720px) { .dp-inv-main { padding: 8px 20px 28px; } }
    @media (max-width: 420px) { .dp-inv-main { padding: 6px 14px 22px; } }

    .dp-inv-hero {
      padding: 30px;
      margin: 24px 0 8px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
    }
    @media (max-width: 560px) {
      .dp-inv-hero {
        padding: 20px;
        flex-direction: column;
        align-items: flex-start;
      }
      .dp-inv-hero-badge { width: 100%; text-align: left !important; }
    }
    .dp-inv-hero-title { font-size: 26px; }
    @media (max-width: 560px) { .dp-inv-hero-title { font-size: 20px; } }

    .dp-inv-deliv-grid {
      display: grid;
      grid-template-columns: 40px 1fr 70px 130px 120px;
    }
    .dp-inv-deliv-head { font-size: 12px; }
    .dp-inv-deliv-row { font-size: 14px; }
    @media (max-width: 640px) {
      .dp-inv-deliv-grid {
        grid-template-columns: 1fr 40px 76px 84px;
      }
      .dp-inv-deliv-grid > *:first-child { display: none; }
      .dp-inv-deliv-head { font-size: 11px; }
      .dp-inv-deliv-row { font-size: 12.5px; }
    }
    @media (max-width: 400px) {
      .dp-inv-deliv-grid { grid-template-columns: 1fr 34px 64px 72px; }
      .dp-inv-deliv-head { font-size: 10px; }
      .dp-inv-deliv-row { font-size: 11.5px; }
    }

    .dp-inv-summary-card { width: 340px; }
    @media (max-width: 640px) { .dp-inv-summary-card { width: 100%; } }

    .dp-inv-modal-toolbar {
      padding: 16px 24px;
      flex-wrap: wrap;
    }
    @media (max-width: 480px) {
      .dp-inv-modal-toolbar { padding: 12px 14px; }
      .dp-inv-modal-toolbar .dp-inv-btn { padding: 9px 13px; font-size: 12.5px; }
    }

    .dp-inv-modal-doc { padding: 40px 44px; font-size: 13.5px; }
    @media (max-width: 640px) { .dp-inv-modal-doc { padding: 24px 18px; font-size: 12.5px; } }
    @media (max-width: 400px) { .dp-inv-modal-doc { padding: 20px 14px; font-size: 11.5px; } }

    .dp-inv-line-grid { display: grid; grid-template-columns: 1fr 50px 90px 90px; }
    @media (max-width: 640px) {
      .dp-inv-line-grid { grid-template-columns: 1fr 30px 60px 64px; }
    }
    @media (max-width: 400px) {
      .dp-inv-line-grid { grid-template-columns: 1fr 26px 52px 56px; gap: 2px; }
    }

    .dp-inv-payment-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 14px;
    }
    @media (max-width: 460px) {
      .dp-inv-payment-row { flex-direction: column; align-items: flex-start; }
      .dp-inv-payment-row .dp-inv-qr { align-self: center; }
    }

    .dp-inv-btn { min-height: 44px; }
    input.dp-input, textarea.dp-input { min-height: 44px; }
    textarea.dp-input { min-height: unset; }
    .dp-inv-display {
      font-family: 'Space Grotesk', 'Inter', sans-serif;
    }
    .dp-inv-mono {
      font-family: 'JetBrains Mono', 'Courier New', ui-monospace, monospace;
    }
    .dp-inv-page input.dp-input,
    .dp-inv-page textarea.dp-input {
      border: 1.5px solid #E2E5EE !important;
      border-radius: 10px !important;
      transition: border-color .18s ease, box-shadow .18s ease, background .18s ease;
      background: #fff;
    }
    .dp-inv-page input.dp-input:focus,
    .dp-inv-page textarea.dp-input:focus {
      outline: none !important;
      border-color: ${VIOLET} !important;
      box-shadow: 0 0 0 4px rgba(108,92,231,0.12) !important;
    }
    .dp-inv-page input.dp-input:read-only {
      background: #F1F2F8 !important;
      color: ${SLATE};
      cursor: default;
    }
    .dp-inv-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      border: none;
      cursor: pointer;
      font-weight: 700;
      font-size: 14px;
      padding: 11px 20px;
      min-height: 44px;
      border-radius: 12px;
      transition: transform .15s ease, box-shadow .15s ease, opacity .15s ease;
    }
    .dp-inv-page input.dp-input,
    .dp-inv-page textarea.dp-input {
      min-height: 44px;
    }
    .dp-inv-page textarea.dp-input { min-height: 90px; }
    .dp-inv-btn:active { transform: scale(0.97); }
    .dp-inv-btn:disabled { opacity: 0.45; cursor: not-allowed; }
    .dp-inv-btn-ghost {
      background: #fff;
      color: ${INK};
      border: 1.5px solid #E2E5EE;
    }
    .dp-inv-btn-ghost:hover:not(:disabled) {
      border-color: ${VIOLET};
      color: ${VIOLET};
      box-shadow: 0 4px 14px rgba(108,92,231,0.15);
    }
    .dp-inv-btn-primary {
      background: linear-gradient(135deg, ${VIOLET}, #8B7CF6);
      color: #fff;
      box-shadow: 0 6px 18px rgba(108,92,231,0.35);
    }
    .dp-inv-btn-primary:hover:not(:disabled) {
      box-shadow: 0 8px 24px rgba(108,92,231,0.45);
      transform: translateY(-1px);
    }
    .dp-inv-btn-amber {
      background: linear-gradient(135deg, ${AMBER}, #FFC94D);
      color: ${INK};
      box-shadow: 0 6px 18px rgba(255,177,0,0.35);
    }
    .dp-inv-btn-amber:hover:not(:disabled) {
      box-shadow: 0 8px 24px rgba(255,177,0,0.5);
      transform: translateY(-1px);
    }
    .dp-inv-step {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 12px;
      border-radius: 10px;
      transition: background .2s ease;
    }
    .dp-inv-step.active { background: rgba(108,92,231,0.08); }
    .dp-inv-badge {
      width: 26px; height: 26px;
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 12px; font-weight: 800;
      flex-shrink: 0;
      transition: all .25s ease;
    }
    .dp-inv-row {
      transition: background .15s ease;
    }
    .dp-inv-row:hover { background: #FAFAFE; }
    .dp-inv-switch {
      width: 44px; height: 24px;
      border-radius: 999px;
      position: relative;
      cursor: pointer;
      transition: background .2s ease;
      flex-shrink: 0;
    }
    .dp-inv-switch-knob {
      position: absolute;
      top: 2px; left: 2px;
      width: 20px; height: 20px;
      border-radius: 50%;
      background: #fff;
      box-shadow: 0 1px 3px rgba(0,0,0,0.3);
      transition: transform .2s ease;
    }
    @keyframes dpFadeUp {
      from { opacity: 0; transform: translateY(6px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .dp-inv-fade { animation: dpFadeUp .35s ease both; }
    @keyframes dpPulse {
      0% { box-shadow: 0 0 0 0 rgba(220,38,38,0.35); }
      70% { box-shadow: 0 0 0 10px rgba(220,38,38,0); }
      100% { box-shadow: 0 0 0 0 rgba(220,38,38,0); }
    }
    .dp-inv-alert { animation: dpPulse 1.8s ease-out infinite; }
    .dp-inv-scroll::-webkit-scrollbar { width: 8px; }
    .dp-inv-scroll::-webkit-scrollbar-thumb { background: #D9DCE8; border-radius: 8px; }
  `}</style>
);

function SectionHeading({ index, color, icon, title, subtitle, done }) {
  return (
    <div
      className="dp-inv-fade"
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 14,
        marginTop: 36,
        marginBottom: 18,
      }}
    >
      <div
        style={{
          width: 38,
          height: 38,
          borderRadius: 12,
          background: done ? `${color}1A` : "#F1F2F8",
          border: `1.5px solid ${done ? color : "#E2E5EE"}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          transition: "all .2s ease",
        }}
      >
        {done ? <Check size={17} color={color} strokeWidth={3} /> : icon}
      </div>
      <div>
        <div
          className="dp-inv-display"
          style={{ fontSize: 20, fontWeight: 700, color: INK, lineHeight: 1.2 }}
        >
          {index}. {title}
        </div>
        {subtitle && (
          <div style={{ fontSize: 13.5, color: SLATE, marginTop: 3 }}>
            {subtitle}
          </div>
        )}
      </div>
    </div>
  );
}

function Toggle({ checked, onChange, color = VIOLET }) {
  return (
    <div
      className="dp-inv-switch"
      onClick={() => onChange(!checked)}
      style={{ background: checked ? color : "#D9DCE8" }}
    >
      <div
        className="dp-inv-switch-knob"
        style={{ transform: checked ? "translateX(20px)" : "translateX(0)" }}
      />
    </div>
  );
}

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

  const [lineItems, setLineItems] = useState(
    (deal?.deliverables || []).map((item) => ({
      id: item.id || crypto.randomUUID(),
      label: item.type,
      qty: Number(item.qty || 1),
      rate: Number(item.rate || 0),
    }))
  );
  const [gstEnabled, setGstEnabled] = useState(false);
  const [gstPercent, setGstPercent] = useState(18);

  const subtotal = Number(deal?.commercials || 0);
  const calculatedSubtotal = lineItems.reduce(
    (sum, item) => sum + item.qty * item.rate,
    0
  );
  const amountMismatch = calculatedSubtotal !== subtotal;
  const gst = gstEnabled ? (subtotal * gstPercent) / 100 : 0;
  const total = subtotal + gst;

  // completion tracking — drives the step rail
  const steps = [
    {
      label: "Invoice Details",
      done: Boolean(invoice.invoiceNumber && invoice.invoiceDate),
    },
    {
      label: "From (Billing Profile)",
      done: Boolean(billingProfile?.full_name),
    },
    {
      label: "Payment Details",
      done: Boolean(billingProfile?.account_number || billingProfile?.upi_id),
    },
    {
      label: "Bill To",
      done: Boolean(
        (invoice.clientName || invoice.companyName) && invoice.billingAddress
      ),
    },
    {
      label: "Deliverables",
      done: lineItems.length > 0 && !amountMismatch,
    },
  ];
  const completedCount = steps.filter((s) => s.done).length;
  const progressPct = Math.round((completedCount / steps.length) * 100);

  return (
    <div
      className="dp-inv-page dp-inv-shell"
      style={{
        flex: 1,
        height: "100%",
        overflow: "auto",
        background: `linear-gradient(180deg, ${PAPER} 0%, #EFF1F9 100%)`,
      }}
    >
      <GlobalStyle />

      {/* Header */}
      <div
        className="dp-inv-header-row"
        style={{
          maxWidth: 1080,
          margin: "0 auto 28px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <button className="dp-inv-btn dp-inv-btn-ghost" onClick={onBack}>
          <ArrowLeft size={17} />
          Back
        </button>

        <div
          className="dp-inv-display dp-inv-title-text"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            fontWeight: 700,
            color: INK,
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: INK,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <FileText size={20} color={AMBER} />
          </div>
          Invoice Studio
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button
            className="dp-inv-btn dp-inv-btn-primary"
            disabled={amountMismatch}
            onClick={() => setShowPreview(true)}
          >
            <Eye size={17} />
            Preview & Send
          </button>
        </div>
      </div>

      <div
        className="dp-inv-layout"
        style={{
          maxWidth: 1080,
          margin: "0 auto",
          alignItems: "start",
        }}
      >
        {/* ---------- Left rail: live progress ---------- */}
        <div
          className="dp-inv-fade dp-inv-sidebar"
          style={{
            background: "#fff",
            border: "1px solid #E7E9F3",
            borderRadius: 18,
            boxShadow: "0 4px 20px rgba(18,23,43,0.05)",
          }}
        >
          <div
            className="dp-inv-display"
            style={{ fontSize: 16, fontWeight: 700, color: INK, marginBottom: 4 }}
          >
            Invoice Progress
          </div>
          <div style={{ fontSize: 12.5, color: SLATE, marginBottom: 16 }}>
            {completedCount} of {steps.length} sections ready
          </div>

          <div
            style={{
              height: 8,
              borderRadius: 999,
              background: "#EEF0F8",
              overflow: "hidden",
              marginBottom: 18,
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${progressPct}%`,
                borderRadius: 999,
                background: `linear-gradient(90deg, ${VIOLET}, ${AMBER})`,
                transition: "width .4s ease",
              }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {steps.map((s, i) => (
              <div
                key={s.label}
                className={`dp-inv-step ${!s.done ? "active" : ""}`}
              >
                <div
                  className="dp-inv-badge"
                  style={{
                    background: s.done ? SUCCESS : "#EEF0F8",
                    color: s.done ? "#fff" : SLATE,
                  }}
                >
                  {s.done ? <Check size={14} strokeWidth={3} /> : i + 1}
                </div>
                <span
                  style={{
                    fontSize: 13.5,
                    color: s.done ? INK : SLATE,
                    fontWeight: s.done ? 600 : 500,
                  }}
                >
                  {s.label}
                </span>
              </div>
            ))}
          </div>

          {amountMismatch && (
            <div
              style={{
                marginTop: 18,
                padding: "10px 12px",
                borderRadius: 10,
                background: "#FEF2F2",
                border: "1px solid #FECACA",
                color: DANGER,
                fontSize: 12,
                fontWeight: 600,
                display: "flex",
                gap: 8,
                alignItems: "flex-start",
              }}
            >
              <AlertTriangle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
              Fix deliverable totals to unlock preview.
            </div>
          )}
        </div>

        {/* ---------- Right: the form ---------- */}
        <div
          className="dp-inv-main"
          style={{
            background: "#fff",
            border: "1px solid #E7E9F3",
            borderRadius: 22,
            boxShadow: "0 10px 40px rgba(18,23,43,0.06)",
          }}
        >
          {/* Hero */}
          <div
            className="dp-inv-fade dp-inv-hero"
            style={{
              background: `linear-gradient(135deg, ${INK} 0%, #232B4D 100%)`,
              color: "#fff",
              borderRadius: 18,
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                right: -30,
                top: -30,
                width: 140,
                height: 140,
                borderRadius: "50%",
                background: `radial-gradient(circle, ${VIOLET}55, transparent 70%)`,
              }}
            />
            <div style={{ position: "relative", zIndex: 1, minWidth: 0 }}>
              <div
                className="dp-inv-display dp-inv-hero-title"
                style={{
                  fontWeight: 700,
                  marginBottom: 6,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  flexWrap: "wrap",
                }}
              >
                Create Invoice <Sparkles size={20} color={AMBER} />
              </div>
              <div style={{ opacity: 0.75, fontSize: 13.5 }}>
                Turn this collaboration into a professional invoice.
              </div>
            </div>

            <div
              className="dp-inv-hero-badge"
              style={{
                position: "relative",
                zIndex: 1,
                background: "rgba(255,255,255,.1)",
                border: "1px solid rgba(255,255,255,.15)",
                padding: "12px 18px",
                borderRadius: 14,
                textAlign: "right",
              }}
            >
              <div style={{ fontSize: 11, opacity: 0.65, letterSpacing: 0.5 }}>
                INVOICE NO.
              </div>
              <div className="dp-inv-mono" style={{ fontSize: 19, fontWeight: 700, color: AMBER }}>
                {invoice.invoiceNumber}
              </div>
            </div>
          </div>

          {/* Section 1: Invoice Details */}
          <SectionHeading
            index={1}
            color={VIOLET}
            icon={<FileText size={17} color={VIOLET} />}
            title="Invoice Details"
            subtitle="The basics — number, and when it's due."
            done={steps[0].done}
          />

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

          {/* Section 2: From */}
          <SectionHeading
            index={2}
            color={INK}
            icon={<User size={17} color={INK} />}
            title="From"
            subtitle="Pulled straight from your Billing Profile."
            done={steps[1].done}
          />

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
              marginBottom: 8,
              padding: "12px 14px",
              borderRadius: 12,
              background: "#F5F4FF",
              border: `1px dashed ${VIOLET}55`,
              color: "#4C3FBF",
              fontSize: 13,
            }}
          >
            ✨ Synced from your Billing Profile — edit it under{" "}
            <strong>Profile → Billing Profile</strong>.
          </div>

          {/* Section 3: Payment Details */}
          <SectionHeading
            index={3}
            color={AMBER}
            icon={<Landmark size={17} color="#B87A00" />}
            title="Payment Details"
            subtitle="Where the money lands, also from your Billing Profile."
            done={steps[2].done}
          />

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
              marginBottom: 8,
              padding: "12px 14px",
              borderRadius: 12,
              background: "#FFF8E8",
              border: `1px dashed ${AMBER}88`,
              color: "#8A5A00",
              fontSize: 13,
            }}
          >
            💳 These will appear on the final invoice automatically.
          </div>

          {/* Section 4: Bill To */}
          <SectionHeading
            index={4}
            color={VIOLET}
            icon={<Building2 size={17} color={VIOLET} />}
            title="Bill To"
            subtitle="Who's paying this invoice?"
            done={steps[3].done}
          />

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
              marginBottom: 8,
              padding: "12px 14px",
              borderRadius: 12,
              background: "#F5F4FF",
              border: `1px dashed ${VIOLET}55`,
              color: "#4C3FBF",
              fontSize: 13,
            }}
          >
            🚀 <strong>Coming soon:</strong> pick a saved client instead of retyping this
            every time.
          </div>

          {/* Section 5: Deliverables */}
          <SectionHeading
            index={5}
            color={AMBER}
            icon={<Package size={17} color="#B87A00" />}
            title="Deliverables"
            subtitle="Pulled from the deal — set a rate for each item."
            done={steps[4].done}
          />

          <div
            style={{
              border: "1px solid #E7E9F3",
              borderRadius: 14,
              overflow: "hidden",
              marginBottom: 20,
            }}
          >
            <div
              className="dp-inv-deliv-grid dp-inv-deliv-head"
              style={{
                padding: "12px 16px",
                background: "#F7F8FC",
                fontWeight: 700,
                color: SLATE,
                letterSpacing: 0.3,
                textTransform: "uppercase",
              }}
            >
              <span>#</span>
              <span>Deliverable</span>
              <span style={{ textAlign: "center" }}>Qty</span>
              <span>Rate (₹)</span>
              <span style={{ textAlign: "right" }}>Amount</span>
            </div>

            {lineItems.length === 0 ? (
              <div style={{ padding: 20, fontSize: 13.5, color: SLATE, textAlign: "center" }}>
                No deliverables on this deal yet.
              </div>
            ) : (
              lineItems.map((item, index) => (
                <div
                  key={item.id}
                  className="dp-inv-row dp-inv-deliv-grid dp-inv-deliv-row"
                  style={{
                    alignItems: "center",
                    padding: "10px 16px",
                    borderTop: "1px solid #F0F1F8",
                  }}
                >
                  <span style={{ color: SLATE }}>{index + 1}</span>
                  <span style={{ fontWeight: 600, color: INK, overflowWrap: "anywhere" }}>
                    {item.label}
                  </span>
                  <span style={{ textAlign: "center", color: SLATE }}>{item.qty}</span>
                  <input
                    className="dp-input"
                    type="number"
                    value={item.rate}
                    style={{ padding: "7px 6px", fontSize: "inherit", width: "100%" }}
                    onChange={(e) => {
                      const value = Number(e.target.value);
                      setLineItems((prev) =>
                        prev.map((li) =>
                          li.id === item.id ? { ...li, rate: value } : li
                        )
                      );
                    }}
                  />
                  <span style={{ textAlign: "right", fontWeight: 700, color: INK }}>
                    {formatAmount(item.qty * item.rate)}
                  </span>
                </div>
              ))
            )}
          </div>

          {amountMismatch && (
            <div
              className="dp-inv-alert"
              style={{
                background: "#FEF2F2",
                color: "#991B1B",
                border: "1px solid #FECACA",
                borderRadius: 14,
                padding: 18,
                marginBottom: 24,
                display: "flex",
                gap: 12,
              }}
            >
              <AlertTriangle size={20} color={DANGER} style={{ flexShrink: 0 }} />
              <div style={{ fontSize: 13.5, lineHeight: 1.6 }}>
                <strong>Deliverable total must match the agreed commercial amount.</strong>
                <div style={{ marginTop: 6 }}>
                  Commercial Amount: <strong>{formatAmount(subtotal)}</strong>
                  <br />
                  Current Total: <strong>{formatAmount(calculatedSubtotal)}</strong>
                </div>
              </div>
            </div>
          )}

          {/* GST toggle */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "16px 18px",
              borderRadius: 14,
              border: "1px solid #E7E9F3",
              background: "#FAFAFE",
              marginBottom: 24,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Toggle checked={gstEnabled} onChange={setGstEnabled} />
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, color: INK }}>
                  GST Applicable
                </div>
                <div style={{ fontSize: 12.5, color: SLATE }}>
                  Adds tax on top of the subtotal
                </div>
              </div>
            </div>

            {gstEnabled && (
              <div className="dp-inv-fade" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input
                  className="dp-input"
                  type="number"
                  value={gstPercent}
                  onChange={(e) => setGstPercent(Number(e.target.value))}
                  style={{ width: 70, padding: "8px 10px", textAlign: "center" }}
                />
                <span style={{ fontSize: 14, color: SLATE, fontWeight: 600 }}>%</span>
              </div>
            )}
          </div>

          {/* Summary */}
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 20 }}>
            <div
              className="dp-inv-summary-card"
              style={{
                border: "1px solid #E7E9F3",
                borderRadius: 16,
                overflow: "hidden",
                background: "#fff",
                boxShadow: "0 6px 20px rgba(18,23,43,0.06)",
              }}
            >
              <div
                style={{
                  padding: "14px 18px",
                  background: INK,
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: 15,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <Sparkles size={15} color={AMBER} />
                Invoice Summary
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "14px 18px",
                  borderBottom: "1px solid #F0F1F8",
                  fontSize: 14,
                }}
              >
                <span style={{ color: SLATE }}>Subtotal</span>
                <strong style={{ color: INK }}>{formatAmount(subtotal)}</strong>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "14px 18px",
                  borderBottom: "1px solid #F0F1F8",
                  color: SLATE,
                  fontSize: 14,
                }}
              >
                <span>GST {gstEnabled ? `(${gstPercent}%)` : ""}</span>
                <span>{formatAmount(gst)}</span>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "18px",
                  background: `linear-gradient(135deg, ${VIOLET}12, ${AMBER}12)`,
                  fontSize: 21,
                  fontWeight: 800,
                  color: INK,
                }}
              >
                <span>Total</span>
                <span>{formatAmount(total)}</span>
              </div>
            </div>
          </div>

          <div
            style={{
              padding: "12px 16px",
              borderRadius: 12,
              background: "#F7F8FC",
              border: "1px solid #E7E9F3",
              color: SLATE,
              fontSize: 13,
            }}
          >
            ✨ Deliverables and totals are synced with the selected deal. Discounts and
            multi-currency support are on the roadmap.
          </div>
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
          gstEnabled={gstEnabled}
          gstPercent={gstPercent}
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
  gstEnabled,
  gstPercent,
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
        image: { type: "jpeg", quality: 1 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
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
          background: "rgba(18,23,43,.65)",
          zIndex: 50,
          backdropFilter: "blur(2px)",
        }}
      />

      <div
        className="dp-inv-scroll"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 51,
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
          overflowY: "auto",
          padding: "24px 12px",
        }}
      >
        <div
          className="dp-inv-fade"
          style={{
            width: "100%",
            maxWidth: 680,
            background: "#fff",
            borderRadius: 18,
            boxShadow: "0 30px 80px rgba(0,0,0,.35)",
            overflow: "hidden",
          }}
        >
          {/* Toolbar */}
          <div
            className="dp-inv-modal-toolbar"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 10,
              background: INK,
              position: "sticky",
              top: 0,
              zIndex: 2,
            }}
          >
            <div
              className="dp-inv-display"
              style={{
                fontWeight: 700,
                fontSize: 16,
                color: "#fff",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <Eye size={17} color={AMBER} />
              Preview & Download
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button className="dp-inv-btn dp-inv-btn-amber" onClick={downloadPDF}>
                <Download size={16} />
                Download PDF
              </button>

              <button
                onClick={onClose}
                style={{
                  background: "rgba(255,255,255,.1)",
                  border: "none",
                  cursor: "pointer",
                  padding: 8,
                  borderRadius: 8,
                  color: "#fff",
                  display: "flex",
                }}
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Ledger-style invoice document */}
          <div
            ref={invoiceRef}
            className="dp-inv-mono dp-inv-modal-doc"
            style={{
              lineHeight: 1.7,
              color: "#1f2937",
              background: "#fff",
              overflowWrap: "break-word",
            }}
          >
            <div
              style={{
                textAlign: "center",
                fontWeight: 700,
                letterSpacing: 3,
                fontSize: 15,
                color: INK,
              }}
            >
              TAX INVOICE
            </div>

            <Divider />

            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontWeight: 700, color: VIOLET }}>DealPass</span>
              <span>Invoice #{invoice.invoiceNumber}</span>
            </div>
            <div>Invoice Date: {formatDisplayDate(invoice.invoiceDate)}</div>
            <div>
              Due Date:{" "}
              {invoice.dueDate ? formatDisplayDate(invoice.dueDate) : displayValue("", "date")}
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
            <div>{displayValue(invoice.companyName || invoice.clientName)}</div>
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

            <div className="dp-inv-line-grid" style={{ fontWeight: 700 }}>
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
                <div key={i} className="dp-inv-line-grid">
                  <span style={{ overflowWrap: "anywhere" }}>{item.label}</span>
                  <span style={{ textAlign: "center" }}>{item.qty}</span>
                  <span style={{ textAlign: "right" }}>
                    {item.rate ? formatAmount(item.rate) : "Included"}
                  </span>
                  <span style={{ textAlign: "right" }}>
                    {formatAmount(item.qty * item.rate)}
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
              <span>GST{gstEnabled ? ` (${gstPercent}%)` : ""}</span>
              <span>{formatAmount(gst)}</span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontWeight: 700,
                color: INK,
                fontSize: 15,
              }}
            >
              <span>TOTAL</span>
              <span>{formatAmount(total)}</span>
            </div>

            <Divider />

            <div style={{ fontWeight: 700 }}>Payment Details</div>
            <div className="dp-inv-payment-row">
              <div>
                <div>Bank: {billingProfile?.bank_name || "-"}</div>
                <div>Account: {billingProfile?.account_number || "-"}</div>
                <div>IFSC: {billingProfile?.ifsc || "-"}</div>
                <div>UPI: {billingProfile?.upi_id || "-"}</div>
              </div>

              <div
                className="dp-inv-qr"
                style={{
                  width: 76,
                  height: 76,
                  flexShrink: 0,
                  border: `1.5px dashed ${VIOLET}88`,
                  borderRadius: 10,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                  fontSize: 10,
                  color: VIOLET,
                  gap: 4,
                }}
              >
                <QrCode size={22} color={VIOLET} />
                QR Code
              </div>
            </div>

            <Divider />

            <div style={{ textAlign: "center", color: SLATE }}>Thank you.</div>
          </div>
        </div>
      </div>
    </>
  );
}
