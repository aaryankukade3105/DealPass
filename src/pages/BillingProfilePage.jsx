import { useEffect, useMemo, useState } from "react";
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
  Wallet,
  Sparkles,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Only these actually gate getting paid. Everything else is context. */
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
/*  Everything below is in normal document flow — no position: fixed,  */
/*  no sticky, no forced viewport heights. On a mobile app screen that */
/*  already scrolls, this content just adds height and scrolls with it.*/
/* ------------------------------------------------------------------ */
function BillingStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500;600&display=swap');

      .bp-scope {
        --ink: #0f1a14;
        --panel: #142a20;
        --gold: #e3b23c;
        --paper: #fbf6e9;
        --paper-line: #e4dcc0;
        --mint: #6fcf97;
        --alert: #ef6a5c;
        --ink-soft: rgba(251, 246, 233, 0.62);
        font-family: 'Inter', system-ui, sans-serif;
        background: #0f1a14;
        color: #fbf6e9;
        padding: 20px 16px 48px;
        max-width: 560px;
        margin: 0 auto;
      }

      .bp-display { font-family: 'Space Grotesk', sans-serif; }

      /* header */
      .bp-eyebrow {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-size: 11.5px;
        letter-spacing: 0.14em;
        text-transform: uppercase;
        color: var(--gold);
        font-weight: 600;
        margin-bottom: 8px;
      }

      .bp-title {
        font-size: 24px;
        font-weight: 700;
        margin: 0;
        line-height: 1.15;
      }

      .bp-sub {
        margin-top: 6px;
        color: var(--ink-soft);
        font-size: 13.5px;
      }

      .bp-progress-row {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-top: 16px;
      }

      .bp-progress-track {
        flex: 1;
        height: 8px;
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

      .bp-progress-pct {
        font-size: 12.5px;
        font-weight: 700;
        color: var(--gold);
        min-width: 34px;
        text-align: right;
      }

      /* warning */
      .bp-warning {
        display: flex;
        gap: 10px;
        align-items: flex-start;
        background: linear-gradient(135deg, rgba(227,178,60,0.14), rgba(227,178,60,0.05));
        border: 1px solid rgba(227,178,60,0.4);
        border-radius: 14px;
        padding: 12px 14px;
        margin: 18px 0;
      }

      .bp-warning-icon {
        flex-shrink: 0;
        width: 28px;
        height: 28px;
        border-radius: 8px;
        background: var(--gold);
        color: #241a02;
        display: grid;
        place-items: center;
      }

      .bp-warning b { color: var(--gold); }

      .bp-warning p {
        margin: 0;
        font-size: 12.5px;
        line-height: 1.5;
        color: #f4ecd6;
      }

      /* banner */
      .bp-banner {
        display: flex;
        align-items: center;
        gap: 8px;
        border-radius: 12px;
        padding: 11px 14px;
        font-size: 13px;
        font-weight: 600;
        margin-bottom: 16px;
      }

      .bp-banner.success {
        background: rgba(111,207,151,0.14);
        border: 1px solid rgba(111,207,151,0.4);
        color: #d3ffe6;
      }

      .bp-banner.error {
        background: rgba(239,106,92,0.14);
        border: 1px solid rgba(239,106,92,0.4);
        color: #ffd9d3;
      }

      /* receipt preview */
      .bp-receipt {
        background: var(--paper);
        color: #241d0c;
        border-radius: 14px;
        padding: 20px 18px 22px;
        font-family: 'IBM Plex Mono', monospace;
        position: relative;
        box-shadow: 0 10px 24px rgba(0,0,0,0.28);
        margin-bottom: 18px;
      }

      .bp-receipt-title {
        font-family: 'Space Grotesk', sans-serif;
        font-size: 11px;
        letter-spacing: 0.16em;
        text-transform: uppercase;
        text-align: center;
        color: #5c5230;
        margin-bottom: 3px;
      }

      .bp-receipt-sub {
        text-align: center;
        font-size: 10.5px;
        color: #8a7f52;
        margin-bottom: 12px;
      }

      .bp-receipt-divider {
        border: none;
        border-top: 1.5px dashed var(--paper-line);
        margin: 10px 0;
      }

      .bp-receipt-row {
        display: flex;
        justify-content: space-between;
        gap: 10px;
        font-size: 12px;
        margin-bottom: 7px;
        line-height: 1.4;
      }

      .bp-receipt-row .k { color: #8a7f52; white-space: nowrap; }
      .bp-receipt-row .v { text-align: right; font-weight: 600; word-break: break-word; }
      .bp-receipt-row .v.empty { color: #c8bf98; font-weight: 400; font-style: italic; }

      .bp-payto {
        background: rgba(15,26,20,0.05);
        border: 1.5px dashed #b6ab7c;
        border-radius: 8px;
        padding: 10px 12px;
        margin: 12px 0;
      }

      .bp-payto-label {
        font-size: 10px;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        color: #8a7f52;
        margin-bottom: 5px;
      }

      .bp-payto-name { font-family: 'Space Grotesk', sans-serif; font-size: 16px; font-weight: 700; }

      .bp-stamp {
        position: absolute;
        top: 76px;
        right: 16px;
        border: 3px solid var(--mint);
        color: #1c7a4d;
        font-family: 'Space Grotesk', sans-serif;
        font-weight: 700;
        font-size: 11.5px;
        letter-spacing: 0.05em;
        padding: 4px 8px;
        border-radius: 7px;
        transform: rotate(-11deg);
        background: rgba(111,207,151,0.08);
        animation: bp-stamp-in 0.4s ease;
      }

      @keyframes bp-stamp-in {
        0% { opacity: 0; transform: rotate(-11deg) scale(1.5); }
        100% { opacity: 1; transform: rotate(-11deg) scale(1); }
      }

      .bp-missing-pill {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-size: 11px;
        font-weight: 600;
        color: var(--alert);
        margin-top: 2px;
      }

      /* section cards */
      .bp-card {
        background: var(--panel);
        border: 1px solid rgba(251,246,233,0.08);
        border-radius: 16px;
        padding: 18px;
        margin-bottom: 14px;
      }

      .bp-section-head {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 16px;
      }

      .bp-icon-badge {
        width: 34px;
        height: 34px;
        border-radius: 10px;
        display: grid;
        place-items: center;
        color: #0f1a14;
        flex-shrink: 0;
      }

      .bp-section-title { font-size: 15.5px; font-weight: 700; }

      .bp-tag {
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 0.04em;
        padding: 3px 8px;
        border-radius: 999px;
        text-transform: uppercase;
        margin-left: auto;
        white-space: nowrap;
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

      /* inputs */
      .bp-field { margin-bottom: 12px; }

      .bp-label {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 12.5px;
        font-weight: 600;
        color: var(--ink-soft);
        margin-bottom: 6px;
      }

      .bp-label .star { color: var(--gold); }

      .bp-input-wrap { position: relative; display: flex; align-items: center; }

      .bp-input-icon {
        position: absolute;
        left: 13px;
        color: var(--ink-soft);
        pointer-events: none;
      }

      .bp-input, .bp-textarea {
        width: 100%;
        background: rgba(251,246,233,0.05);
        border: 1.5px solid rgba(251,246,233,0.14);
        border-radius: 11px;
        padding: 12px 13px 12px 40px;
        color: #fbf6e9;
        font-size: 16px; /* 16px avoids iOS auto-zoom on focus */
        font-family: inherit;
        transition: border-color 0.2s ease, background 0.2s ease;
        -webkit-appearance: none;
      }

      .bp-textarea { resize: vertical; min-height: 76px; }

      .bp-input:focus, .bp-textarea:focus {
        outline: none;
        border-color: var(--gold);
        background: rgba(251,246,233,0.08);
      }

      .bp-input::placeholder, .bp-textarea::placeholder {
        color: rgba(251,246,233,0.28);
      }

      .bp-input.error, .bp-textarea.error {
        border-color: var(--alert);
        background: rgba(239,106,92,0.08);
      }

      .bp-error-text { font-size: 11.5px; color: var(--alert); margin-top: 5px; }

      /* save button — plain block at the bottom of the scroll, not fixed */
      .bp-save-btn {
        width: 100%;
        border: none;
        border-radius: 13px;
        padding: 16px;
        font-size: 15px;
        font-weight: 700;
        font-family: 'Space Grotesk', sans-serif;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 9px;
        cursor: pointer;
        background: linear-gradient(90deg, var(--gold), #f2c96b);
        color: #241a02;
        margin-top: 6px;
        box-shadow: 0 8px 20px rgba(227,178,60,0.25);
      }

      .bp-save-btn:active { transform: scale(0.98); }
      .bp-save-btn:disabled { opacity: 0.7; }

      .bp-save-btn.shake { animation: bp-shake 0.4s ease; }

      @keyframes bp-shake {
        0%, 100% { transform: translateX(0); }
        20% { transform: translateX(-6px); }
        40% { transform: translateX(6px); }
        60% { transform: translateX(-4px); }
        80% { transform: translateX(4px); }
      }
    `}</style>
  );
}

function Field({
  icon: Icon,
  label,
  required = false,
  textarea = false,
  error = false,
  ...props
}) {
  return (
    <div className="bp-field">
      <label className="bp-label">
        {label}
        {required && <span className="star">*</span>}
      </label>

      <div className="bp-input-wrap">
        <Icon className="bp-input-icon" size={16} />
        {textarea ? (
          <textarea className={`bp-textarea ${error ? "error" : ""}`} {...props} />
        ) : (
          <input className={`bp-input ${error ? "error" : ""}`} {...props} />
        )}
      </div>

      {error && <div className="bp-error-text">This one's needed to pay you correctly.</div>}
    </div>
  );
}

function Section({ icon: Icon, title, color, requiredTag, children }) {
  return (
    <div className="bp-card">
      <div className="bp-section-head">
        <div className="bp-icon-badge" style={{ background: color }}>
          <Icon size={16} />
        </div>
        <div className="bp-section-title bp-display">{title}</div>
        <span className={`bp-tag ${requiredTag ? "required" : "optional"}`}>
          {requiredTag ? "required" : "optional"}
        </span>
      </div>
      {children}
    </div>
  );
}

export default function BillingProfilePage({ account }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [showErrors, setShowErrors] = useState(false);
  const [shake, setShake] = useState(false);
  const [banner, setBanner] = useState(null);

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
      setTimeout(() => setShake(false), 400);
      return;
    }

    try {
      setSaving(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setBanner({ type: "error", text: "Please log in again." });
        return;
      }

      const { error } = await supabase.from("billing_profiles").upsert({
        user_id: user.id,
        ...form,
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;

      setShowErrors(false);
      setBanner({ type: "success", text: "Saved — your invoice is ready to go out correctly." });
    } catch (err) {
      setBanner({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  }

  const fieldError = (key) => showErrors && !form[key]?.trim();

  if (loading) {
    return (
      <div className="bp-scope" style={{ textAlign: "center", paddingTop: 60 }}>
        Loading...
      </div>
    );
  }

  return (
    <div className="bp-scope">
      <BillingStyles />

      {/* HEADER */}
      <div className="bp-eyebrow">
        <Sparkles size={12} />
        Invoice Profile
      </div>
      <h1 className="bp-title bp-display">Where should the money land?</h1>
      <p className="bp-sub">Fill this once — every invoice pulls straight from here.</p>

      <div className="bp-progress-row">
        <div className="bp-progress-track">
          <div className="bp-progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <div className="bp-progress-pct">{progress}%</div>
      </div>

      {/* WARNING */}
      <div className="bp-warning">
        <div className="bp-warning-icon">
          <AlertTriangle size={15} />
        </div>
        <p>
          <b>This exact info prints on your invoice</b> — account holder, account
          number, IFSC and UPI ID go straight out to whoever's paying you. One typo
          and your money has a lovely time in a stranger's account instead of yours. 💸😅
        </p>
      </div>

      {banner && (
        <div className={`bp-banner ${banner.type}`}>
          <CheckCircle2 size={15} />
          {banner.text}
        </div>
      )}

      {/* LIVE RECEIPT PREVIEW */}
      <div className="bp-receipt">
        {isComplete && <div className="bp-stamp">VERIFIED ✓</div>}

        <div className="bp-receipt-title">Invoice Preview</div>
        <div className="bp-receipt-sub">this is exactly what gets sent out</div>

        <div className="bp-payto">
          <div className="bp-payto-label">
            <Wallet size={10} style={{ display: "inline", marginRight: 5, verticalAlign: -1 }} />
            Pay To
          </div>
          <div className="bp-payto-name">{form.account_holder || "—"}</div>
        </div>

        <div className="bp-receipt-row">
          <span className="k">Account No.</span>
          <span className={`v ${!form.account_number ? "empty" : ""}`}>
            {form.account_number || "not filled"}
          </span>
        </div>
        <div className="bp-receipt-row">
          <span className="k">IFSC</span>
          <span className={`v ${!form.ifsc ? "empty" : ""}`}>{form.ifsc || "not filled"}</span>
        </div>
        <div className="bp-receipt-row">
          <span className="k">Bank</span>
          <span className={`v ${!form.bank_name ? "empty" : ""}`}>
            {form.bank_name || "not provided"}
          </span>
        </div>
        <div className="bp-receipt-row">
          <span className="k">UPI</span>
          <span className={`v ${!form.upi_id ? "empty" : ""}`}>{form.upi_id || "not filled"}</span>
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
          <span className={`v ${!form.phone ? "empty" : ""}`}>{form.phone || "not filled"}</span>
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
            <AlertTriangle size={11} />
            {missing.length} required field{missing.length > 1 ? "s" : ""} left
          </div>
        )}
      </div>

      {/* FORM — stacked, single column, normal scroll flow */}
      <Section icon={User} title="Contact Details" color="#4f8ff0" requiredTag>
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
          name="full_name"
          value={form.full_name}
          onChange={handleChange}
          placeholder="Aryan Kukade"
        />
        <Field
          icon={Mail}
          label="Email"
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="you@example.com"
        />
      </Section>

      <Section icon={MapPin} title="Billing Address" color="#3fb37f">
        <Field
          icon={MapPin}
          textarea
          label="Address"
          name="address"
          value={form.address}
          onChange={handleChange}
          placeholder="Flat, Street, City, State, PIN"
        />
      </Section>

      <Section icon={Receipt} title="Tax Information" color="#e3b23c">
        <Field
          icon={Receipt}
          label="PAN Number"
          name="pan_number"
          value={form.pan_number}
          onChange={handleChange}
          placeholder="Only if you invoice with PAN"
        />
        <Field
          icon={Receipt}
          label="GST Number"
          name="gst_number"
          value={form.gst_number}
          onChange={handleChange}
          placeholder="Only if you're GST-registered"
        />
      </Section>

      <Section icon={Landmark} title="Bank & Payment Details" color="#a678f2" requiredTag>
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
      </Section>

      {showErrors && missing.length > 0 && (
        <div className="bp-banner error">
          <AlertTriangle size={15} />
          Missing: {missing.map((m) => m.replace("_", " ")).join(", ")}
        </div>
      )}

      <button
        className={`bp-save-btn ${shake ? "shake" : ""}`}
        onClick={handleSave}
        disabled={saving}
      >
        {saving ? (
          <>
            <Save size={17} />
            Saving...
          </>
        ) : (
          <>
            <CheckCircle2 size={17} />
            Save Invoice Profile
          </>
        )}
      </button>
    </div>
  );
}