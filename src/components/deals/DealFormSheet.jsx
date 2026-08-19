import { useState, useRef, useEffect } from "react";
import Field from "../common/Field";
import ChipSelect from "../common/ChipSelect";
import {
  X,
  Receipt,
  Link2,
  PenLine,
  CheckCircle2,
  Clock,
  ChevronDown,
  ChevronRight,
  Building2,
  FileSignature,
  Sparkles,
  CalendarCheck2,
  ListChecks,
  Camera,
  CalendarRange,
  Wallet,
  StickyNote,
  PartyPopper,
} from "lucide-react";
import { formatDate, formatINR } from "../../utils/formatters";
import DateField from "../common/DateField";
import DeliverablesSelector from "./DeliverablesSelector";
import { createPortal } from "react-dom";
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



const FORM_SECTION_META = {
  "Brand Details": {
    icon: Building2,
    accent: "#7C5CFC",
    tint: "#F4F1FF",
    sub: "Who’s on the other side",
  },

  "Deal Details": {
    icon: FileSignature,
    accent: "#2563EB",
    tint: "#EFF6FF",
    sub: "What’s the deal?",
  },

  "Confirmation": {
    icon: CalendarCheck2,
    accent: "#0D9488",
    tint: "#F0FDFA",
    sub: "Make it official",
  },

  "Status": {
    icon: Sparkles,
    accent: "#D97706",
    tint: "#FFF7ED",
    sub: "Where things stand",
  },

  "Content": {
    icon: ListChecks,
    accent: "#0891B2",
    tint: "#ECFEFF",
    sub: "What are you delivering?",
  },

  "🎥 Shoot Details": {
    icon: Camera,
    accent: "#DB2777",
    tint: "#FDF2F8",
    sub: "Plan the shoot",
  },

  "Content Timeline": {
    icon: CalendarRange,
    accent: "#4F46E5",
    tint: "#EEF2FF",
    sub: "When does it go live?",
  },

  "Commercials": {
    icon: Wallet,
    accent: "#16A34A",
    tint: "#F0FDF4",
    sub: "Show me the money",
  },

  "Invoice": {
    icon: Receipt,
    accent: "#9333EA",
    tint: "#FAF5FF",
    sub: "Keep the paperwork sorted",
  },

  "Notes": {
    icon: StickyNote,
    accent: "#64748B",
    tint: "#F8FAFC",
    sub: "Anything else worth noting",
  },
};


const FORM_SECTION_ORDER = [
  { id: "brand", label: "Brand", icon: Building2, accent: "#7C5CFC", tint: "#F4F1FF" },
  { id: "deal", label: "Deal", icon: FileSignature, accent: "#2563EB", tint: "#EFF6FF" },
  { id: "status", label: "Status", icon: Sparkles, accent: "#D97706", tint: "#FFF7ED" },
  { id: "confirmation", label: "Confirm", icon: CalendarCheck2, accent: "#0D9488", tint: "#F0FDFA" },
  { id: "content", label: "Content", icon: ListChecks, accent: "#0891B2", tint: "#ECFEFF" },
  { id: "shoot", label: "Shoot", icon: Camera, accent: "#DB2777", tint: "#FDF2F8" },
  { id: "timeline", label: "Timeline", icon: CalendarRange, accent: "#4F46E5", tint: "#EEF2FF" },
  { id: "money", label: "Money", icon: Wallet, accent: "#16A34A", tint: "#F0FDF4" },
  { id: "invoice", label: "Invoice", icon: Receipt, accent: "#9333EA", tint: "#FAF5FF" },
  { id: "notes", label: "Notes", icon: StickyNote, accent: "#64748B", tint: "#F8FAFC" },
];

