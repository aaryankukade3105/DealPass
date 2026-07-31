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
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  X,
  Loader2,
} from "lucide-react";

/* Only these actually gate getting paid correctly — everything else is optional context. */
const REQUIRED_FIELDS = ["phone", "account_holder", "account_number", "ifsc", "upi_id"];

const PANEL_REQUIRED = {
  personal: ["phone"],
  address: [],
  tax: [],
  bank: ["account_holder", "account_number", "ifsc", "upi_id"],
};

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

function buzz(ms = 8) {
  try {
    if (navigator?.vibrate) navigator.vibrate(ms);
  } catch (e) {
    /* haptics are a nice-to-have, never block on them */
  }
}

function Field({ icon: Icon, label, required = false, error = false, textarea = false, ...props }) {
  return (
    <label className="bp-field">
      <span className="bp-field-label">
        {label}
        {required && <em>*</em>}
      </span>
      <span className={`bp-field-shell${error ? " bp-field-shell-err" : ""}`}>
        {Icon && <Icon size={16} className="bp-field-icon" />}
        {textarea ? (
          <textarea className="bp-field-input" rows={3} {...props} />
        ) : (
          <input className="bp-field-input" {...props} />
        )}
      </span>
      {error && <span className="bp-field-error">Needed to pay you correctly.</span>}
    </label>
  );
}

function Section({ icon: Icon, title, required, complete, open, onToggle, children }) {
  return (
    <div className="bp-sec">
      <button type="button" className="bp-sec-head" onClick={onToggle} aria-expanded={open}>
        <span className={`bp-sec-icon${complete ? " bp-sec-icon-done" : ""}`}>
          <Icon size={16} />
        </span>
        <span className="bp-sec-title">{title}</span>
        {complete ? (
          <CheckCircle2 size={17} className="bp-sec-check" />
        ) : required ? (
          <span className="bp-sec-req">Required</span>
        ) : null}
        <ChevronDown size={17} className={`bp-sec-chevron${open ? " bp-sec-chevron-open" : ""}`} />
      </button>
      <div className={`bp-sec-wrap${open ? " bp-sec-wrap-open" : ""}`}>
        <div className="bp-sec-inner">
          <div className="bp-sec-pad">{children}</div>
        </div>
      </div>
    </div>
  );
}

