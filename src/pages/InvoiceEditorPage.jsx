import { useEffect, useState, useRef } from "react";
import QRCode from "qrcode";
import ConfirmDialog from "../components/common/ConfirmDialog";
import AlertModal from "../components/common/AlertModal";
import {
  createInvoice,
  updateInvoice,
  deleteInvoice,
} from "../services/invoiceService";
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
  PenTool,
  Trash2,
  Save,
  Type,
  Eraser,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import Field from "../components/common/Field";
import DateField from "../components/common/DateField";
import { formatDeliverableLabel } from "../components/constants/deliverables";

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

/* ---------- shared visual tokens (editor chrome) ---------- */
const INK = "#12172B";
const PAPER = "#F7F8FC";
const AMBER = "#FFB100";
const VIOLET = "#6C5CE7";
const SUCCESS = "#16A34A";
const DANGER = "#DC2626";
const SLATE = "#5B6472";

/* ---------- premium invoice document tokens ---------- */
const DOC_INK = "#0B1220";
const DOC_LINE = "#E4E6EC";
const DOC_SLATE = "#68707E";
const DOC_GOLD = "#9C6B30";
const DOC_PAPER = "#FFFFFF";

const SIGNATURE_FONTS = [
  { id: "dancing", label: "Dancing Script", family: "'Dancing Script', cursive" },
  { id: "greatvibes", label: "Great Vibes", family: "'Great Vibes', cursive" },
  { id: "sacramento", label: "Sacramento", family: "'Sacramento', cursive" },
  { id: "alexbrush", label: "Alex Brush", family: "'Alex Brush', cursive" },
  { id: "allura", label: "Allura", family: "'Allura', cursive" },
];

const GlobalStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600;700&family=Dancing+Script:wght@500;600;700&family=Great+Vibes&family=Sacramento&family=Alex+Brush&family=Allura&display=swap');

    .dp-inv-page * { box-sizing: border-box; }
    .dp-inv-page {
      font-family: 'Manrope', -apple-system, BlinkMacSystemFont, sans-serif;
    }

    /* ---------- responsive layout shell (editor only) ---------- */
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

    /* The premium document itself is intentionally NOT responsive —
       it's a fixed A4 canvas meant for print-perfect PDF export. The
       modal around it scrolls horizontally on small screens instead. */
    .dp-inv-modal-scroll { overflow-x: auto; }

    .dp-inv-payment-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      gap: 14px;
    }

    .dp-inv-btn { min-height: 44px; }
    input.dp-input, textarea.dp-input { min-height: 44px; }
    textarea.dp-input { min-height: unset; }
    .dp-inv-display {
      font-family: 'Manrope', 'Inter', sans-serif;
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
      font-family: inherit;
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
    .dp-inv-page input.dp-input.dp-input-error {
      border-color: ${DANGER} !important;
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
    .dp-inv-btn-text {
      background: transparent;
      border: none;
      color: ${SLATE};
      cursor: pointer;
      font-size: 12.5px;
      font-weight: 600;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 4px;
    }
    .dp-inv-btn-text:hover { color: ${DANGER}; }
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
    .dp-inv-btn-success {
      background: linear-gradient(135deg, ${SUCCESS}, #22C55E);
      color: #fff;
      box-shadow: 0 6px 18px rgba(22,163,74,0.35);
    }
    .dp-inv-btn-success:hover:not(:disabled) {
      box-shadow: 0 8px 24px rgba(22,163,74,0.45);
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
    .dp-inv-sig-option {
      border: 1.5px solid #E2E5EE;
      border-radius: 12px;
      padding: 14px 16px;
      cursor: pointer;
      background: #fff;
      transition: border-color .15s ease, box-shadow .15s ease;
    }
    .dp-inv-sig-option:hover { border-color: ${VIOLET}88; }
    .dp-inv-sig-option.selected {
      border-color: ${VIOLET};
      box-shadow: 0 0 0 4px rgba(108,92,231,0.12);
      background: #FAF9FF;
    }
    .dp-inv-sig-tab {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 9px 16px;
      border-radius: 10px;
      border: 1.5px solid #E2E5EE;
      background: #fff;
      color: ${SLATE};
      font-weight: 700;
      font-size: 13px;
      cursor: pointer;
      transition: all .15s ease;
    }
    .dp-inv-sig-tab.active {
      border-color: ${VIOLET};
      color: ${VIOLET};
      background: #FAF9FF;
      box-shadow: 0 0 0 4px rgba(108,92,231,0.1);
    }
    .dp-inv-sigpad-canvas {
      touch-action: none;
      display: block;
      width: 100%;
      height: 180px;
      border-radius: 12px;
      background: repeating-linear-gradient(
        to bottom,
        transparent,
        transparent 39px,
        #E2E5EE 39px,
        #E2E5EE 40px
      ), #fff;
      cursor: crosshair;
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
function SectionHeading({ index, color, icon, title, subtitle, done, optional }) {
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
          style={{ fontSize: 20, fontWeight: 700, color: INK, lineHeight: 1.2, display: "flex", alignItems: "center", gap: 8 }}
        >
          {index}. {title}
          {optional && (
            <span style={{ fontSize: 11, fontWeight: 700, color: SLATE, background: "#F1F2F8", padding: "2px 8px", borderRadius: 999, letterSpacing: 0.3 }}>
              OPTIONAL
            </span>
          )}
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

/* =====================================================================
   SignaturePad — a simple canvas the user draws on with mouse, pen, or
   finger. Emits a PNG data URL (white background) via onChange whenever
   a stroke ends, and exposes a Clear button. This is what gets persisted
   to the DB as "signature drawn" (the signature_drawn column).
   ===================================================================== */
function SignaturePad({ value, onChange }) {
  const canvasRef = useRef(null);
  const drawingRef = useRef(false);
  const lastPointRef = useRef(null);
  const hasStrokesRef = useRef(false);

  // Restore a previously drawn signature (e.g. loaded from an existing
  // invoice, or from the local draft) onto the canvas once on mount /
  // whenever the incoming value changes to something new we haven't drawn.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    if (!value) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      hasStrokesRef.current = false;
      return;
    }

    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      hasStrokesRef.current = true;
    };
    img.src = value;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function getCanvasPoint(e) {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: ((clientX - rect.left) / rect.width) * canvas.width,
      y: ((clientY - rect.top) / rect.height) * canvas.height,
    };
  }

  function startDraw(e) {
    e.preventDefault();
    drawingRef.current = true;
    lastPointRef.current = getCanvasPoint(e);
  }

  function moveDraw(e) {
    if (!drawingRef.current) return;
    e.preventDefault();

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const point = getCanvasPoint(e);
    const last = lastPointRef.current;

    ctx.strokeStyle = INK;
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(last.x, last.y);
    ctx.lineTo(point.x, point.y);
    ctx.stroke();

    lastPointRef.current = point;
    hasStrokesRef.current = true;
  }

  function endDraw() {
    if (!drawingRef.current) return;
    drawingRef.current = false;

    if (hasStrokesRef.current) {
      const canvas = canvasRef.current;
      onChange(canvas.toDataURL("image/png"));
    }
  }

  function handleClear() {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    hasStrokesRef.current = false;
    onChange("");
  }

  return (
    <div>
      <canvas
        ref={canvasRef}
        className="dp-inv-sigpad-canvas"
        width={600}
        height={180}
        onMouseDown={startDraw}
        onMouseMove={moveDraw}
        onMouseUp={endDraw}
        onMouseLeave={endDraw}
        onTouchStart={startDraw}
        onTouchMove={moveDraw}
        onTouchEnd={endDraw}
      />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
        <span style={{ fontSize: 12, color: SLATE }}>Draw using your mouse, stylus, or finger.</span>
        <button type="button" className="dp-inv-btn-text" onClick={handleClear}>
          <Eraser size={13} />
          Clear
        </button>
      </div>
    </div>
  );
}

export default function InvoiceEditorPage({
  deal,
  invoice: selectedInvoice,
  onBack,
}) {
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
  const STORAGE_KEY = selectedInvoice
  ? `invoice_${selectedInvoice.id}`
  : `invoice_draft_${deal?.id}`;
  const [billingProfile, setBillingProfile] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [attemptedPreview, setAttemptedPreview] = useState(false);
  const [attemptedSave, setAttemptedSave] = useState(false);

  // The persisted invoice this deal is bound to. `null` means nothing has
  // been saved yet — Save Invoice will INSERT. Once set, it never changes
  // for the lifetime of this invoice, and Save Invoice always UPDATEs.
  const [invoiceId, setInvoiceId] = useState(deal?.invoice_id || null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [saveError, setSaveError] = useState(null);
const [deleteInvoiceOpen, setDeleteInvoiceOpen] = useState(false);
// Fires only when an actual invoice save (create/update) succeeds — not
// on every local-draft autosave — so it doesn't pop up on every keystroke.
const [saveSuccessOpen, setSaveSuccessOpen] = useState(false);
  // `detail` (e.g. "Collab", "90 Days", "3 Stories") is carried over from
  // the deal's deliverables so it survives into the invoice and is shown
  // via formatDeliverableLabel everywhere below.
  const [lineItems, setLineItems] = useState(
    (deal?.deliverables || []).map((item) => ({
      id: item.id || crypto.randomUUID(),
      label: item.type,
      detail: item.detail || "",
      qty: Number(item.qty || 1),
      rate: Number(item.rate || 0),
    }))
  );
  const [gstEnabled, setGstEnabled] = useState(false);
  const [gstPercent, setGstPercent] = useState(18);
  const [lastSaved, setLastSaved] = useState(null);

  // Digital signature — two mutually exclusive modes:
  //   "typed": a typed name rendered in one of five script fonts
  //   "drawn": a hand-drawn signature captured from a canvas, stored as a
  //            PNG data URL in the "signature_drawn" DB column
  const [signatureMode, setSignatureMode] = useState("typed");
  const [signatureName, setSignatureName] = useState("");
  const [signatureFontId, setSignatureFontId] = useState("");
  const [signatureDrawnData, setSignatureDrawnData] = useState("");

  // If this deal already has a saved invoice, the database is the source
  // of truth and we load straight from it (ignoring any local draft).
  // Otherwise we fall back to whatever draft is sitting in localStorage.
 useEffect(() => {
  loadBillingProfile();

  if (selectedInvoice?.id) {
    loadExistingInvoice(selectedInvoice.id);
  } else if (deal?.invoice_id) {
    loadExistingInvoice(deal.invoice_id);
  } else {
    loadDraft();
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
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

  async function loadExistingInvoice(id) {
    const { data: invoiceRow, error: invoiceErr } = await supabase
      .from("invoices")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (invoiceErr) {
      console.error(invoiceErr);
      return;
    }
    if (!invoiceRow) return;

    setInvoice({
      invoiceNumber: invoiceRow.invoice_number,
      invoiceDate: invoiceRow.invoice_date,
      dueDate: invoiceRow.due_date || "",
      clientName: invoiceRow.client_name || "",
      companyName: invoiceRow.company_name || "",
      clientEmail: invoiceRow.client_email || "",
      clientPhone: invoiceRow.client_phone || "",
      billingAddress: invoiceRow.billing_address || "",
      gstNumber: invoiceRow.client_gst || "",
    });
    setGstEnabled(Boolean(invoiceRow.gst_enabled));
    setGstPercent(invoiceRow.gst_percent ?? 18);
    setSignatureMode(invoiceRow.signature_mode || (invoiceRow.signature_drawn ? "drawn" : "typed"));
    setSignatureName(invoiceRow.signature_name || "");
    setSignatureFontId(invoiceRow.signature_font || "");
    setSignatureDrawnData(invoiceRow.signature_drawn || "");
    setInvoiceId(invoiceRow.id);

    const { data: itemRows, error: itemsErr } = await supabase
      .from("invoice_items")
      .select("*")
      .eq("invoice_id", id);

    if (itemsErr) {
      console.error(itemsErr);
      return;
    }

    if (itemRows && itemRows.length) {
      setLineItems(
        itemRows.map((it) => ({
          id: it.id,
          label: it.deliverable,
          detail: it.detail || "",
          qty: Number(it.qty || 1),
          rate: Number(it.rate || 0),
        }))
      );
    }
  }

  function saveDraft() {
    const draft = {
      invoice,
      lineItems,
      gstEnabled,
      gstPercent,
      signatureMode,
      signatureName,
      signatureFontId,
      signatureDrawnData,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
    setLastSaved(new Date());
  }

  // Debounced autosave while the user is actively editing — every keystroke
  // resets a 500ms timer, so the draft is written to localStorage shortly
  // after the user pauses, without hammering storage on every character.
  // This is still just the local draft, separate from the persisted
  // invoice — Save Invoice is the only thing that writes to Supabase.
  useEffect(() => {
    const timer = setTimeout(() => {
      saveDraft();
    }, 500);

    return () => clearTimeout(timer);
  }, [invoice, lineItems, gstEnabled, gstPercent, signatureMode, signatureName, signatureFontId, signatureDrawnData]);

  // Always-current snapshot of form state, so we can flush a save
  // synchronously (e.g. on unmount) without waiting on the debounce timer.
  const draftRef = useRef();
  draftRef.current = {
    invoice,
    lineItems,
    gstEnabled,
    gstPercent,
    signatureMode,
    signatureName,
    signatureFontId,
    signatureDrawnData,
  };

  // Safety-net: flush the latest draft to localStorage whenever this
  // page unmounts, so navigating back mid-edit (or closing/reopening the
  // app) never loses pending changes that hadn't been captured by the
  // debounced autosave yet.
  useEffect(() => {
    return () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(draftRef.current));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function loadDraft() {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) return;

    try {
      const draft = JSON.parse(saved);

      if (draft.invoice) setInvoice(draft.invoice);
      if (draft.lineItems) setLineItems(draft.lineItems);
      if (draft.gstEnabled !== undefined) setGstEnabled(draft.gstEnabled);
      if (draft.gstPercent !== undefined) setGstPercent(draft.gstPercent);
      if (draft.signatureMode !== undefined) setSignatureMode(draft.signatureMode);
      if (draft.signatureName !== undefined) setSignatureName(draft.signatureName);
      if (draft.signatureFontId !== undefined) setSignatureFontId(draft.signatureFontId);
      if (draft.signatureDrawnData !== undefined) setSignatureDrawnData(draft.signatureDrawnData);
    } catch (err) {
      console.error(err);
    }
  }

  // Explicit "clear draft" — wipes the saved copy and resets the form back
  // to defaults. This only touches the local draft; it never touches a
  // persisted invoice. This is the only way old draft data goes away;
  // simply navigating back always restores the draft.
  function clearDraft() {
    localStorage.removeItem(STORAGE_KEY);
    setInvoice({
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
    setLineItems(
      (deal?.deliverables || []).map((item) => ({
        id: item.id || crypto.randomUUID(),
        label: item.type,
        detail: item.detail || "",
        qty: Number(item.qty || 1),
        rate: Number(item.rate || 0),
      }))
    );
    setGstEnabled(false);
    setGstPercent(18);
    setSignatureMode("typed");
    setSignatureName("");
    setSignatureFontId("");
    setSignatureDrawnData("");
  }

  const update = (field, value) => {
    setInvoice((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const subtotal = Number(deal?.commercials || 0);
  const calculatedSubtotal = lineItems.reduce(
    (sum, item) => sum + item.qty * item.rate,
    0
  );
  const amountMismatch = calculatedSubtotal !== subtotal;
  const gst = gstEnabled ? (subtotal * gstPercent) / 100 : 0;
  const total = subtotal + gst;

  // Only Client Name is mandatory — every other client detail is optional
  // and simply won't render on the invoice if left blank.
  const clientNameMissing = !invoice.clientName.trim();
  const canPreview = !amountMismatch && !clientNameMissing;
  const canSave = !amountMismatch && !clientNameMissing;

  const signatureProvided =
    (signatureMode === "typed" && Boolean(signatureName.trim() && signatureFontId)) ||
    (signatureMode === "drawn" && Boolean(signatureDrawnData));

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
      done: Boolean(invoice.clientName.trim()),
    },
    {
      label: "Deliverables",
      done: lineItems.length > 0 && !amountMismatch,
    },
  ];
  const completedCount = steps.filter((s) => s.done).length;
  const progressPct = Math.round((completedCount / steps.length) * 100);
  // Labels of whatever's still incomplete, used to drive the pending-items
  // bar pinned above the Save button (kept in sync with the sidebar rail).
  const missingStepLabels = steps.filter((s) => !s.done).map((s) => s.label);

  // Flush the latest draft immediately (bypassing the debounce) and then
  // hand control back to the caller. Used by the Back button so quick
  // navigation never races the 500ms autosave timer.
  const handleBack = () => {
    saveDraft();
    onBack();
  };

  const handlePreviewClick = () => {
    setAttemptedPreview(true);
    if (canPreview) setShowPreview(true);
  };

  // Save Invoice: create on first save, update on every save after that.
  // The invoice number is only ever assigned inside createInvoice — this
  // function never generates or overwrites it. On every successful save
  // (create or update) the deals.invoice_number column is kept in sync
  // with whatever invoice number actually ended up persisted, so the
  // deals table never shows a stale/incorrect invoice number.
  async function handleSaveInvoice() {
    setAttemptedSave(true);
    setSaveError(null);
    if (!canSave) return;

    setSaving(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setSaveError("Please login again.");
        return;
      }

      const invoicePayload = {
        deal_id: deal.id,

        invoice_date: invoice.invoiceDate,
        due_date: invoice.dueDate || null,

        client_name: invoice.clientName,
        company_name: invoice.companyName,
        client_email: invoice.clientEmail,
        client_phone: invoice.clientPhone,
        billing_address: invoice.billingAddress,
        client_gst: invoice.gstNumber,

        subtotal,
        gst_enabled: gstEnabled,
        gst_percent: gstPercent,
        gst_amount: gst,
        total,

        signature_mode: signatureMode,
        // Only persist the fields relevant to the active mode, so switching
        // modes doesn't leave stale data from the other mode in the DB.
        signature_name: signatureMode === "typed" ? signatureName : "",
        signature_font: signatureMode === "typed" ? (signatureFontId || null) : null,
        signature_drawn: signatureMode === "drawn" ? (signatureDrawnData || null) : null,
      };

      if (!invoiceId) {
        // First save for this deal — create it, and remember it on the deal.
        const created = await createInvoice(user.id, invoicePayload, lineItems);

        // Keep the deals table's invoice_id AND invoice_number in sync with
        // whatever was actually persisted (createInvoice is the only place
        // the invoice number is assigned, so this is the corrected value).
        const { error: dealError } = await supabase
          .from("deals")
          .update({
            invoice_id: created.id,
            invoice_number: created.invoice_number,
          })
          .eq("id", deal.id);

        if (dealError) throw dealError;

        if (deal) {
          deal.invoice_id = created.id;
          deal.invoice_number = created.invoice_number;
        }

        setInvoiceId(created.id);
        // The invoice number is now fixed — reflect it in the form, but
        // never regenerate it again.
        setInvoice((prev) => ({ ...prev, invoiceNumber: created.invoice_number }));
      } else {
        // Already has an invoice — update in place, same invoice number.
        await updateInvoice(invoiceId, invoicePayload, lineItems);

        // The invoice number itself is locked and never changes after
        // creation, but make sure the deals row reflects it too (covers
        // cases where the deal's invoice_number was missing/out of date).
        const { error: dealSyncError } = await supabase
          .from("deals")
          .update({ invoice_number: invoice.invoiceNumber })
          .eq("id", deal.id);

        if (dealSyncError) throw dealSyncError;

        if (deal) deal.invoice_number = invoice.invoiceNumber;
      }

      setLastSaved(new Date());

      // Real invoice save succeeded — surface the success alert and let it
      // auto-dismiss, mirroring the "Saved!" confirmation on the deal form.
      setSaveSuccessOpen(true);
      setTimeout(() => setSaveSuccessOpen(false), 2500);
    } catch (err) {
      console.error(err);
      setSaveError("Failed to save invoice. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  // Delete Invoice: removes the invoice + its items, clears the deal's
  // reference (both invoice_id and invoice_number), and does NOT touch
  // profiles.next_invoice_number, so the number this invoice used is
  // never reused for anything else.
  async function handleDeleteInvoice() {
    if (!invoiceId) return;
    setDeleting(true);
    setSaveError(null);
    try {
      await deleteInvoice(invoiceId);

      const { error: dealError } = await supabase
        .from("deals")
        .update({ invoice_id: null, invoice_number: null })
        .eq("id", deal.id);

      if (dealError) throw dealError;

      if (deal) {
        deal.invoice_id = null;
        deal.invoice_number = null;
      }

      setInvoiceId(null);
      setDeleteInvoiceOpen(false);
      setInvoice((prev) => ({ ...prev, invoiceNumber: defaultInvoiceNumber }));
    } catch (err) {
      setDeleteInvoiceOpen(false);
      console.error(err);
      setSaveError("Failed to delete invoice. Please try again.");
    } finally {
      setDeleting(false);
    }
  }

  const selectedSignatureFont = SIGNATURE_FONTS.find((f) => f.id === signatureFontId);

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
        <button className="dp-inv-btn dp-inv-btn-ghost" onClick={handleBack}>
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
         
          <button className="dp-inv-btn dp-inv-btn-primary" onClick={handlePreviewClick}>
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
              Fix deliverable totals to unlock preview and saving.
            </div>
          )}

          {clientNameMissing && !amountMismatch && (
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
              Add a client name to unlock preview and saving.
            </div>
          )}

          {saveError && (
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
              {saveError}
            </div>
          )}

          {invoiceId && (
            <div
              style={{
                marginTop: 18,
                padding: "10px 12px",
                borderRadius: 10,
                background: "#F0FDF4",
                border: "1px solid #BBF7D0",
                color: "#166534",
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              Saved as <span className="dp-inv-mono">{invoice.invoiceNumber}</span>
            </div>
          )}

          <button
            className="dp-inv-btn-text"
            style={{ marginTop: 16 }}
            onClick={clearDraft}
          >
            <Trash2 size={13} />
            Clear saved draft
          </button>

          {invoiceId && (
            <button
              className="dp-inv-btn-text"
              style={{ marginTop: 4 }}
             onClick={() => setDeleteInvoiceOpen(true)}
              disabled={deleting}
            >
              <Trash2 size={13} />
              {deleting ? "Deleting invoice..." : "Delete invoice"}
            </button>
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
               <span data-invoice-number>
  {invoice.invoiceNumber}
</span>
              </div>
            </div>
          </div>

          {/* Section 1: Invoice Details */}
          <SectionHeading
            index={1}
            color={VIOLET}
            icon={<FileText size={17} color={VIOLET} />}
            title="Invoice Details"
            subtitle="The basics - number, and when it's due."
            done={steps[0].done}
          />

          <Field label="Invoice Number">
            <input
              className="dp-input dp-inv-mono"
              value={invoice.invoiceNumber}
              // Once an invoice has been saved, its number is permanent —
              // lock the field so it can never be edited away from what
              // createInvoice() assigned.
              readOnly={Boolean(invoiceId)}
              onChange={(e) => {
                if (invoiceId) return;
                update("invoiceNumber", e.target.value);
              }}
            />
          </Field>
          {invoiceId && (
            <div style={{ fontSize: 12, color: SLATE, marginTop: -10, marginBottom: 14 }}>
              Locked — invoice numbers never change once saved.
            </div>
          )}

          <Field label="Invoice Date">
            <DateField
              value={invoice.invoiceDate}
              onChange={(value) => update("invoiceDate", value)}
            />
          </Field>

          <Field label="Due Date (optional)">
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
            <input className="dp-input dp-inv-mono" value={billingProfile?.phone || ""} readOnly />
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
            <input className="dp-input dp-inv-mono" readOnly value={billingProfile?.account_number || ""} />
          </Field>

          <Field label="IFSC Code">
            <input className="dp-input dp-inv-mono" readOnly value={billingProfile?.ifsc || ""} />
          </Field>

          <Field label="UPI ID">
            <input className="dp-input dp-inv-mono" readOnly value={billingProfile?.upi_id || ""} />
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
            subtitle="Who's paying this invoice? Client name is required. All other details are optional."
            done={steps[3].done}
          />

          <Field label="Client Name">
            <input
              className={`dp-input ${(attemptedPreview || attemptedSave) && clientNameMissing ? "dp-input-error" : ""}`}
              value={invoice.clientName}
              onChange={(e) => update("clientName", e.target.value)}
            />
          </Field>
          {(attemptedPreview || attemptedSave) && clientNameMissing && (
            <div style={{ fontSize: 12, color: DANGER, fontWeight: 600, marginTop: -10, marginBottom: 14 }}>
              Client name is required.
            </div>
          )}

          <Field label="Company Name (optional)">
            <input
              className="dp-input"
              value={invoice.companyName}
              onChange={(e) => update("companyName", e.target.value)}
            />
          </Field>

          <Field label="Email (optional)">
            <input
              type="email"
              className="dp-input"
              value={invoice.clientEmail}
              onChange={(e) => update("clientEmail", e.target.value)}
            />
          </Field>

          <Field label="Phone (optional)">
            <input
              className="dp-input dp-inv-mono"
              value={invoice.clientPhone}
              onChange={(e) =>
                update("clientPhone", e.target.value.replace(/\D/g, "").slice(0, 10))
              }
            />
          </Field>

          <Field label="Billing Address (optional)">
            <textarea
              rows={4}
              className="dp-input"
              value={invoice.billingAddress}
              onChange={(e) => update("billingAddress", e.target.value)}
              placeholder="Flat / Office No., Street, City, State, Pincode"
            />
          </Field>

          <Field label="GST Number (optional)">
            <input
              className="dp-input dp-inv-mono"
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
            subtitle="Split the total deal amount across your deliverables however you want."
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
                  <span className="dp-inv-mono" style={{ color: SLATE }}>{index + 1}</span>
                  {/* formatDeliverableLabel is the single source of truth
                      for label + detail formatting — keeps this table,
                      the PDF, and every other surface in sync. Qty is
                      excluded here since this table has its own Qty column. */}
                  <span style={{ fontWeight: 600, color: INK, overflowWrap: "anywhere" }}>
                    {formatDeliverableLabel(item, { includeQty: false })}
                  </span>
                  <span className="dp-inv-mono" style={{ textAlign: "center", color: SLATE }}>{item.qty}</span>
                  <input
                    className="dp-input dp-inv-mono"
                    type="number"
                    // Show an empty field instead of "0" so typing doesn't
                    // insert digits next to a leading zero (e.g. "01000").
                    value={item.rate === 0 ? "" : item.rate}
                    placeholder="0"
                    style={{ padding: "7px 6px", fontSize: "inherit", width: "100%" }}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => {
                      const raw = e.target.value;
                      const value = raw === "" ? 0 : Number(raw);
                      setLineItems((prev) =>
                        prev.map((li) =>
                          li.id === item.id ? { ...li, rate: value } : li
                        )
                      );
                    }}
                  />
                  <span className="dp-inv-mono" style={{ textAlign: "right", fontWeight: 700, color: INK }}>
                    {item.rate === 0 ? "Included" : formatAmount(item.qty * item.rate)}
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
                  Commercial Amount: <strong className="dp-inv-mono">{formatAmount(subtotal)}</strong>
                  <br />
                  Current Total: <strong className="dp-inv-mono">{formatAmount(calculatedSubtotal)}</strong>
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
                  className="dp-input dp-inv-mono"
                  type="number"
                  value={gstPercent}
                  onChange={(e) => setGstPercent(Number(e.target.value))}
                  style={{ width: 70, padding: "8px 10px", textAlign: "center" }}
                />
                <span style={{ fontSize: 14, color: SLATE, fontWeight: 600 }}>%</span>
              </div>
            )}
          </div>

          {/* Section 6: Digital Signature */}
          <SectionHeading
            index={6}
            color={VIOLET}
            icon={<PenTool size={17} color={VIOLET} />}
            title="Digital Signature"
            subtitle="Type your name or draw it by hand and it'll appear on the invoice."
            done={signatureProvided}
            optional
          />

          <div style={{ display: "flex", gap: 10, marginBottom: 18 }}>
            <button
              type="button"
              className={`dp-inv-sig-tab ${signatureMode === "typed" ? "active" : ""}`}
              onClick={() => setSignatureMode("typed")}
            >
              <Type size={14} />
              Type
            </button>
            <button
              type="button"
              className={`dp-inv-sig-tab ${signatureMode === "drawn" ? "active" : ""}`}
              onClick={() => setSignatureMode("drawn")}
            >
              <PenTool size={14} />
              Draw
            </button>
          </div>

          {signatureMode === "typed" ? (
            <>
              <Field label="Add Signature">
                <input
                  className="dp-input"
                  value={signatureName}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSignatureName(value);
                    // Auto-select the first style the moment a name is typed,
                    // so a preview shows up immediately; the user can still
                    // switch styles afterward.
                    if (value.trim() && !signatureFontId) {
                      setSignatureFontId(SIGNATURE_FONTS[0].id);
                    }
                    if (!value.trim()) {
                      setSignatureFontId("");
                    }
                  }}
                  placeholder="Enter your name"
                />
              </Field>

              {signatureName.trim() && (
                <div
                  className="dp-inv-fade"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
                    gap: 12,
                    marginBottom: 22,
                  }}
                >
                  {SIGNATURE_FONTS.map((font) => (
                    <div
                      key={font.id}
                      className={`dp-inv-sig-option ${signatureFontId === font.id ? "selected" : ""}`}
                      onClick={() => setSignatureFontId(font.id)}
                    >
                      <div
                        style={{
                          fontFamily: font.family,
                          fontSize: 28,
                          color: INK,
                          lineHeight: 1.3,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {signatureName}
                      </div>
                      <div style={{ fontSize: 11, color: SLATE, marginTop: 6, fontWeight: 600 }}>
                        {font.label}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div
              className="dp-inv-fade"
              style={{
                border: "1px solid #E7E9F3",
                borderRadius: 14,
                padding: 16,
                marginBottom: 22,
                background: "#FAFAFE",
              }}
            >
              <SignaturePad value={signatureDrawnData} onChange={setSignatureDrawnData} />
            </div>
          )}

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
                <strong className="dp-inv-mono" style={{ color: INK }}>{formatAmount(subtotal)}</strong>
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
                <span className="dp-inv-mono">{formatAmount(gst)}</span>
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
                <span className="dp-inv-mono">{formatAmount(total)}</span>
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
          <div
  style={{
    position: "sticky",
    bottom: 0,
    background: "#fff",
    borderTop: "1px solid #E7E9F3",
    padding: "18px 0",
    marginTop: 28,
    zIndex: 100,
  }}
>
  {/* Pending-items bar — pinned right above the Save button so it's
      always visible, even on mobile where the sidebar rail isn't sticky
      and can scroll out of view. Mirrors the sidebar's progress but
      spells out exactly what's still missing. */}
  <div style={{ marginBottom: 12 }}>
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 10,
        marginBottom: 6,
        fontSize: 12.5,
        fontWeight: 700,
        color: missingStepLabels.length ? DANGER : SUCCESS,
      }}
    >
      <span style={{ overflowWrap: "anywhere" }}>
        {missingStepLabels.length
          ? `Missing: ${missingStepLabels.join(", ")}`
          : "All sections complete"}
      </span>
      <span style={{ flexShrink: 0 }}>{progressPct}%</span>
    </div>
    <div
      style={{
        height: 6,
        borderRadius: 999,
        background: "#EEF0F8",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          height: "100%",
          width: `${progressPct}%`,
          borderRadius: 999,
          background: missingStepLabels.length
            ? `linear-gradient(90deg, ${VIOLET}, ${AMBER})`
            : SUCCESS,
          transition: "width .4s ease, background .3s ease",
        }}
      />
    </div>
  </div>

  <button
    className="dp-inv-btn dp-inv-btn-primary"
    style={{
      width: "100%",
      height: 52,
      fontSize: 16,
      fontWeight: 700,
    }}
    onClick={handleSaveInvoice}
    disabled={saving}
  >
    <Save size={18} />

    {saving
      ? "Saving Invoice..."
      : invoiceId
      ? "Update Invoice"
      : "Save Invoice"}
  </button>
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
          signatureMode={signatureMode}
          signatureName={signatureName}
          signatureFont={selectedSignatureFont}
          signatureDrawnData={signatureDrawnData}
          onClose={() => setShowPreview(false)}
        />
      )}
      {deleteInvoiceOpen && (
  <ConfirmDialog
    title="Delete Invoice?"
    message={`Are you sure you want to delete invoice ${invoice.invoiceNumber}?

This action cannot be undone.`}
    confirmText="Delete"
    cancelText="Cancel"
    danger
    onConfirm={handleDeleteInvoice}
    onCancel={() => setDeleteInvoiceOpen(false)}
  />
)}
      {saveSuccessOpen && (
        <AlertModal
          type="success"
          title="Invoice Saved"
          message={`Invoice ${invoice.invoiceNumber} has been saved successfully.`}
          onClose={() => setSaveSuccessOpen(false)}
        />
      )}
    </div>
  );
}

/* =====================================================================
   Premium invoice document — a brand-new, print-perfect layout used only
   for the preview/PDF. Fixed 794px width (desktop-only, no responsive
   breakpoints), auto-growing height. The exported PDF page is sized to
   match the rendered content exactly, so everything is always visible —
   nothing is cropped and it's still a single page, because the page IS
   the content's height. Font sizing still tightens gradually as line
   items grow, purely to keep dense invoices tidy rather than huge.
   ===================================================================== */
function PremiumInvoiceDocument({
  invoice,
  billingProfile,
  lineItems,
  subtotal,
  gst,
  gstEnabled,
  gstPercent,
  total,
  qrImage,
  signatureMode,
  signatureName,
  signatureFont,
  signatureDrawnData,
  docRef,
}) {
  // Density scale: as more line items are added, text and spacing shrink
  // step-wise so the fixed-height A4 canvas below never overflows.
  const itemCount = lineItems.length;
  const scale =
    itemCount <= 6 ? 1 : itemCount <= 10 ? 0.9 : itemCount <= 14 ? 0.82 : 0.72;

  const fs = (px) => `${(px * scale).toFixed(1)}px`;
  const sp = (px) => `${Math.max(px * scale, px * 0.6).toFixed(1)}px`;

  const from = {
    name: billingProfile?.full_name,
    address: billingProfile?.address,
    phone: billingProfile?.phone,
    email: billingProfile?.email,
    pan: billingProfile?.pan_number,
    gst: billingProfile?.gst_number,
  };

  const billTo = {
    name: invoice.companyName || invoice.clientName,
    attn: invoice.companyName && invoice.clientName ? invoice.clientName : "",
    address: invoice.billingAddress,
    email: invoice.clientEmail,
    phone: invoice.clientPhone,
    gst: invoice.gstNumber,
  };

  const hasSignature =
    (signatureMode === "typed" && signatureName && signatureFont) ||
    (signatureMode === "drawn" && signatureDrawnData);

  return (
    <div
      ref={docRef}
      className="dp-inv-premium"
      style={{
        width: "794px",
        position: "relative",
        background: DOC_PAPER,
        color: DOC_INK,
        fontFamily: "'Inter', -apple-system, sans-serif",
        padding: "52px 60px",
      }}
    >
      
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          borderBottom: `2px solid ${DOC_GOLD}`,
          paddingBottom: sp(22),
        }}
      >
        <div>
          <div
            style={{
              fontFamily: "'Fraunces', serif",
              fontWeight: 600,
              fontSize: fs(34),
              letterSpacing: 1.2,
              textTransform: "uppercase",
              color: DOC_INK,
            }}
          >
            Invoice
          </div>
        </div>

        <div style={{ textAlign: "right" }}>
          <div
            style={{
              fontSize: fs(10.5),
              color: DOC_SLATE,
              letterSpacing: 2,
              textTransform: "uppercase",
              fontWeight: 700,
            }}
          >
            Invoice No.
          </div>
          <div
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: fs(19),
              fontWeight: 700,
              color: DOC_INK,
              marginTop: 2,
            }}
          >
            <span data-invoice-number>
  {invoice.invoiceNumber}
</span>
          </div>
          <div style={{ fontSize: fs(11.5), color: DOC_SLATE, marginTop: 6 }}>
            Issued {formatDisplayDate(invoice.invoiceDate)}
          </div>
          {invoice.dueDate && (
            <div style={{ fontSize: fs(11.5), color: DOC_SLATE }}>
              Due {formatDisplayDate(invoice.dueDate)}
            </div>
          )}
        </div>
      </div>

      {/* From / Bill To */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 48,
          marginTop: sp(28),
        }}
      >
        <div>
          <div
            style={{
              fontSize: fs(10.5),
              fontWeight: 700,
              letterSpacing: 1.6,
              color: DOC_GOLD,
              textTransform: "uppercase",
              marginBottom: 8,
            }}
          >
            Billed By
          </div>
          {from.name && (
            <div style={{ fontSize: fs(14.5), fontWeight: 700, color: DOC_INK }}>{from.name}</div>
          )}
          {from.address && (
            <div style={{ fontSize: fs(12), color: DOC_SLATE, marginTop: 4, whiteSpace: "pre-line" }}>
              {from.address}
            </div>
          )}
          {from.phone && (
            <div style={{ fontSize: fs(12), color: DOC_SLATE, marginTop: 4 }}>
              <span className="dp-inv-mono">{from.phone}</span>
            </div>
          )}
          {from.email && <div style={{ fontSize: fs(12), color: DOC_SLATE, marginTop: 2 }}>{from.email}</div>}
          {from.pan && (
            <div style={{ fontSize: fs(12), color: DOC_SLATE, marginTop: 2 }}>
              PAN <span style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{from.pan}</span>
            </div>
          )}
          {from.gst && (
            <div style={{ fontSize: fs(12), color: DOC_SLATE, marginTop: 2 }}>
              GSTIN <span style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{from.gst}</span>
            </div>
          )}
        </div>

        <div>
          <div
            style={{
              fontSize: fs(10.5),
              fontWeight: 700,
              letterSpacing: 1.6,
              color: DOC_GOLD,
              textTransform: "uppercase",
              marginBottom: 8,
            }}
          >
            Billed To
          </div>
          <div style={{ fontSize: fs(14.5), fontWeight: 700, color: DOC_INK }}>{billTo.name}</div>
          {billTo.attn && (
            <div style={{ fontSize: fs(12), color: DOC_SLATE, marginTop: 3 }}>Attn: {billTo.attn}</div>
          )}
          {billTo.address && (
            <div style={{ fontSize: fs(12), color: DOC_SLATE, marginTop: 4, whiteSpace: "pre-line" }}>
              {billTo.address}
            </div>
          )}
          {billTo.email && <div style={{ fontSize: fs(12), color: DOC_SLATE, marginTop: 4 }}>{billTo.email}</div>}
          {billTo.phone && (
            <div style={{ fontSize: fs(12), color: DOC_SLATE, marginTop: 2 }}>
              <span style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{billTo.phone}</span>
            </div>
          )}
          {billTo.gst && (
            <div style={{ fontSize: fs(12), color: DOC_SLATE, marginTop: 2 }}>
              GSTIN <span style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{billTo.gst}</span>
            </div>
          )}
        </div>
      </div>

      {/* Line items */}
      <div style={{ marginTop: sp(32) }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 60px 110px 120px",
            gap: 8,
            paddingBottom: sp(9),
            borderBottom: `1.5px solid ${DOC_INK}`,
            fontSize: fs(10.5),
            fontWeight: 700,
            letterSpacing: 1,
            textTransform: "uppercase",
            color: DOC_SLATE,
          }}
        >
          <span>Description</span>
          <span style={{ textAlign: "center" }}>Qty</span>
          <span style={{ textAlign: "right" }}>Rate</span>
          <span style={{ textAlign: "right" }}>Amount</span>
        </div>

        {lineItems.length === 0 ? (
          <div style={{ padding: `${sp(14)} 0`, color: DOC_SLATE, fontSize: fs(12.5) }}>
            No deliverables added.
          </div>
        ) : (
          lineItems.map((item) => (
            <div
              key={item.id}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 60px 110px 120px",
                gap: 8,
                padding: `${sp(11)} 0`,
                borderBottom: `1px solid ${DOC_LINE}`,
                fontSize: fs(12.5),
                alignItems: "center",
              }}
            >
              {/* Same formatter as the editable table above — the PDF/
                  preview always matches exactly what the deal configured,
                  e.g. "Ad Usage Rights (90 Days)". */}
              <span style={{ color: DOC_INK, fontWeight: 500, overflowWrap: "anywhere" }}>
                {formatDeliverableLabel(item, { includeQty: false })}
              </span>
              <span style={{ textAlign: "center", color: DOC_SLATE, fontFamily: "'IBM Plex Mono', monospace" }}>
                {item.qty}
              </span>
              <span style={{ textAlign: "right", color: DOC_SLATE, fontFamily: "'IBM Plex Mono', monospace" }}>
                {item.rate === 0 ? "Included" : formatAmount(item.rate)}
              </span>
              <span style={{ textAlign: "right", color: DOC_INK, fontWeight: 700, fontFamily: "'IBM Plex Mono', monospace" }}>
                {item.rate === 0 ? "Included" : formatAmount(item.qty * item.rate)}
              </span>
            </div>
          ))
        )}
      </div>

      {/* Totals */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: sp(18) }}>
        <div style={{ width: 280 }}>
          <div style={{ display: "flex", justifyContent: "space-between", padding: `${sp(6)} 0`, fontSize: fs(12.5), color: DOC_SLATE }}>
            <span>Subtotal</span>
            <span style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{formatAmount(subtotal)}</span>
          </div>
          {gstEnabled && (
            <div style={{ display: "flex", justifyContent: "space-between", padding: `${sp(6)} 0`, fontSize: fs(12.5), color: DOC_SLATE }}>
              <span>GST ({gstPercent}%)</span>
              <span style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{formatAmount(gst)}</span>
            </div>
          )}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: sp(8),
              paddingTop: sp(12),
              borderTop: `2px solid ${DOC_GOLD}`,
              fontSize: fs(19),
              fontWeight: 700,
              color: DOC_INK,
            }}
          >
            <span style={{ fontFamily: "'Fraunces', serif" }}>Total</span>
            <span style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{formatAmount(total)}</span>
          </div>
        </div>
      </div>

      {/* Payment + Signature */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 40,
          marginTop: sp(34),
          paddingTop: sp(20),
          borderTop: `1px solid ${DOC_LINE}`,
        }}
      >
        <div>
          <div style={{ fontSize: fs(10.5), fontWeight: 700, letterSpacing: 1.6, color: DOC_GOLD, textTransform: "uppercase", marginBottom: 8 }}>
            Payment Details
          </div>
          {billingProfile?.bank_name && (
            <div style={{ fontSize: fs(12), color: DOC_SLATE, marginBottom: 3 }}>Bank: {billingProfile.bank_name}</div>
          )}
          {billingProfile?.account_number && (
            <div style={{ fontSize: fs(12), color: DOC_SLATE, marginBottom: 3 }}>
              A/C: <span style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{billingProfile.account_number}</span>
            </div>
          )}
          {billingProfile?.ifsc && (
            <div style={{ fontSize: fs(12), color: DOC_SLATE, marginBottom: 3 }}>
              IFSC: <span style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{billingProfile.ifsc}</span>
            </div>
          )}
          {billingProfile?.upi_id && (
            <div style={{ fontSize: fs(12), color: DOC_SLATE }}>
              UPI: <span style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{billingProfile.upi_id}</span>
            </div>
          )}

          {qrImage && (
            <div style={{ marginTop: 14 }}>
              <img
                src={qrImage}
                alt="UPI QR"
                style={{
                  width: 84,
                  height: 84,
                  border: `1px solid ${DOC_LINE}`,
                  borderRadius: 6,
                  padding: 4,
                  background: "#fff",
                }}
              />
              <div style={{ fontSize: fs(10), color: DOC_SLATE, marginTop: 5, opacity: 0.85 }}>
                Scan using any UPI app to pay
              </div>
            </div>
          )}
        </div>

        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: fs(10.5), fontWeight: 700, letterSpacing: 1.6, color: DOC_GOLD, textTransform: "uppercase", marginBottom: 8 }}>
            Authorized Signature
          </div>
          {hasSignature ? (
            signatureMode === "drawn" ? (
              <div style={{ marginTop: 6, display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                <img
                  src={signatureDrawnData}
                  alt="Signature"
                  style={{ maxWidth: 220, maxHeight: 80, objectFit: "contain" }}
                />
                <div
                  style={{
                    borderTop: `1px solid ${DOC_INK}`,
                    marginTop: 4,
                    paddingTop: 4,
                    width: 220,
                    textAlign: "right",
                    fontSize: fs(11),
                    color: DOC_SLATE,
                  }}
                >
                  Signed
                </div>
              </div>
            ) : (
              <div style={{ marginTop: 6 }}>
                <div
                  style={{
                    fontFamily: signatureFont.family,
                    fontSize: fs(32),
                    color: DOC_INK,
                  }}
                >
                  {signatureName}
                </div>
                <div
                  style={{
                    borderTop: `1px solid ${DOC_INK}`,
                    marginTop: 4,
                    paddingTop: 4,
                    fontSize: fs(11),
                    color: DOC_SLATE,
                  }}
                >
                  {signatureName}
                </div>
              </div>
            )
          ) : (
            <div
              style={{
                marginTop: 24,
                borderTop: `1px solid ${DOC_LINE}`,
                paddingTop: 4,
                fontSize: fs(11),
                color: DOC_SLATE,
              }}
            >
              Signature not provided
            </div>
          )}
        </div>
      </div>
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
  signatureMode,
  signatureName,
  signatureFont,
  signatureDrawnData,
  onClose,
}) {
  const invoiceRef = useRef(null);
  const [qrImage, setQrImage] = useState("");

  // QR is (re)generated any time the UPI ID on the billing profile or the
  // payable total changes, so it always encodes the current amount.
  useEffect(() => {
    async function generateQR() {
      if (!billingProfile?.upi_id) {
        setQrImage("");
        return;
      }

      const upiLink =
        `upi://pay?pa=${billingProfile.upi_id}` +
        `&pn=${encodeURIComponent(billingProfile.full_name || "Recipient")}` +
        `&am=${total}` +
        `&cu=INR` +
        `&tn=${encodeURIComponent(invoice.invoiceNumber)}`;

      try {
        const qr = await QRCode.toDataURL(upiLink);
        setQrImage(qr);
      } catch (err) {
        console.error(err);
      }
    }

    generateQR();
  }, [billingProfile, total]);

  // Renders the invoice through the browser's own print pipeline instead of
  // rasterizing it with html2canvas. Printing hands the exact same markup
  // to the browser's layout + pagination engine that's already rendering
  // it correctly on screen, so nothing gets lost.
  //
  // This function is PDF export only — it has no database logic at all.
  // It never creates, updates, or reads any invoice row; it only prints
  // whatever is currently in the form. Saving/updating an invoice is
  // handled entirely by the "Save Invoice" button on the editor page.
  const downloadPDF = () => {
    const element = invoiceRef.current;
    if (!element) {
      alert("Invoice not found.");
      return;
    }

    // Used as the document <title> inside the print iframe — browsers use
    // this as the suggested filename when saving the print output as a PDF.
    const brandSlug = (deal?.brand_name || "invoice")
      .trim()
      .replace(/[^a-zA-Z0-9]+/g, "_");
    const fileTitle = `invoice_${brandSlug}`;

    const frame = document.createElement("iframe");
    frame.style.cssText =
      "position:fixed; right:0; bottom:0; width:0; height:0; border:0; visibility:hidden;";
    document.body.appendChild(frame);

    const frameDoc = frame.contentWindow.document;
    frameDoc.open();
    frameDoc.write(`<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>${fileTitle}</title>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600;700&family=Dancing+Script:wght@500;600;700&family=Great+Vibes&family=Sacramento&family=Alex+Brush&family=Allura&display=swap');
      * { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
      html, body { margin: 0; padding: 0; background: #fff; }
      @page { size: A4; margin: 0; }
    </style>
  </head>
  <body>${element.outerHTML}</body>
</html>`);
    frameDoc.close();

    const triggerPrint = () => {
      frame.contentWindow.focus();
      frame.contentWindow.print();
    };

    // Clean up once the print dialog closes (works for both "Save as PDF"
    // and cancel).
    frame.contentWindow.onafterprint = () => {
      if (frame.parentNode) document.body.removeChild(frame);
    };

    // Give web fonts (signature scripts, Fraunces, IBM Plex Mono) a moment
    // to finish loading inside the iframe before printing, so the export
    // doesn't fall back to system fonts.
    if (frameDoc.fonts && frameDoc.fonts.ready) {
      frameDoc.fonts.ready.then(() => setTimeout(triggerPrint, 250));
    } else {
      setTimeout(triggerPrint, 600);
    }
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
          overflowX: "auto",
          padding: "24px 12px",
        }}
      >
        <div
          className="dp-inv-fade"
          style={{
            width: "fit-content",
            flexShrink: 0,
            background: "#fff",
            borderRadius: 18,
            boxShadow: "0 30px 80px rgba(0,0,0,.35)",
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
              borderTopLeftRadius: 18,
              borderTopRightRadius: 18,
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

          <div
            style={{
              padding: "8px 24px",
              background: "#FFF8E8",
              borderBottom: "1px solid #F0E4C4",
              fontSize: 12,
              color: "#8A5A00",
              textAlign: "center",
            }}
          >
           💡 <strong>Download PDF</strong> opens your device's print screen. On <strong>Android</strong>, select <strong>Save as PDF</strong>. On <strong>iPhone</strong>, tap <strong>Share → Save to Files</strong>. Rename the file if needed before saving.
          </div>

          <div
            className="dp-inv-modal-scroll"
            style={{
              padding: 24,
              background: "#EFF1F9",
              borderBottomLeftRadius: 18,
              borderBottomRightRadius: 18,
            }}
          >
            <PremiumInvoiceDocument
              invoice={invoice}
              billingProfile={billingProfile}
              lineItems={lineItems}
              subtotal={subtotal}
              gst={gst}
              gstEnabled={gstEnabled}
              gstPercent={gstPercent}
              total={total}
              qrImage={qrImage}
              signatureMode={signatureMode}
              signatureName={signatureName}
              signatureFont={signatureFont}
              signatureDrawnData={signatureDrawnData}
              docRef={invoiceRef}
            />
          </div>
        </div>
      </div>
    </>
  );
}