// Per-section "is this filled in" check, used to color-fill jump-bar chips
// as the user progresses through the form. Kept deliberately lenient —
// these mirror what actually matters for that section, not the hard
// submit-time validation in handleSubmit (which stays the source of truth
// for what's truly required).
function getSectionCompletion(form, touched) {
  const isBarter = form.collaboration_type === "Barter";
  return {
    brand: Boolean(form.brand_name?.trim()),
    deal: Boolean(form.deal_title?.trim()),
    // deal_status defaults to "Negotiation" and collaboration_type defaults
    // to "Paid" — both are non-empty from the moment the form mounts, so a
    // plain truthy check would mark these chips "filled" before the user
    // ever touches them. Require an actual interaction instead.
    status: touched.has("deal_status"),
    confirmation: Boolean(form.confirmation_date),
    content: Boolean(form.deliverables?.length > 0),
    shoot: Boolean(form.shoot_date),
    timeline: Boolean(
      form.content_due_date || form.content_submitted_date || form.posted_date
    ),
    money: isBarter || Number(form.commercials) > 0,
    invoice: Boolean(form.invoice_number?.trim()),
    notes: Boolean(form.notes?.trim()),
  };
}

function SectionJumpBar({ activeSection, onJump, completed = {} }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        overflowX: "auto",
        overflowY: "visible",
        padding: "10px 14px",
        borderBottom: "1px solid var(--line)",
        background: "var(--surface, #fff)",
        scrollbarWidth: "none",
        WebkitOverflowScrolling: "touch",
        scrollSnapType: "x proximity",
        scrollPaddingInline: 14,
        touchAction: "pan-x",
        userSelect: "none",
      }}
    >
      {FORM_SECTION_ORDER.map((section) => {
        const Icon = section.icon;
        const active = activeSection === section.id;
        const isFilled = Boolean(completed[section.id]);
        return (
          <button
            key={section.id}
            type="button"
            onClick={() => onJump(section.id)}
            aria-current={active ? "true" : undefined}
            style={{
              flex: "0 0 auto",
              flexShrink: 0,
              scrollSnapAlign: "start",
              boxSizing: "border-box",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 5,
              padding: "0 10px",
              height: 30,
              minHeight: 30,
              borderRadius: 999,
              border: isFilled
                ? `1px solid ${section.accent}`
                : active
                ? `1px solid ${section.accent}55`
                : "1px solid var(--line)",
              background: isFilled
                ? section.accent
                : active
                ? section.tint
                : "var(--surface, #fff)",
              color: isFilled ? "#fff" : active ? section.accent : "var(--slate)",
              fontSize: 11,
              fontWeight: 800,
              lineHeight: 1,
              cursor: "pointer",
              whiteSpace: "nowrap",
              boxShadow: active && !isFilled ? `0 0 0 2px ${section.accent}25` : "none",
              transition: "background 160ms ease, color 160ms ease, border-color 160ms ease",
            }}
          >
            <Icon size={12} style={{ flexShrink: 0, display: "block" }} />
            <span style={{ display: "block" }}>{section.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function ColorSectionHeader({ title }) {
  const s = FORM_SECTION_META[title];
  const Icon = s.icon;
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: 10,
      margin: "0 0 14px",
      padding: "10px 12px",
      borderRadius: 14,
      background: `linear-gradient(90deg, ${s.tint} 0%, #fff 100%)`,
      border: `1px solid ${s.accent}30`,
      boxShadow: `0 4px 14px ${s.accent}10`,
    }}>
      <div style={{
        width: 36,
        height: 36,
        borderRadius: 11,
        background: "#fff",
        border: `1px solid ${s.accent}30`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}>
        <Icon size={18} color={s.accent} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: "var(--ink)" }}>
          {title.replace("🎥 ", "")}
        </div>
        <div style={{ fontSize: 11, color: "var(--slate)", marginTop: 2 }}>
          {s.sub}
        </div>
      </div>
      <div style={{
        width: 7,
        height: 28,
        borderRadius: 99,
        background: s.accent,
      }} />
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* SectionWrap — wraps a whole form section (header + its fields) in a    */
/* color-coded container so each section reads as its own visual block.  */
/* The left accent bar + faint tinted border/background echo the color   */
/* already used in the jump bar and header, so navigation stays          */
/* consistent whether you're scrolling or tapping a chip up top.         */
/* ---------------------------------------------------------------------- */
function SectionWrap({ id, title, children }) {
  const s = FORM_SECTION_META[title];
  return (
    <div
      id={`deal-section-${id}`}
      data-deal-section={id}
      style={{
        margin: "26px 0",
        padding: "16px 16px 6px",
        borderRadius: 18,
        background: `${s.tint}80`,
        border: `1px solid ${s.accent}25`,
        borderLeft: `4px solid ${s.accent}`,
      }}
    >
      <ColorSectionHeader title={title} />
      {children}
    </div>
  );
}

function ClearFieldButton({ onClear, label }) {
  return (
    <button
      type="button"
      onClick={onClear}
      title={label}
      aria-label={label}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        marginTop: -8,
        marginBottom: 12,
        padding: "5px 9px",
        borderRadius: 999,
        border: "1px solid var(--line)",
        background: "var(--surface, #fff)",
        color: "var(--slate)",
        cursor: "pointer",
        fontSize: 11,
        fontWeight: 700,
      }}
    >
      <X size={12} />
      Clear
    </button>
  );
}

/* ---------------------------------------------------------------------- */
/* TimeField — a tap-to-pick time selector instead of the native OS       */
/* time-spinner input. Still stores/emits a plain 24hr "HH:MM" string, so */
/* every consumer of form.shoot_time keeps working exactly as before.     */
/* ---------------------------------------------------------------------- */

const QUICK_TIMES = [
  "06:00", "07:00", "08:00", "09:00", "10:00", "11:00",
  "12:00", "13:00", "14:00", "15:00", "16:00", "17:00",
  "18:00", "19:00", "20:00", "21:00",
];

function to12Hour(value) {
  const [h, m] = value.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hh = h % 12 === 0 ? 12 : h % 12;
  return { hour: hh, minute: m, period };
}

function to24Hour(hour, minute, period) {
  let h = Number(hour) % 12;
  if (period === "PM") h += 12;
  return `${String(h).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function formatDisplayTime(value) {
  if (!value) return "";
  const { hour, minute, period } = to12Hour(value);
  return `${hour}:${String(minute).padStart(2, "0")} ${period}`;
}

export function TimeField({ value, onChange, disabled, placeholder = "Select shoot time" }) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState(null); // { left, width, top, maxHeight }
  const triggerRef = useRef(null);
  const popupRef = useRef(null);

  const current = value ? to12Hour(value) : { hour: 10, minute: 0, period: "AM" };

  // Compute (and keep updated) the popup's fixed position whenever it's open.
  useEffect(() => {
    if (!open) return;

    const PADDING = 12; // minimum gap kept from the top/bottom viewport edges

    const place = () => {
      const rect = triggerRef.current?.getBoundingClientRect();
      if (!rect) return;

      const viewportHeight = window.innerHeight;
      const popupHeight = popupRef.current?.offsetHeight ?? 330;

      // Prefer opening below the trigger.
      let top = rect.bottom + 6;

      // If it would run past the bottom, pull it up — but never let it
      // climb past PADDING from the top of the viewport.
      if (top + popupHeight > viewportHeight - PADDING) {
        top = Math.max(PADDING, viewportHeight - PADDING - popupHeight);
      }

      setCoords({
        left: rect.left,
        width: rect.width,
        top,
        maxHeight: Math.min(360, viewportHeight - top - PADDING),
      });
    };

    place();
    // Re-measure now that the popup has actually rendered, so popupHeight
    // reflects real content instead of the fallback estimate.
    const raf = requestAnimationFrame(place);

    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true); // capture: catches ancestor scroll too
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [open]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (
        triggerRef.current && !triggerRef.current.contains(e.target) &&
        popupRef.current && !popupRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const setPart = (part, val) => {
    const next = { ...current, [part]: val };
    onChange(to24Hour(next.hour, next.minute, next.period));
  };

  return (
    <div style={{ position: "relative" }}>
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={() => setOpen((prev) => !prev)}
        className="dp-input"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          textAlign: "left",
          cursor: disabled ? "not-allowed" : "pointer",
          opacity: disabled ? 0.55 : 1,
          background: disabled ? "var(--surface-muted, #F7F8FC)" : undefined,
          width: "100%",
        }}
      >
        <span
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            color: value ? "var(--ink)" : "var(--slate)",
          }}
        >
          <Clock size={15} color="var(--slate)" />
          {value ? formatDisplayTime(value) : placeholder}
        </span>
        <ChevronDown
          size={16}
          color="var(--slate)"
          style={{
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 120ms ease",
          }}
        />
      </button>

      {open && !disabled && createPortal(
        <div
          ref={popupRef}
          style={{
            position: "fixed",
            left: coords?.left ?? 0,
            width: coords?.width ?? "auto",
            top: coords?.top ?? 0,
            visibility: coords ? "visible" : "hidden", // avoid a flash at (0,0) before first measure
            zIndex: 1300, // clears MUI's dialog/modal layer and the bottom sheet
            background: "#fff",
            border: "1px solid var(--line)",
            borderRadius: 14,
            boxShadow: "0 14px 30px rgba(0,0,0,.14)",
            padding: 14,
            maxHeight: coords?.maxHeight ?? "min(60vh, 360px)",
            overflowY: "auto",
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: "var(--slate)",
              textTransform: "uppercase",
              letterSpacing: 0.4,
              marginBottom: 8,
            }}
          >
            Quick pick
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 6,
              marginBottom: 14,
            }}
          >
            {QUICK_TIMES.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => {
                  onChange(t);
                  setOpen(false);
                }}
                style={{
                  padding: "8px 4px",
                  borderRadius: 9,
                  fontSize: 12.5,
                  fontWeight: 700,
                  border: value === t ? "1px solid var(--signal)" : "1px solid var(--line)",
                  background: value === t ? "rgba(255,59,92,.08)" : "transparent",
                  color: value === t ? "var(--signal)" : "var(--ink)",
                  cursor: "pointer",
                }}
              >
                {formatDisplayTime(t)}
              </button>
            ))}
          </div>

          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: "var(--slate)",
              textTransform: "uppercase",
              letterSpacing: 0.4,
              marginBottom: 8,
            }}
          >
            Custom time
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <select
              className="dp-input"
              style={{ flex: 1 }}
              value={current.hour}
              onChange={(e) => setPart("hour", Number(e.target.value))}
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
                <option key={h} value={h}>{h}</option>
              ))}
            </select>

            <input
              type="number"
              className="dp-input"
              style={{ flex: 1 }}
              inputMode="numeric"
              min={0}
              max={59}
              step={1}
              value={String(current.minute).padStart(2, "0")}
              onChange={(e) => {
                const raw = e.target.value;
                if (raw === "") {
                  setPart("minute", 0);
                  return;
                }
                let m = parseInt(raw, 10);
                if (isNaN(m)) return;
                if (m < 0) m = 0;
                if (m > 59) m = 59;
                setPart("minute", m);
              }}
            />

            <select
              className="dp-input"
              style={{ flex: 1 }}
              value={current.period}
              onChange={(e) => setPart("period", e.target.value)}
            >
              <option value="AM">AM</option>
              <option value="PM">PM</option>
            </select>
          </div>

          <button
            type="button"
            onClick={() => setOpen(false)}
            className="dp-btn-signal"
            style={{ width: "100%", marginTop: 12 }}
          >
            Done
          </button>
        </div>,
        document.body
      )}
    </div>
  );
}
/* ---------------------------------------------------------------------- */

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

  collaboration_type: "",

  confirmation_date: "",
  confirmation_mode: "",

  deliverables: [],
  deliverable_count: 1,

  content_due_date: "",
  content_submitted_date: "",
  posted_date: "",
  campaign_links: "",

  commercials: "",
  currency: "",

  payment_mode: "",
  payment_status: "",
  payment_deadline: "",
  payment_received_date: "",
  payment_received_amount: "",

  deal_status: "",

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
  const [justSaved, setJustSaved] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [activeSection, setActiveSection] = useState("brand");
  const scrollRootRef = useRef(null);
  const isBarter = form.collaboration_type === "Barter";
const canEditShoot = ![
  "Negotiation",
  "Cancelled",
].includes(form.deal_status);
  const [touchedFields, setTouchedFields] = useState(() => new Set());
  const update = (field, value) => {
    setIsDirty(true);
    setJustSaved(false);
    setTouchedFields((prev) => {
      if (prev.has(field)) return prev;
      const next = new Set(prev);
      next.add(field);
      return next;
    });
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

  // Keep save reachable from anywhere in the long form.
  const completionPercent = (() => {
    const checks = [
      form.brand_name?.trim(),
      form.deal_title?.trim(),
      form.confirmation_date,
      form.deliverables?.length > 0,
      form.collaboration_type === "Barter" || Number(form.commercials) > 0,
      form.deal_status,
    ];
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  })();

  const sectionCompletion = getSectionCompletion(form, touchedFields);

  useEffect(() => {
    const onKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        if (!saving) handleSubmit();
      }
    };

    const onBeforeUnload = (e) => {
      if (!isDirty || saving) return;
      e.preventDefault();
      e.returnValue = "";
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("beforeunload", onBeforeUnload);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("beforeunload", onBeforeUnload);
    };
  }, [isDirty, saving]);


  useEffect(() => {
    const root = scrollRootRef.current;
    if (!root) return;

    const nodes = [...root.querySelectorAll("[data-deal-section]")];
    if (!nodes.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible?.target?.dataset?.dealSection) {
          setActiveSection(visible.target.dataset.dealSection);
        }
      },
      { root, threshold: [0.15, 0.35, 0.6] }
    );

    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  const jumpToSection = (id) => {
    const root = scrollRootRef.current;
    const target = root?.querySelector(`[data-deal-section="${id}"]`);
    if (!root || !target) return;

    // Use getBoundingClientRect deltas rather than offsetTop: offsetTop is
    // relative to the nearest *positioned* ancestor, which isn't
    // guaranteed to be the scroll container, so it can land on the wrong
    // spot. This measures directly against the scroll container itself.
    const rootRect = root.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    const offset = targetRect.top - rootRect.top + root.scrollTop;

    root.scrollTo({
      top: Math.max(0, offset - 8),
      behavior: "smooth",
    });
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();

    if (!form.brand_name.trim()) {
      showAlert("warning", "Brand Name Required", "Please enter the brand name.");
      return;
    }

    if (!form.deal_title.trim()) {
      showAlert("warning", "Deal Title Required", "Please enter the deal title.");
      return;
    }

   if (!form.confirmation_date) {
  showAlert(
    "warning",
    "Confirmation Date Required",
    "Please select the confirmation date."
  );
  return;
}

if (
  form.collaboration_type === "Paid" &&
  (form.commercials === "" || Number(form.commercials) <= 0)
) {
  showAlert(
    "warning",
    "Commercial Amount Required",
    "Please enter a commercial amount greater than ₹0."
  );
  return;
}

if (form.deliverables.length === 0) {
  showAlert(
    "warning",
    "Deliverables Required",
    "Please select at least one deliverable."
  );
  return;
}

if (
  form.payment_status === "Overdue" &&
  !form.payment_deadline
) {
  showAlert(
    "warning",
    "Payment Deadline Required",
    "Please select the payment deadline."
  );
  return;
}

if (
  (form.payment_status === "Paid" ||
    form.payment_status === "Partially Paid") &&
  !form.payment_received_date
) {
  showAlert(
    "warning",
    "Payment Received Date Required",
    "Please select the payment received date."
  );
  return;
}

if (
  form.payment_status === "Partially Paid" &&
  Number(form.payment_received_amount) <= 0
) {
  showAlert(
    "warning",
    "Invalid Payment Amount",
    "Please enter the amount received."
  );
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

if (
  form.payment_status === "Paid" &&
  Number(form.payment_received_amount) !== Number(form.commercials)
) {
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
let shootStatus = form.shoot_status;

if (!shootStatus || shootStatus === "Not Scheduled") {
  shootStatus =
    form.shoot_date && form.shoot_time
      ? "Scheduled"
      : "Not Scheduled";
}
    const deal = {
      ...form,
      shoot_status: shootStatus,
      currency: form.currency,
      payment_mode: form.payment_mode,
      payment_status: form.payment_status,


      // Numbers
      commercials: Number(form.commercials),
      deliverable_count: form.deliverables.reduce((total, item) => total + item.qty, 0),
      payment_received_amount:
        form.payment_received_amount === "" ? null : Number(form.payment_received_amount),

      // Dates
     // Dates
confirmation_date: form.confirmation_date,

shoot_date: emptyToNull(form.shoot_date),
shoot_time: emptyToNull(form.shoot_time),
shoot_next_check_at: emptyToNull(form.shoot_next_check_at),

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
      setIsDirty(false);
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 1600);
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
            padding: "15px 18px",
            borderBottom: "1px solid var(--line)",
            background: "linear-gradient(180deg, #fff 0%, #FAFAFD 100%)",
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

        <SectionJumpBar
          activeSection={activeSection}
          onJump={jumpToSection}
          completed={sectionCompletion}
        />
        <div
          data-section-progress
          style={{
            height: 3,
            background: "var(--line)",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${Math.max(10, ((FORM_SECTION_ORDER.findIndex((s) => s.id === activeSection) + 1) / FORM_SECTION_ORDER.length) * 100)}%`,
              background: FORM_SECTION_ORDER.find((s) => s.id === activeSection)?.accent || "var(--signal)",
              transition: "width 220ms ease, background 220ms ease",
            }}
          />
        </div>

        <form
          ref={scrollRootRef}
          onSubmit={handleSubmit}
          className="dp-scroll"
          style={{ overflowY: "auto", flex: 1, padding: "18px" }}
        >
          {/* ---------- 1. Brand Details ---------- */}
          <SectionWrap id="brand" title="Brand Details">
     <Field label="Brand Name *">
  <input
    className="dp-input"
    value={form.brand_name}
    onChange={(e) => update("brand_name", e.target.value)}
    placeholder="Enter brand name"
  />
