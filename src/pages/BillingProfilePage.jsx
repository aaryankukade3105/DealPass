import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "../lib/supabase";
import ConfirmDialog from "../components/common/ConfirmDialog";
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
const REQUIRED_FIELDS = [
  "phone",
  "account_holder",
  "bank_name",
  "account_number",
  "ifsc",
  "upi_id",
];

const PANEL_REQUIRED = {
  personal: ["phone"],
  address: [],
  tax: [],
  bank: ["account_holder", "bank_name", "account_number", "ifsc", "upi_id"],
};

/* One accent per section — a visual grouping cue only, never a status
   signal. Status (required / complete / error) always stays on the
   semantic amber/green/red so the two systems never collide. */
const SECTION_COLORS = {
  personal: "#2563EB", // blue
  address: "#0D9488", // teal
  tax: "#D97706", // amber
  bank: "#4F46E5", // indigo — the section that actually gates payment
};

/* Common country codes — IND first & selected by default. */
const COUNTRY_CODES = [
  { code: "+91", label: "🇮🇳 +91", iso: "IN" },
  { code: "+1", label: "🇺🇸 +1", iso: "US" },
  { code: "+44", label: "🇬🇧 +44", iso: "GB" },
  { code: "+971", label: "🇦🇪 +971", iso: "AE" },
  { code: "+65", label: "🇸🇬 +65", iso: "SG" },
  { code: "+61", label: "🇦🇺 +61", iso: "AU" },
  { code: "+49", label: "🇩🇪 +49", iso: "DE" },
  { code: "+81", label: "🇯🇵 +81", iso: "JP" },
];

/* Common UPI handles shown when the user types "@" — manual entry always allowed. */
const UPI_HANDLES = [
  "okhdfcbank",
  "oksbi",
  "okicici",
  "okaxis",
  "ybl", // PhonePe
  "paytm",
  "apl", // Amazon Pay
  "upi",
];

const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][0-9][A-Z][0-9]$/;
const IFSC_REGEX = /^[A-Z]{4}0[A-Z0-9]{6}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
/* Phone: digits only, 6–14 of them (covers most national number lengths). */
const PHONE_REGEX = /^[0-9]{6,14}$/;