const STYLE = `
.bp-app {
  --bp-bg: #F7F7F5;
  --bp-card: #FFFFFF;
  --bp-border: #E7E7E2;
  --bp-text: #1B1D22;
  --bp-text-soft: #767A85;
  --bp-accent: #4F46E5;
  --bp-accent-soft: #EEECFD;
  --bp-error: #DC2626;
  --bp-error-soft: #FDECEC;
  --bp-success: #15803D;
  --bp-success-soft: #EAF7EE;

  height: 100dvh;
  display: flex;
  flex-direction: column;
  background: var(--bp-bg);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  color: var(--bp-text);
  overflow: hidden;
}
.bp-app * { box-sizing: border-box; }

.bp-topbar {
  flex: 0 0 auto;
  background: var(--bp-card);
  border-bottom: 1px solid var(--bp-border);
  padding: calc(env(safe-area-inset-top, 0px) + 16px) 18px 14px;
}
.bp-topbar-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 10px;
}
.bp-title { font-size: 17px; font-weight: 600; margin: 0; color: var(--bp-text) !important; }
.bp-subtitle { font-size: 12.5px; color: var(--bp-text-soft) !important; margin: 2px 0 0; }
.bp-pct { font-size: 13px; font-weight: 600; color: var(--bp-accent); }
.bp-track {
  height: 6px;
  border-radius: 4px;
  background: var(--bp-accent-soft);
  overflow: hidden;
}
.bp-track-fill {
  height: 100%;
  border-radius: 4px;
  background: var(--bp-accent);
  transition: width 0.3s ease;
}

.bp-scroll {
  flex: 1 1 auto;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding: 14px 14px 18px;
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.bp-scroll::-webkit-scrollbar { display: none; width: 0; height: 0; }

.bp-notice {
  position: relative;
  margin-bottom: 12px;
  padding: 11px 32px 11px 12px;
  border-radius: 10px;
  display: flex;
  gap: 9px;
  align-items: flex-start;
  color: #92400E;
  font-size: 12.5px;
  line-height: 1.5;
  background: #FEF6E7;
}
.bp-notice svg.bp-notice-icon { flex-shrink: 0; margin-top: 1px; color: #B45309; }
.bp-notice-close {
  position: absolute;
  top: 8px;
  right: 8px;
  border: none;
  background: none;
  color: #92400E;
  opacity: 0.6;
  padding: 4px;
  cursor: pointer;
}

.bp-toast {
  margin-bottom: 12px;
  padding: 10px 12px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
  animation: bp-slide-in 0.2s ease;
}
@keyframes bp-slide-in {
  from { opacity: 0; transform: translateY(-6px); }
  to { opacity: 1; transform: translateY(0); }
}
.bp-toast-success { background: var(--bp-success-soft); color: var(--bp-success); }
.bp-toast-error { background: var(--bp-error-soft); color: var(--bp-error); }

.bp-sec {
  background: var(--bp-card);
  border: 1px solid var(--bp-border);
  border-radius: 14px;
  margin-bottom: 10px;
  overflow: hidden;
}
.bp-sec-head {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 14px;
  background: none;
  border: none;
  text-align: left;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}
.bp-sec-head:active { background: #FAFAF9; }
.bp-sec-icon {
  width: 30px; height: 30px;
  border-radius: 9px;
  display: grid; place-items: center;
  background: var(--bp-accent-soft);
  color: var(--bp-accent);
  flex-shrink: 0;
}
.bp-sec-icon-done { background: var(--bp-success-soft); color: var(--bp-success); }
.bp-sec-title { flex: 1; font-size: 14.5px; font-weight: 600; color: var(--bp-text) !important; }
.bp-sec-req {
  font-size: 10.5px;
  font-weight: 600;
  letter-spacing: 0.3px;
  text-transform: uppercase;
  color: #B45309;
  background: #FEF3E2;
  padding: 3px 8px;
  border-radius: 20px;
  flex-shrink: 0;
}
.bp-sec-check { color: var(--bp-success); flex-shrink: 0; animation: bp-pop 0.25s ease; }
@keyframes bp-pop {
  0% { transform: scale(0.5); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}
.bp-sec-chevron { color: var(--bp-text-soft); transition: transform 0.2s ease; flex-shrink: 0; }
.bp-sec-chevron-open { transform: rotate(180deg); }

.bp-sec-wrap {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 0.25s ease;
}
.bp-sec-wrap-open { grid-template-rows: 1fr; }
.bp-sec-inner { overflow: hidden; min-height: 0; }
.bp-sec-pad { padding: 0 14px 14px; border-top: 1px solid var(--bp-border); padding-top: 12px; }

.bp-field { display: block; margin-bottom: 14px; }
.bp-field:last-child { margin-bottom: 2px; }
.bp-field-label {
  display: block;
  font-size: 12px;
  font-weight: 500;
  color: var(--bp-text-soft) !important;
  margin-bottom: 6px;
}
.bp-field-label em { color: var(--bp-error); font-style: normal; margin-left: 3px; }
.bp-field-shell {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--bp-bg);
  border: 1px solid var(--bp-border);
  border-radius: 10px;
  padding: 10px 12px;
  transition: border-color 0.15s ease;
}
.bp-field-shell:focus-within { border-color: var(--bp-accent); }
.bp-field-shell-err { border-color: var(--bp-error); background: var(--bp-error-soft); }
.bp-field-icon { color: var(--bp-text-soft); flex-shrink: 0; }
.bp-field-input {
  flex: 1;
  min-width: 0;
  border: none;
  background: transparent;
  outline: none;
  font-family: inherit;
  font-size: 15px;
  color: var(--bp-text) !important;
  resize: vertical;
}
.bp-field-input::placeholder { color: #A6A9B0; }
.bp-field-error { display: block; font-size: 11.5px; color: var(--bp-error); margin-top: 5px; }

.bp-scroll-spacer { height: 4px; }

.bp-bottombar {
  flex: 0 0 auto;
  background: var(--bp-card);
  border-top: 1px solid var(--bp-border);
  padding: 12px 14px calc(env(safe-area-inset-bottom, 0px) + 12px);
}
.bp-save {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: var(--bp-accent);
  color: #fff;
  border: none;
  padding: 15px;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.1s ease, opacity 0.15s ease;
  -webkit-tap-highlight-color: transparent;
}
.bp-save:active { transform: scale(0.98); }
.bp-save:disabled { opacity: 0.6; }
.bp-spin { animation: bp-spin 0.8s linear infinite; }
@keyframes bp-spin { to { transform: rotate(360deg); } }
`;