</Field>

<Field label="POC Name">
  <input
    className="dp-input"
    value={form.poc_name}
    onChange={(e) => update("poc_name", e.target.value)}
    placeholder="Enter contact name"
  />
</Field>

      <Field label="Contact Number">
  <input
    className="dp-input"
    value={form.contact_number}
    onChange={(e) =>
      update("contact_number", e.target.value.replace(/\D/g, "").slice(0, 10))
    }
    placeholder="Enter contact number"
  />
</Field>
          </SectionWrap>

          {/* ---------- 2. Deal Details ---------- */}
          <SectionWrap id="deal" title="Deal Details">
    <Field label="Deal Title *">
  <input
    className="dp-input"
    value={form.deal_title}
    onChange={(e) => update("deal_title", e.target.value)}
    placeholder="Enter deal title"
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
          </SectionWrap>

          {/* ---------- 3. Status — moved up front on purpose ----------
              Shoot Details below is disabled for "Negotiation" /
              "Cancelled" deals, so the status needs to be set before the
              user reaches that section instead of after. This avoids the
              scroll-down-then-back-up flow. */}
          <SectionWrap id="status" title="Status">
            <Field label="Current Deal Status">
              <ChipSelect
                options={DEAL_STATUS}
                value={form.deal_status}
                onChange={(v) => update("deal_status", v)}
                colors={DEAL_STATUS_COLORS}
              />
            </Field>

            {form.deal_status === "Negotiation" && (
              <div
                style={{
                  marginTop: -6,
                  marginBottom: 14,
                  padding: "10px 12px",
                  borderRadius: 10,
                  background: "#F1F2F8",
                  color: "var(--slate)",
                  fontSize: 12.5,
                  lineHeight: 1.5,
                }}
              >
                Shoot details unlock once this deal moves past Negotiation.
              </div>
            )}
          </SectionWrap>

          {/* ---------- 4. Confirmation ---------- */}
          <SectionWrap id="confirmation" title="Confirmation">
            <Field label="Confirmation Date *">
              <DateField
                value={form.confirmation_date}
                onChange={(value) => update("confirmation_date", value)}
                placeholder="Select confirmation date"
                maxDate={new Date().toISOString().slice(0, 10)}
              />
              {form.confirmation_date && (
                <ClearFieldButton
                  label="Clear confirmation date"
                  onClear={() => update("confirmation_date", "")}
                />
              )}
            </Field>

            <Field label="Confirmation Mode">
              <ChipSelect
                options={CONFIRMATION_MODES}
                value={form.confirmation_mode}
                onChange={(v) => update("confirmation_mode", v)}
              />
            </Field>
          </SectionWrap>

          {/* ---------- 5. Content plan ---------- */}
          <SectionWrap id="content" title="Content">
            <Field label="Deliverables">
              <DeliverablesSelector
                value={form.deliverables}
                onChange={(deliverables) => update("deliverables", deliverables)}
              />
            </Field>

            <Field label="Deliverable Count">
              <input type="number" className="dp-input" value={form.deliverable_count} readOnly />
            </Field>
          </SectionWrap>

          {/* ---------- 6. Shoot Details — now unlocked, no scrolling ---------- */}
          <SectionWrap id="shoot" title="🎥 Shoot Details">
            {canEditShoot && !form.shoot_date && (
              <div
                style={{
                  marginTop: -6,
                  marginBottom: 14,
                  padding: "10px 12px",
                  borderRadius: 10,
                  background: "#FFF8E6",
                  border: "1px solid #F4D27A",
                  color: "#8A5A00",
                  fontSize: 12.5,
                  lineHeight: 1.5,
                }}
              >
                No shoot date yet, add one if you'd like a reminder before the shoot, or fill it in later once it's scheduled.
              </div>
            )}

            <Field label="Shoot Date" hint="Optional — add it when the shoot is scheduled.">
              <DateField
                value={form.shoot_date}
                disabled={!canEditShoot}
                onChange={(value) => update("shoot_date", value)}
                minDate={form.confirmation_date || undefined}
                maxDate="2099-12-31"
                placeholder={
                  form.deal_status === "Negotiation"
                    ? "Confirm the deal first"
                    : "Select shoot date"
                }
              />
              {form.shoot_date && (
                <ClearFieldButton
                  label="Clear shoot date"
                  onClear={() => update("shoot_date", "")}
                />
              )}
            </Field>

            <Field label="Shoot Time" hint="Optional">
              <TimeField
                value={form.shoot_time || ""}
                disabled={!canEditShoot}
                onChange={(value) => update("shoot_time", value)}
                placeholder={
                  form.deal_status === "Negotiation"
                    ? "Confirm the deal first"
                    : "Select shoot time"
                }
              />
              {form.shoot_time && (
                <ClearFieldButton
                  label="Clear shoot time"
                  onClear={() => update("shoot_time", "")}
                />
              )}
            </Field>

          <Field label="Shoot Location">
  <input
    className="dp-input"
    disabled={!canEditShoot}
    placeholder="Enter shoot location"
    value={form.shoot_location || ""}
    onChange={(e) => update("shoot_location", e.target.value)}
  />
