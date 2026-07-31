import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "../lib/supabase";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Receipt,
  Landmark,
  Building2,
  CreditCard,
  Hash,
  BadgeIndianRupee,
  Save,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  Wallet,
  Sparkles,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  These are the ONLY fields that actually gate payment / invoicing. */
/*  Everything else is nice-to-have context.                          */
/* ------------------------------------------------------------------ */
const REQUIRED_FIELDS = [
  "phone",
  "account_holder",
  "account_number",
  "ifsc",
  "upi_id",
];

const defaultForm = {
  full_name: "",
  email: "",
  phone: "",

  address: "",

  pan_number: "",
  gst_number: "",

  account_holder: "",
  bank_name: "",
  account_number: "",
  ifsc: "",
  upi_id: "",
};

/* ------------------------------------------------------------------ */
/*  Local styles for the fun bits. Scoped with a unique wrapper class  */
/*  so nothing here clashes with the rest of the app's CSS.            */
/* ------------------------------------------------------------------ */
function BillingStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500;600&display=swap');

      .bp-scope {
        --ink: #0f1a14;
        --panel: #142a20;
        --gold: #e3b23c;
        --gold-soft: rgba(227, 178, 60, 0.16);
        --paper: #fbf6e9;
        --paper-line: #e4dcc0;
        --mint: #6fcf97;
        --alert: #ef6a5c;
        --ink-soft: rgba(251, 246, 233, 0.62);
        font-family: 'Inter', system-ui, sans-serif;
      }

      .bp-page {
        background: radial-gradient(circle at 15% -10%, #1d3a2b 0%, #0f1a14 55%) fixed;
        min-height: 100vh;
        padding: 32px 20px 80px;
        color: #fbf6e9;
      }

      .bp-shell {
        max-width: 1180px;
        margin: 0 auto;
      }

      .bp-display {
        font-family: 'Space Grotesk', sans-serif;
      }

      /* header */
      .bp-head {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        flex-wrap: wrap;
        gap: 20px;
        margin-bottom: 20px;
      }

      .bp-eyebrow {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        font-size: 12px;
        letter-spacing: 0.14em;
        text-transform: uppercase;
        color: var(--gold);
        font-weight: 600;
        margin-bottom: 10px;
      }

      .bp-title {
        font-size: 34px;
        font-weight: 700;
        margin: 0;
        line-height: 1.05;
      }

      .bp-sub {
        margin-top: 8px;
        color: var(--ink-soft);
        max-width: 480px;
        font-size: 14.5px;
      }

      /* warning banner */
      .bp-warning {
        display: flex;
        gap: 14px;
        align-items: flex-start;
        background: linear-gradient(135deg, rgba(227,178,60,0.14), rgba(227,178,60,0.05));
        border: 1px solid rgba(227,178,60,0.4);
        border-radius: 16px;
        padding: 16px 18px;
        margin-bottom: 26px;
      }

      .bp-warning-icon {
        flex-shrink: 0;
        width: 34px;
        height: 34px;
        border-radius: 10px;
        background: var(--gold);
        color: #241a02;
        display: grid;
        place-items: center;
      }

      .bp-warning b {
        color: var(--gold);
      }

      .bp-warning p {
        margin: 0;
        font-size: 14px;
        line-height: 1.5;
        color: #f4ecd6;
      }

      /* progress */
      .bp-progress-wrap {
        min-width: 240px;
      }

      .bp-progress-label {
        display: flex;
        justify-content: space-between;
        font-size: 13px;
        font-weight: 600;
        margin-bottom: 8px;
        color: var(--ink-soft);
      }

      .bp-progress-track {
        height: 10px;
        background: rgba(251,246,233,0.12);
        border-radius: 20px;
        overflow: hidden;
      }

      .bp-progress-fill {
        height: 100%;
        border-radius: 20px;
        background: linear-gradient(90deg, var(--gold), var(--mint));
        transition: width 0.4s ease;
      }

      /* layout */
      .bp-grid {
        display: grid;
        grid-template-columns: 1.5fr 1fr;
        gap: 24px;
        align-items: start;
      }

      @media (max-width: 880px) {
        .bp-grid {
          grid-template-columns: 1fr;
        }
        .bp-receipt-col {
          order: -1;
        }
      }

      .bp-card {
        background: var(--panel);
        border: 1px solid rgba(251,246,233,0.08);
        border-radius: 18px;
        padding: 24px;
        margin-bottom: 20px;
      }

      .bp-card.optional {
        opacity: 0.92;
      }

      .bp-section-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        cursor: pointer;
      }

      .bp-section-head-left {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .bp-icon-badge {
        width: 40px;
        height: 40px;
        border-radius: 12px;
        display: grid;
        place-items: center;
        color: #0f1a14;
        flex-shrink: 0;
      }

      .bp-section-title {
        font-size: 17px;
        font-weight: 700;
      }

      .bp-tag {
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.04em;
        padding: 3px 9px;
        border-radius: 999px;
        text-transform: uppercase;
      }

      .bp-tag.required {
        background: rgba(227,178,60,0.18);
        color: var(--gold);
        border: 1px solid rgba(227,178,60,0.4);
      }

      .bp-tag.optional {
        background: rgba(251,246,233,0.08);
        color: var(--ink-soft);
        border: 1px solid rgba(251,246,233,0.12);
      }

      .bp-chevron {
        transition: transform 0.25s ease;
        color: var(--ink-soft);
      }

      .bp-chevron.open {
        transform: rotate(180deg);
      }

      .bp-section-body {
        margin-top: 20px;
      }

      /* inputs */
      .bp-field {
        margin-bottom: 16px;
      }

      .bp-label {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 13px;
        font-weight: 600;
        color: var(--ink-soft);
        margin-bottom: 6px;
      }

      .bp-label .star {
        color: var(--gold);
      }

      .bp-input-wrap {
        position: relative;
        display: flex;
        align-items: center;
      }

      .bp-input-icon {
        position: absolute;
        left: 14px;
        color: var(--ink-soft);
        pointer-events: none;
      }

      .bp-input,
      .bp-textarea {
        width: 100%;
        background: rgba(251,246,233,0.05);
        border: 1.5px solid rgba(251,246,233,0.14);
        border-radius: 12px;
        padding: 12px 14px 12px 42px;
        color: #fbf6e9;
        font-size: 14.5px;
        font-family: inherit;
        transition: border-color 0.2s ease, background 0.2s ease;
      }

      .bp-textarea {
        resize: vertical;
        min-height: 90px;
      }

      .bp-input:focus,
      .bp-textarea:focus {
        outline: none;
        border-color: var(--gold);
        background: rgba(251,246,233,0.08);
      }

      .bp-input::placeholder,
      .bp-textarea::placeholder {
        color: rgba(251,246,233,0.28);
      }

      .bp-input.error,
      .bp-textarea.error {
        border-color: var(--alert);
        background: rgba(239,106,92,0.08);
      }

      .bp-error-text {
        font-size: 12px;
        color: var(--alert);
        margin-top: 6px;
      }

      /* receipt */
      .bp-receipt-col {
        position: sticky;
        top: 24px;
      }

      .bp-receipt {
        background: var(--paper);
        color: #241d0c;
        border-radius: 4px;
        padding: 26px 22px 30px;
        font-family: 'IBM Plex Mono', monospace;
        position: relative;
        box-shadow: 0 20px 40px rgba(0,0,0,0.35);
      }

      .bp-receipt::after {
        content: "";
        position: absolute;
        left: 0;
        right: 0;
        bottom: -1px;
        height: 14px;
        background:
          radial-gradient(circle at 8px 0, transparent 7px, var(--paper) 7.5px) repeat-x;
        background-size: 16px 14px;
        transform: translateY(100%);
      }

      .bp-receipt-title {
        font-family: 'Space Grotesk', sans-serif;
        font-size: 12px;
        letter-spacing: 0.16em;
        text-transform: uppercase;
        text-align: center;
        color: #5c5230;
        margin-bottom: 4px;
      }

      .bp-receipt-sub {
        text-align: center;
        font-size: 11px;
        color: #8a7f52;
        margin-bottom: 16px;
      }

      .bp-receipt-divider {
        border: none;
        border-top: 1.5px dashed var(--paper-line);
        margin: 14px 0;
      }

      .bp-receipt-row {
        display: flex;
        justify-content: space-between;
        gap: 12px;
        font-size: 12.5px;
        margin-bottom: 9px;
        line-height: 1.4;
      }

      .bp-receipt-row .k {
        color: #8a7f52;
        white-space: nowrap;
      }

      .bp-receipt-row .v {
        text-align: right;
        font-weight: 600;
        word-break: break-word;
      }

      .bp-receipt-row .v.empty {
        color: #c8bf98;
        font-weight: 400;
        font-style: italic;
      }

      .bp-payto {
        background: rgba(15,26,20,0.05);
        border: 1.5px dashed #b6ab7c;
        border-radius: 8px;
        padding: 12px;
        margin: 16px 0;
      }

      .bp-payto-label {
        font-size: 10.5px;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        color: #8a7f52;
        margin-bottom: 6px;
      }

      .bp-payto-name {
        font-family: 'Space Grotesk', sans-serif;
        font-size: 18px;
        font-weight: 700;
      }

      .bp-stamp {
        position: absolute;
        top: 92px;
        right: 22px;
        border: 3px solid var(--mint);
        color: #1c7a4d;
        font-family: 'Space Grotesk', sans-serif;
        font-weight: 700;
        font-size: 13px;
        letter-spacing: 0.06em;
        padding: 6px 10px;
        border-radius: 8px;
        transform: rotate(-11deg);
        opacity: 0;
        animation: bp-stamp-in 0.45s ease 0.1s forwards;
        background: rgba(111,207,151,0.08);
      }

      @keyframes bp-stamp-in {
        0% { opacity: 0; transform: rotate(-11deg) scale(1.6); }
        70% { opacity: 1; transform: rotate(-11deg) scale(0.94); }
        100% { opacity: 1; transform: rotate(-11deg) scale(1); }
      }

      .bp-missing-pill {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-size: 11px;
        font-weight: 600;
        color: var(--alert);
        margin-top: 4px;
      }

      /* save bar */
      .bp-savebar {
        position: sticky;
        bottom: 16px;
        margin-top: 10px;
      }

      .bp-error-banner {
        display: flex;
        align-items: center;
        gap: 10px;
        background: rgba(239,106,92,0.14);
        border: 1px solid rgba(239,106,92,0.4);
        color: #ffd9d3;
        border-radius: 12px;
        padding: 12px 16px;
        font-size: 13.5px;
        margin-bottom: 12px;
      }

      .bp-save-btn {
        width: 100%;
        border: none;
        border-radius: 14px;
        padding: 16px;
        font-size: 15.5px;
        font-weight: 700;
        font-family: 'Space Grotesk', sans-serif;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        cursor: pointer;
        background: linear-gradient(90deg, var(--gold), #f2c96b);
        color: #241a02;
        transition: transform 0.15s ease, box-shadow 0.15s ease;
        box-shadow: 0 10px 24px rgba(227,178,60,0.25);
      }

      .bp-save-btn:hover {
        transform: translateY(-1px);
        box-shadow: 0 14px 30px rgba(227,178,60,0.32);
      }

      .bp-save-btn:disabled {
        opacity: 0.7;
        cursor: default;
        transform: none;
      }

      .bp-save-btn.shake {
        animation: bp-shake 0.45s ease;
      }

      @keyframes bp-shake {
        0%, 100% { transform: translateX(0); }
        20% { transform: translateX(-6px); }
        40% { transform: translateX(6px); }
        60% { transform: translateX(-4px); }
        80% { transform: translateX(4px); }
      }

      .bp-toast {
        position: fixed;
        bottom: 26px;
        left: 50%;
        transform: translateX(-50%);
        background: #142a20;
        border: 1px solid rgba(111,207,151,0.4);
        color: #eafff2;
        padding: 14px 20px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 14px;
        font-weight: 600;
        box-shadow: 0 12px 30px rgba(0,0,0,0.4);
        animation: bp-toast-in 0.3s ease;
        z-index: 50;
      }

      @keyframes bp-toast-in {
        from { opacity: 0; transform: translate(-50%, 10px); }
        to { opacity: 1; transform: translate(-50%, 0); }
      }
    `}</style>
  );
}

function Field({
  icon: Icon,
  label,
  required = false,
  optionalTag = false,
  textarea = false,
  error = false,
  errorText,
  ...props
}) {
  return (
    <div className="bp-field">
      <label className="bp-label">
        {label}
        {required && <span className="star">*</span>}
        {optionalTag && <span className="bp-tag optional" style={{ marginLeft: 4 }}>optional</span>}
      </label>

      <div className="bp-input-wrap">
        <Icon className="bp-input-icon" size={17} />
        {textarea ? (
          <textarea className={`bp-textarea ${error ? "error" : ""}`} {...props} />
        ) : (
          <input className={`bp-input ${error ? "error" : ""}`} {...props} />
        )}
      </div>

      {error && (
        <div className="bp-error-text">{errorText || "This one's needed to pay you correctly."}</div>
      )}
    </div>
  );
}

function CollapsibleCard({ icon: Icon, title, color, requiredTag, defaultOpen = true, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={`bp-card ${requiredTag ? "" : "optional"}`}>
      <div className="bp-section-head" onClick={() => setOpen((o) => !o)}>
        <div className="bp-section-head-left">
          <div className="bp-icon-badge" style={{ background: color }}>
            <Icon size={19} />
          </div>
          <div>
            <div className="bp-section-title bp-display">{title}</div>
          </div>
          <span className={`bp-tag ${requiredTag ? "required" : "optional"}`}>
            {requiredTag ? "required" : "optional"}
          </span>
        </div>
        <ChevronDown className={`bp-chevron ${open ? "open" : ""}`} size={18} />
      </div>

      {open && <div className="bp-section-body">{children}</div>}
    </div>
  );
}

export default function BillingProfilePage({ account }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [showErrors, setShowErrors] = useState(false);
  const [shake, setShake] = useState(false);
  const [toast, setToast] = useState(null);
  const firstErrorRef = useRef(null);

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data } = await supabase
      .from("billing_profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (data) {
      setForm({ ...defaultForm, ...data });
    } else {
      setForm((prev) => ({
        ...prev,
        full_name: account?.full_name || "",
        email: account?.email || "",
      }));
    }

    setLoading(false);
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  const missing = useMemo(
    () => REQUIRED_FIELDS.filter((key) => !form[key]?.trim()),
    [form]
  );

  const progress = useMemo(() => {
    const completed = REQUIRED_FIELDS.length - missing.length;
    return Math.round((completed / REQUIRED_FIELDS.length) * 100);
  }, [missing]);

  const isComplete = missing.length === 0;

  async function handleSave() {
    if (missing.length > 0) {
      setShowErrors(true);
      setShake(true);
      setTimeout(() => setShake(false), 450);
      return;
    }

    try {
      setSaving(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setToast({ type: "error", text: "Please log in again." });
        return;
      }

      const { error } = await supabase.from("billing_profiles").upsert({
        user_id: user.id,
        ...form,
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;

      setShowErrors(false);
      setToast({ type: "success", text: "Saved. Your invoice is ready to go out correctly." });
      setTimeout(() => setToast(null), 3200);
    } catch (err) {
      setToast({ type: "error", text: err.message });
      setTimeout(() => setToast(null), 3200);
    } finally {
      setSaving(false);
    }
  }

  const fieldError = (key) => showErrors && !form[key]?.trim();

  if (loading) {
    return (
      <div className="bp-scope bp-page" style={{ textAlign: "center", paddingTop: 80 }}>
        Loading...
      </div>
    );
  }

  return (
    <div className="bp-scope bp-page">
      <BillingStyles />
      <div className="bp-shell">
        {/* HEADER */}
        <div className="bp-head">
          <div>
            <div className="bp-eyebrow">
              <Sparkles size={13} />
              Invoice Profile
            </div>
            <h1 className="bp-title bp-display">Where should the money land?</h1>
            <p className="bp-sub">
              Fill this once — every invoice pulls straight from here.
            </p>
          </div>

          <div className="bp-progress-wrap">
            <div className="bp-progress-label">
              <span>Payable-ready</span>
              <span>{progress}%</span>
            </div>
            <div className="bp-progress-track">
              <div className="bp-progress-fill" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>

        {/* WARNING */}
        <div className="bp-warning">
          <div className="bp-warning-icon">
            <AlertTriangle size={18} />
          </div>
          <p>
            <b>This exact info prints on your invoice</b> — the account holder, account
            number, IFSC and UPI ID go out to whoever's paying you. Double-check every
            digit; a single typo means your money has a lovely time in a total
            stranger's account instead of yours. 💸😅
          </p>
        </div>

        <div className="bp-grid">
          {/* LEFT: FORM */}
          <div>
            <CollapsibleCard icon={User} title="Contact Details" color="#4f8ff0" requiredTag>
              <Field
                icon={Phone}
                label="Phone Number"
                required
                error={fieldError("phone")}
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="9876543210"
              />
              <Field
                icon={User}
                label="Full Name"
                optionalTag
                name="full_name"
                value={form.full_name}
                onChange={handleChange}
                placeholder="Aryan Kukade"
              />
              <Field
                icon={Mail}
                label="Email"
                optionalTag
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
              />
            </CollapsibleCard>

            <CollapsibleCard icon={MapPin} title="Billing Address" color="#3fb37f" defaultOpen={false}>
              <Field
                icon={MapPin}
                textarea
                optionalTag
                label="Address"
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="Flat, Street, City, State, PIN"
              />
            </CollapsibleCard>

            <CollapsibleCard icon={Receipt} title="Tax Information" color="#e3b23c" defaultOpen={false}>
              <Field
                icon={Receipt}
                optionalTag
                label="PAN Number"
                name="pan_number"
                value={form.pan_number}
                onChange={handleChange}
                placeholder="Only if you invoice with PAN"
              />
              <Field
                icon={Receipt}
                optionalTag
                label="GST Number"
                name="gst_number"
                value={form.gst_number}
                onChange={handleChange}
                placeholder="Only if you're GST-registered"
              />
            </CollapsibleCard>

            <CollapsibleCard icon={Landmark} title="Bank & Payment Details" color="#a678f2" requiredTag>
              <Field
                icon={User}
                label="Account Holder Name"
                required
                error={fieldError("account_holder")}
                name="account_holder"
                value={form.account_holder}
                onChange={handleChange}
                placeholder="Exactly as it appears on the bank account"
              />
              <Field
                icon={Building2}
                label="Bank Name"
                optionalTag
                name="bank_name"
                value={form.bank_name}
                onChange={handleChange}
                placeholder="e.g. HDFC Bank"
              />
              <Field
                icon={CreditCard}
                label="Account Number"
                required
                error={fieldError("account_number")}
                name="account_number"
                value={form.account_number}
                onChange={handleChange}
              />
              <Field
                icon={Hash}
                label="IFSC Code"
                required
                error={fieldError("ifsc")}
                name="ifsc"
                value={form.ifsc}
                onChange={handleChange}
                placeholder="ABCD0123456"
              />
              <Field
                icon={BadgeIndianRupee}
                label="UPI ID"
                required
                error={fieldError("upi_id")}
                name="upi_id"
                value={form.upi_id}
                onChange={handleChange}
                placeholder="yourname@bank"
              />
            </CollapsibleCard>

            {showErrors && missing.length > 0 && (
              <div className="bp-error-banner">
                <AlertTriangle size={16} />
                Missing: {missing.map((m) => m.replace("_", " ")).join(", ")}
              </div>
            )}

            <div className="bp-savebar">
              <button
                className={`bp-save-btn ${shake ? "shake" : ""}`}
                onClick={handleSave}
                disabled={saving}
                ref={firstErrorRef}
              >
                {saving ? (
                  <>
                    <Save size={18} />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={18} />
                    Save Invoice Profile
                  </>
                )}
              </button>
            </div>
          </div>

          {/* RIGHT: LIVE RECEIPT PREVIEW */}
          <div className="bp-receipt-col">
            <div className="bp-receipt">
              {isComplete && <div className="bp-stamp">VERIFIED ✓</div>}

              <div className="bp-receipt-title">Invoice Preview</div>
              <div className="bp-receipt-sub">this is exactly what gets sent out</div>

              <div className="bp-payto">
                <div className="bp-payto-label">
                  <Wallet size={11} style={{ display: "inline", marginRight: 5, verticalAlign: -2 }} />
                  Pay To
                </div>
                <div className="bp-payto-name">
                  {form.account_holder || "—"}
                </div>
              </div>

              <div className="bp-receipt-row">
                <span className="k">Account No.</span>
                <span className={`v ${!form.account_number ? "empty" : ""}`}>
                  {form.account_number || "not filled"}
                </span>
              </div>
              <div className="bp-receipt-row">
                <span className="k">IFSC</span>
                <span className={`v ${!form.ifsc ? "empty" : ""}`}>
                  {form.ifsc || "not filled"}
                </span>
              </div>
              <div className="bp-receipt-row">
                <span className="k">Bank</span>
                <span className={`v ${!form.bank_name ? "empty" : ""}`}>
                  {form.bank_name || "not provided"}
                </span>
              </div>
              <div className="bp-receipt-row">
                <span className="k">UPI</span>
                <span className={`v ${!form.upi_id ? "empty" : ""}`}>
                  {form.upi_id || "not filled"}
                </span>
              </div>

              <hr className="bp-receipt-divider" />

              <div className="bp-receipt-row">
                <span className="k">Billed to</span>
                <span className={`v ${!form.full_name ? "empty" : ""}`}>
                  {form.full_name || "not provided"}
                </span>
              </div>
              <div className="bp-receipt-row">
                <span className="k">Contact</span>
                <span className={`v ${!form.phone ? "empty" : ""}`}>
                  {form.phone || "not filled"}
                </span>
              </div>
              <div className="bp-receipt-row">
                <span className="k">Email</span>
                <span className={`v ${!form.email ? "empty" : ""}`}>
                  {form.email || "not provided"}
                </span>
              </div>

              {(form.pan_number || form.gst_number) && (
                <>
                  <hr className="bp-receipt-divider" />
                  {form.pan_number && (
                    <div className="bp-receipt-row">
                      <span className="k">PAN</span>
                      <span className="v">{form.pan_number}</span>
                    </div>
                  )}
                  {form.gst_number && (
                    <div className="bp-receipt-row">
                      <span className="k">GST</span>
                      <span className="v">{form.gst_number}</span>
                    </div>
                  )}
                </>
              )}

              {!isComplete && (
                <div className="bp-missing-pill">
                  <AlertTriangle size={12} />
                  {missing.length} required field{missing.length > 1 ? "s" : ""} left
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {toast && (
        <div className="bp-toast">
          <CheckCircle2 size={16} color={toast.type === "error" ? "#ef6a5c" : "#6fcf97"} />
          {toast.text}
        </div>
      )}
    </div>
  );
}