const defaultForm = {
  full_name: "",
  email: "",
  phone: "",
  phone_country: "+91",

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

function hexToRgba(hex, alpha) {
  const h = hex.replace("#", "");
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/* Returns an error string, or null if the value is valid (or optional & empty). */
function validateField(key, form) {
  const value = (form[key] || "").trim();
  const required = REQUIRED_FIELDS.includes(key);

  if (!value) {
    return required ? "Needed to pay you correctly." : null;
  }

  switch (key) {
    case "email":
      return EMAIL_REGEX.test(value) ? null : "Enter a valid email address.";
    case "phone":
      return PHONE_REGEX.test(value) ? null : "Enter a valid phone number.";
    case "pan_number":
      return PAN_REGEX.test(value)
        ? null
        : "Format: 5 letters + 4 numbers + 1 letter (e.g. ABCDE1234F).";
    case "gst_number":
      return GSTIN_REGEX.test(value)
        ? null
        : "Format: 22ABCDE1234F1Z5 (state code + PAN + entity code).";
    case "ifsc":
      return IFSC_REGEX.test(value)
        ? null
        : "Format: 4 letters + 0 + 6 alphanumeric (e.g. HDFC0001234).";
    case "upi_id":
      return value.includes("@") ? null : "Format: name@bankhandle.";
    default:
      return null;
  }
}

function Field({
  icon: Icon,
  label,
  required = false,
  error = false,
  errorText,
  textarea = false,
  trailing,
  ...props
}) {
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
        {trailing}
      </span>
      {error && (
        <span className="bp-field-error">
          {errorText || "Needed to pay you correctly."}
        </span>
      )}
    </label>
  );
}

function Section({ icon: Icon, title, color, required, complete, open, onToggle, children }) {
  return (
    <div className="bp-sec">
      <button type="button" className="bp-sec-head" onClick={onToggle} aria-expanded={open}>
        <span
          className={`bp-sec-icon${complete ? " bp-sec-icon-done" : ""}`}
          style={
            complete
              ? undefined
              : { background: hexToRgba(color, 0.12), color }
          }
        >
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
          <div className="bp-sec-pad" style={{ borderTopColor: hexToRgba(color, 0.35) }}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

/* Lightweight shimmer placeholder shown while the session/profile load —
   keeps the topbar chrome real (so the page doesn't feel blank) and
   fakes the shape of the sections below it so nothing "pops in". */
function SkeletonBlock({ height, width = "100%", radius = 8 }) {
  return (
    <div
      className="bp-skel"
      style={{ height, width, borderRadius: radius }}
    />
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

.bp-field { display: block; margin-bottom: 14px; position: relative; }
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

/* Phone: country-code select + number input in one shell */
.bp-phone-shell {
  display: flex;
  align-items: stretch;
  gap: 0;
  background: var(--bp-bg);
  border: 1px solid var(--bp-border);
  border-radius: 10px;
  overflow: hidden;
  transition: border-color 0.15s ease;
}
.bp-phone-shell:focus-within { border-color: var(--bp-accent); }
.bp-phone-shell-err { border-color: var(--bp-error); background: var(--bp-error-soft); }
.bp-phone-code {
  border: none;
  background: transparent;
  outline: none;
  font-family: inherit;
  font-size: 14px;
  font-weight: 600;
  color: var(--bp-text) !important;
  padding: 10px 6px 10px 12px;
  border-right: 1px solid var(--bp-border);
  flex-shrink: 0;
  max-width: 92px;
}
.bp-phone-input {
  flex: 1;
  min-width: 0;
  border: none;
  background: transparent;
  outline: none;
  font-family: inherit;
  font-size: 15px;
  color: var(--bp-text) !important;
  padding: 10px 12px;
}

/* UPI suggestion dropdown */
.bp-upi-dropdown {
  position: absolute;
  left: 0;
  right: 0;
  top: 100%;
  margin-top: 4px;
  background: var(--bp-card);
  border: 1px solid var(--bp-border);
  border-radius: 10px;
  box-shadow: 0 8px 20px -6px rgba(0,0,0,0.15);
  z-index: 50;   /* was 20 */
  overflow: hidden;
  max-height: 220px;
  overflow-y: auto;
}
.bp-upi-option {
  width: 100%;
  text-align: left;
  padding: 10px 12px;
  background: none;
  border: none;
  font-size: 14px;
  color: var(--bp-text) !important;
  cursor: pointer;
}
.bp-upi-option:active { background: var(--bp-accent-soft); }
.bp-upi-option + .bp-upi-option { border-top: 1px solid var(--bp-border); }

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

.bp-skel {
  background: linear-gradient(90deg, #EDEDEA 25%, #F5F5F2 37%, #EDEDEA 63%);
  background-size: 400% 100%;
  animation: bp-shimmer 1.4s ease infinite;
}
@keyframes bp-shimmer {
  0% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
@media (prefers-reduced-motion: reduce) {
  .bp-skel { animation: none; background: #EDEDEA; }
}
`;

export default function BillingProfilePage({ account, onSaved }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const [banner, setBanner] = useState(null);
  const [noticeDismissed, setNoticeDismissed] = useState(false);
  const [openSections, setOpenSections] = useState({ personal: true, address: false, tax: false, bank: false });
  const [upiDropdownOpen, setUpiDropdownOpen] = useState(false);
const [showSavedDialog, setShowSavedDialog] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const bannerTimer = useRef(null);
  const upiFieldRef = useRef(null);

  useEffect(() => {
    loadProfile();
    return () => clearTimeout(bannerTimer.current);
  }, []);

  // Close the UPI dropdown on outside click.
  useEffect(() => {
    function handleClickOutside(e) {
      if (upiFieldRef.current && !upiFieldRef.current.contains(e.target)) {
        setUpiDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function loadProfile() {
    // getSession() resolves from the already-verified local session
    // (memory/localStorage) with no network round-trip. getUser() instead
    // calls out to Supabase to re-validate the JWT every time it's called,
    // which was adding a full extra network hop before this page could
    // even start fetching the profile it actually needs. RLS on the
    // billing_profiles query still enforces real access control, so this
    // is just as safe for reading "which user am I" here.
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const user = session?.user;
    if (!user) {
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from("billing_profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (data) {
      setForm({ ...defaultForm, ...data, phone_country: data.phone_country || "+91" });
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

    // Auto-uppercase identifiers that are always uppercase by format.
    const upperFields = ["pan_number", "gst_number", "ifsc"];
    const nextValue = upperFields.includes(name) ? value.toUpperCase() : value;

    setForm((prev) => ({ ...prev, [name]: nextValue }));

    if (name === "upi_id") {
      setUpiDropdownOpen(nextValue.includes("@"));
    }
  }

  function handlePhoneChange(e) {
    // Digits only.
    const digits = e.target.value.replace(/\D/g, "");
    setForm((prev) => ({ ...prev, phone: digits }));
  }

  function handleCountryChange(e) {
    setForm((prev) => ({ ...prev, phone_country: e.target.value }));
  }

  function pickUpiHandle(handle) {
    setForm((prev) => {
      const before = (prev.upi_id.split("@")[0] || "").trim();
      return { ...prev, upi_id: `${before}@${handle}` };
    });
    setUpiDropdownOpen(false);
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

  // Fields that get validated: all required fields, plus optional-but-formatted ones.
  const VALIDATED_FIELDS = [...REQUIRED_FIELDS, "email", "pan_number", "gst_number"];

  const errors = useMemo(() => {
    const map = {};
    VALIDATED_FIELDS.forEach((key) => {
      const err = validateField(key, form);
      if (err) map[key] = err;
    });
    return map;
  }, [form]);

  const missing = useMemo(
    () => REQUIRED_FIELDS.filter((key) => !form[key]?.trim()),
    [form]
  );

  const progress = useMemo(() => {
    const completed = REQUIRED_FIELDS.length - missing.length;
    return Math.round((completed / REQUIRED_FIELDS.length) * 100);
  }, [missing]);

  function isSectionComplete(id) {
    return PANEL_REQUIRED[id].every((k) => !!form[k]?.trim() && !errors[k]);
  }

  async function handleSave() {
    const errorKeys = Object.keys(errors);

    if (errorKeys.length > 0) {
      setShowErrors(true);
      buzz([10, 30, 10]);

      setOpenSections((prev) => {
        const next = { ...prev };
        Object.entries(PANEL_REQUIRED).forEach(([id, keys]) => {
          if (keys.some((k) => errorKeys.includes(k))) next[id] = true;
        });
        // Tax section isn't in PANEL_REQUIRED's required list, but PAN/GST
        // errors still need to surface there.
        if (errorKeys.includes("pan_number") || errorKeys.includes("gst_number")) {
          next.tax = true;
        }
        return next;
      });

      const missingCount = missing.length;
      const formatCount = errorKeys.length - missingCount;
      flashBanner({
        type: "error",
        text:
          missingCount > 0
            ? `Missing: ${missing.map((m) => m.replace("_", " ")).join(", ")}`
            : `Fix ${formatCount} field${formatCount > 1 ? "s" : ""} with an invalid format.`,
      });
      return;
    }

    try {
      setSaving(true);

      // Same reasoning as loadProfile: getSession() avoids an unnecessary
      // network call to re-validate the token right before a save that's
      // about to hit the network anyway for the actual upsert.
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const user = session?.user;
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

      // Show a styled confirmation. Navigation back to the profile page
      // (and updating `account`) happens once the user dismisses the
      // dialog — see the ConfirmDialog's onConfirm/onCancel below.
      setShowSavedDialog(true);
    } catch (err) {
      flashBanner({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  }

  const fieldError = (key) => showErrors && !!errors[key];
  const fieldErrorText = (key) => errors[key];

  if (loading) {
    return (
      <div className="bp-app">
        <style>{STYLE}</style>

        <div className="bp-topbar">
          <div className="bp-topbar-row">
            <div>
              <p className="bp-title">Payout profile</p>
              <p className="bp-subtitle">Fill this once. Every invoice uses these details.</p>
            </div>
          </div>
          <div className="bp-track">
            <div className="bp-track-fill" style={{ width: "0%" }} />
          </div>
        </div>

        <div className="bp-scroll">
          {[64, 96, 96, 140].map((h, i) => (
            <div key={i} style={{ marginBottom: 10 }}>
              <SkeletonBlock height={h} radius={14} />
            </div>
          ))}
        </div>

        <div className="bp-bottombar">
          <SkeletonBlock height={48} radius={12} />
        </div>
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
          color={SECTION_COLORS.personal}
          required
          complete={isSectionComplete("personal")}
          open={openSections.personal}
          onToggle={() => toggleSection("personal")}
        >
          {/* Phone: country code select + number */}
          <label className="bp-field">
            <span className="bp-field-label">
              Phone
              <em>*</em>
            </span>
            <span
              className={`bp-phone-shell${fieldError("phone") ? " bp-phone-shell-err" : ""}`}
            >
              <select
                className="bp-phone-code"
                value={form.phone_country}
                onChange={handleCountryChange}
                aria-label="Country code"
              >
                {COUNTRY_CODES.map((c) => (
                  <option key={c.iso} value={c.code}>
                    {c.label}
                  </option>
                ))}
              </select>
              <input
                className="bp-phone-input"
                type="tel"
                inputMode="numeric"
                name="phone"
                value={form.phone}
                onChange={handlePhoneChange}
                placeholder="9876543210"
              />
            </span>
            {fieldError("phone") && (
              <span className="bp-field-error">{fieldErrorText("phone")}</span>
            )}
          </label>

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
            error={fieldError("email")}
            errorText={fieldErrorText("email")}
          />
        </Section>

        <Section
          icon={MapPin}
          title="Billing address"
          color={SECTION_COLORS.address}
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
          color={SECTION_COLORS.tax}
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
            placeholder="ABCDE1234F — only if you invoice with PAN"
            maxLength={10}
            error={fieldError("pan_number")}
            errorText={fieldErrorText("pan_number")}
          />
          <Field
            icon={Receipt}
            label="GST number"
            name="gst_number"
            value={form.gst_number}
            onChange={handleChange}
            placeholder="27ABCDE1234F1Z5 — only if you're GST-registered"
            maxLength={15}
            error={fieldError("gst_number")}
            errorText={fieldErrorText("gst_number")}
          />
        </Section>

        <Section
          icon={Landmark}
          title="Bank details"
          color={SECTION_COLORS.bank}
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
            required
            error={fieldError("bank_name")}
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
            errorText={fieldErrorText("ifsc")}
            name="ifsc"
            value={form.ifsc}
            onChange={handleChange}
            placeholder="HDFC0001234"
            maxLength={11}
          />

          {/* UPI ID with handle-suggestion dropdown */}
        {/* UPI ID with handle-suggestion dropdown */}
<div ref={upiFieldRef} style={{ position: "relative" }}>
            <Field
              icon={BadgeIndianRupee}
              label="UPI ID"
              required
              error={fieldError("upi_id")}
              errorText={fieldErrorText("upi_id")}
              name="upi_id"
              value={form.upi_id}
              onChange={handleChange}
              onFocus={() => setUpiDropdownOpen(form.upi_id.includes("@"))}
              placeholder="yourname@bank"
              trailing={
                form.upi_id.includes("@") ? null : (
                  <button
                    type="button"
                    onClick={() => {
                      setForm((prev) => ({
                        ...prev,
                        upi_id: prev.upi_id ? `${prev.upi_id}@` : "@",
                      }));
                      setUpiDropdownOpen(true);
                    }}
                    style={{
                      border: "none",
                      background: "none",
                      color: "var(--bp-accent)",
                      fontWeight: 700,
                      fontSize: 15,
                      cursor: "pointer",
                      flexShrink: 0,
                    }}
                    aria-label="Choose UPI handle"
                  >
                    @
                  </button>
                )
              }
            />
            {upiDropdownOpen && (
              <div className="bp-upi-dropdown">
                {UPI_HANDLES.filter((h) =>
                  h.toLowerCase().includes(
                    (form.upi_id.split("@")[1] || "").toLowerCase()
                  )
                ).map((handle) => (
                  <button
                    key={handle}
                    type="button"
                    className="bp-upi-option"
                    onClick={() => pickUpiHandle(handle)}
                  >
                    {(form.upi_id.split("@")[0] || "yourname")}@{handle}
                  </button>
                ))}
              </div>
            )}
          </div>
{showSavedDialog && (
  <ConfirmDialog
    title="Saved"
    message="Your billing profile has been saved."
    confirmText="Done"
    cancelText="Close"
    onConfirm={() => {
      setShowSavedDialog(false);
      onSaved?.(form);
    }}
    onCancel={() => {
      setShowSavedDialog(false);
      onSaved?.(form);
    }}
  />
)}
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