</Field>

        <Field label="Shoot Notes">
  <textarea
    disabled={!canEditShoot}
    className="dp-input"
    rows={3}
    placeholder="Add shoot notes"
    value={form.shoot_notes || ""}
    onChange={(e) => update("shoot_notes", e.target.value)}
  />
</Field>
          </SectionWrap>

          {/* ---------- 7. Content timeline ---------- */}
          <SectionWrap id="timeline" title="Content Timeline">
            <Field label="Content Due Date">
              <DateField
                value={form.content_due_date}
                onChange={(value) => update("content_due_date", value)}
                placeholder="Select due date"
                minDate={form.confirmation_date}
              />
              {form.content_due_date && (
                <ClearFieldButton
                  label="Clear content due date"
                  onClear={() => update("content_due_date", "")}
                />
              )}
            </Field>

            <Field label="Content Submitted Date">
              <DateField
                value={form.content_submitted_date}
                onChange={(value) => update("content_submitted_date", value)}
                minDate={form.confirmation_date}
                maxDate={new Date().toISOString().slice(0, 10)}
              />
              {form.content_submitted_date && (
                <ClearFieldButton
                  label="Clear content submitted date"
                  onClear={() => update("content_submitted_date", "")}
                />
              )}
            </Field>

            <Field label="Posted Date">
              <DateField
                value={form.posted_date}
                onChange={(value) => update("posted_date", value)}
                minDate={form.confirmation_date}
                maxDate={new Date().toISOString().slice(0, 10)}
              />
              {form.posted_date && (
                <ClearFieldButton
                  label="Clear posted date"
                  onClear={() => update("posted_date", "")}
                />
              )}
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
          </SectionWrap>

          {/* ---------- 8. Commercials ---------- */}
          <SectionWrap id="money" title="Commercials">
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
    placeholder="Enter commercial amount"
  />