export default function BillingProfilePage({ account }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const [banner, setBanner] = useState(null);
  const [noticeDismissed, setNoticeDismissed] = useState(false);
  const [openSections, setOpenSections] = useState({ personal: true, address: false, tax: false, bank: false });

  const [form, setForm] = useState(defaultForm);
  const bannerTimer = useRef(null);

  useEffect(() => {
    loadProfile();
    return () => clearTimeout(bannerTimer.current);
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

  function toggleSection(id) {
    buzz(6);
    setOpenSections((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function flashBanner(next) {
    setBanner(next);
    clearTimeout(bannerTimer.current);
    bannerTimer.current = setTimeout(() => setBanner(null), 4000);
  }

  const missing = useMemo(
    () => REQUIRED_FIELDS.filter((key) => !form[key]?.trim()),
    [form]
  );

  const progress = useMemo(() => {
    const completed = REQUIRED_FIELDS.length - missing.length;
    return Math.round((completed / REQUIRED_FIELDS.length) * 100);
  }, [missing]);

  function isSectionComplete(id) {
    return PANEL_REQUIRED[id].every((k) => !!form[k]?.trim());
  }

  async function handleSave() {
    if (missing.length > 0) {
      setShowErrors(true);
      buzz([10, 30, 10]);

      setOpenSections((prev) => {
        const next = { ...prev };
        Object.entries(PANEL_REQUIRED).forEach(([id, keys]) => {
          if (keys.some((k) => missing.includes(k))) next[id] = true;
        });
        return next;
      });

      flashBanner({
        type: "error",
        text: `Missing: ${missing.map((m) => m.replace("_", " ")).join(", ")}`,
      });
      return;
    }

    try {
      setSaving(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        flashBanner({ type: "error", text: "Please login again." });
        return;
      }

      const { error } = await supabase
        .from("billing_profiles")
        .upsert({
          user_id: user.id,
          ...form,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      setShowErrors(false);
      buzz(15);
      flashBanner({ type: "success", text: "Saved — your invoice is ready to go out correctly." });
    } catch (err) {
      flashBanner({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  }

  const fieldError = (key) => showErrors && !form[key]?.trim();

  if (loading) {
    return (
      <div className="bp-app">
        <style>{STYLE}</style>
        <div style={{ margin: "auto", fontSize: 13.5, color: "var(--bp-text-soft, #767A85)" }}>Loading...</div>
      </div>
    );
  }

  return (
    <div className="bp-app">
      <style>{STYLE}</style>

      <div className="bp-topbar">
        <div className="bp-topbar-row">
          <div>
            <p className="bp-title">Payout profile</p>
            <p className="bp-subtitle">Fill this once. Every invoice uses these details.</p>
          </div>
          <span className="bp-pct">{progress}%</span>
        </div>
        <div className="bp-track">
          <div className="bp-track-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="bp-scroll">
        {!noticeDismissed && (
          <div className="bp-notice">
            <AlertTriangle size={15} className="bp-notice-icon" />
            <p style={{ margin: 0 }}>
              This prints on your invoice — double-check your account number, IFSC and UPI ID before saving.
            </p>
            <button className="bp-notice-close" onClick={() => setNoticeDismissed(true)} aria-label="Dismiss">
              <X size={14} />
            </button>
          </div>
        )}

        {banner && (
          <div className={`bp-toast bp-toast-${banner.type === "success" ? "success" : "error"}`}>
            <CheckCircle2 size={15} />
            {banner.text}
          </div>
        )}

        <Section
          icon={User}
          title="Personal information"
          required
          complete={isSectionComplete("personal")}
          open={openSections.personal}
          onToggle={() => toggleSection("personal")}
        >
          <Field
            icon={Phone}
            label="Phone"
            required
            error={fieldError("phone")}
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="9876543210"
          />
          <Field
            icon={User}
            label="Full name"
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

        <Section
          icon={MapPin}
          title="Billing address"
          complete={false}
          open={openSections.address}
          onToggle={() => toggleSection("address")}
        >
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

        <Section
          icon={Receipt}
          title="Tax information"
          complete={false}
          open={openSections.tax}
          onToggle={() => toggleSection("tax")}
        >
          <Field
            icon={Receipt}
            label="PAN number"
            name="pan_number"
            value={form.pan_number}
            onChange={handleChange}
            placeholder="Only if you invoice with PAN"
          />
          <Field
            icon={Receipt}
            label="GST number"
            name="gst_number"
            value={form.gst_number}
            onChange={handleChange}
            placeholder="Only if you're GST-registered"
          />
        </Section>

        <Section
          icon={Landmark}
          title="Bank details"
          required
          complete={isSectionComplete("bank")}
          open={openSections.bank}
          onToggle={() => toggleSection("bank")}
        >
          <Field
            icon={User}
            label="Account holder"
            required
            error={fieldError("account_holder")}
            name="account_holder"
            value={form.account_holder}
            onChange={handleChange}
            placeholder="Exactly as it appears on the bank account"
          />
          <Field
            icon={Building2}
            label="Bank name"
            name="bank_name"
            value={form.bank_name}
            onChange={handleChange}
            placeholder="e.g. HDFC Bank"
          />
          <Field
            icon={CreditCard}
            label="Account number"
            required
            error={fieldError("account_number")}
            name="account_number"
            value={form.account_number}
            onChange={handleChange}
          />
          <Field
            icon={Hash}
            label="IFSC code"
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

        <div className="bp-scroll-spacer" />
      </div>

      <div className="bp-bottombar">
        <button className="bp-save" onClick={handleSave} disabled={saving}>
          {saving ? (
            <>
              <Loader2 size={17} className="bp-spin" />
              Saving...
            </>
          ) : (
            <>
              <CheckCircle2 size={17} />
              Save profile
            </>
          )}
        </button>
      </div>
    </div>
  );
}