</Field>
          <Field label="Currency">
  <ChipSelect
    disabled
    options={CURRENCIES}
    value="INR"
    onChange={() => {}}
  />
</Field>

            <div
              style={{
                marginTop: -10,
                marginBottom: 14,
                padding: "10px 12px",
                borderRadius: 10,
                background: "#EFF6FF",
                border: "1px solid #BFDBFE",
                color: "#1E40AF",
                fontSize: 12.5,
                lineHeight: 1.5,
              }}
            >
              ℹ️ DealPass currently supports INR (₹) only. Other currencies aren't available yet.
            </div>

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
              {form.payment_deadline && (
                <ClearFieldButton
                  label="Clear payment deadline"
                  onClear={() => update("payment_deadline", "")}
                />
              )}
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
              {form.payment_received_date && (
                <ClearFieldButton
                  label="Clear payment received date"
                  onClear={() => update("payment_received_date", "")}
                />
              )}
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
          </SectionWrap>

          {/* ---------- 9. Invoice ---------- */}
          <SectionWrap id="invoice" title="Invoice">
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
          </SectionWrap>

          {/* ---------- 10. Notes ---------- */}
          <SectionWrap id="notes" title="Notes">
            <Field label="Enter notes if any">
              <textarea
                rows={4}
                className="dp-input"
                value={form.notes}
                onChange={(e) => update("notes", e.target.value)}
                placeholder="Any additional information..."
              />
            </Field>
          </SectionWrap>

          {/* Bottom spacer keeps the last fields clear of the floating save control. */}
          <div style={{ height: 72 }} />
        </form>

        {/* Floating save control — stays available while the form scrolls. */}
        <div
          style={{
            position: "absolute",
            right: 18,
            bottom: 18,
            zIndex: 20,
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            gap: 7,
            pointerEvents: "none",
          }}
        >
          {isDirty && !saving && !justSaved && (
            <button
              type="button"
              onClick={() => handleSubmit()}
              style={{
                pointerEvents: "auto",
                display: "flex",
                alignItems: "center",
                gap: 7,
                padding: "7px 11px",
                borderRadius: 999,
                background: "var(--surface, #fff)",
                border: "1px solid var(--line)",
                color: "var(--slate)",
                fontSize: 11.5,
                fontWeight: 700,
                boxShadow: "0 6px 18px rgba(21,24,35,.10)",
                cursor: "pointer",
              }}
            >
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: "var(--signal)",
                  boxShadow: "0 0 0 4px rgba(255,59,92,.10)",
                }}
              />
              {completionPercent}% filled
            </button>
          )}

          <button
            type="button"
            onClick={() => handleSubmit()}
            disabled={saving || (!isDirty && !justSaved)}
            title={saving ? "Saving…" : justSaved ? "Saved!" : "Save now"}
            aria-label={saving ? "Saving deal" : justSaved ? "Deal saved" : "Save deal"}
            style={{
              pointerEvents: "auto",
              minWidth: 145,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              padding: "14px 18px",
              borderRadius: 999,
              border: "none",
              background: justSaved ? "#16A34A" : "var(--signal)",
              color: "#fff",
              fontWeight: 800,
              fontSize: 14,
              cursor: saving ? "wait" : "pointer",
              opacity: (!isDirty && !justSaved) ? 0.5 : 1,
              boxShadow: justSaved
                ? "0 10px 26px rgba(22,163,74,.30)"
                : "0 10px 26px rgba(255,59,92,.30)",
              transform: saving ? "scale(.98)" : "scale(1)",
              transition: "all 160ms ease",
            }}
          >
            {justSaved ? <PartyPopper size={18} /> : <Sparkles size={18} />}
            {saving ? "Saving…" : justSaved ? "Saved!" : initial ? "Save Changes" : "Save Deal"}
            {!saving && !justSaved && <ChevronRight size={16} />}
          </button>
        </div>
      </div>
    </>
  );
}

export default DealFormSheet;