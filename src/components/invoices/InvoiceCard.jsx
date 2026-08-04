import { Calendar, User2, ArrowUpRight } from "lucide-react";

// Status badge styling keyed off the deal's actual payment_status
// (Pending / Partially Paid / Paid / Overdue / Barter) — the same values
// used in DealFormSheet's Payment Status chip select. This is the single
// source of truth for "is this invoice paid" — there's no separate
// invoice.status field to fall out of sync with.
const STATUS_STYLES = {
  Paid: { color: "#16A34A", bg: "#F0FDF4", border: "#BBF7D0" },
  "Partially Paid": { color: "#2563EB", bg: "#EFF6FF", border: "#BFDBFE" },
  Pending: { color: "#B45309", bg: "#FFFBEB", border: "#FDE68A" },
  Overdue: { color: "#DC2626", bg: "#FEF2F2", border: "#FECACA" },
  Barter: { color: "#6C5CE7", bg: "#F5F4FF", border: "#DCD6FF" },
};

function getStatusStyle(status) {
  return STATUS_STYLES[status] || STATUS_STYLES.Pending;
}

function formatShortDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "2-digit" });
}

const BoardingPassStyle = () => (
  <style>{`
    .dp-bpass {
      position: relative;
      display: flex;
      align-items: stretch;
      background: var(--paper);
      border: 1px solid var(--line);
      border-radius: 18px;
      margin-bottom: 16px;
      cursor: pointer;
      overflow: hidden;
      transition: transform .18s ease, box-shadow .18s ease, border-color .18s ease;
      box-shadow: 0 1px 2px rgba(18,23,43,0.04);
    }
    .dp-bpass:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 28px rgba(18,23,43,0.10);
      border-color: var(--bpass-accent, var(--line));
    }
    .dp-bpass:active { transform: translateY(0px) scale(0.995); }

    .dp-bpass-accent {
      width: 5px;
      flex-shrink: 0;
      background: var(--bpass-accent);
    }

    .dp-bpass-main {
      flex: 1;
      min-width: 0;
      padding: 16px 18px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .dp-bpass-divider {
      position: relative;
      width: 0;
      flex-shrink: 0;
      border-left: 2px dashed var(--line);
      margin: 10px 0;
    }
    .dp-bpass-divider::before,
    .dp-bpass-divider::after {
      content: "";
      position: absolute;
      left: 50%;
      transform: translateX(-50%);
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background: var(--canvas, #F1F2F8);
      border: 1px solid var(--line);
    }
    .dp-bpass-divider::before { top: -19px; }
    .dp-bpass-divider::after { bottom: -19px; }

    .dp-bpass-stub {
      width: 108px;
      flex-shrink: 0;
      padding: 16px 12px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 6px;
      text-align: center;
      background: linear-gradient(180deg, transparent, rgba(0,0,0,0.015));
    }

    .dp-bpass-amount {
      font-weight: 800;
      font-size: 17px;
      letter-spacing: -0.2px;
      line-height: 1.15;
    }

    .dp-bpass-barcode {
      display: flex;
      gap: 2px;
      align-items: flex-end;
      height: 16px;
      margin-top: 4px;
      opacity: 0.35;
    }
    .dp-bpass-barcode span {
      display: block;
      width: 2px;
      background: var(--ink, #12172B);
      border-radius: 1px;
    }

    .dp-bpass-open {
      display: inline-flex;
      align-items: center;
      gap: 3px;
      font-size: 10.5px;
      font-weight: 700;
      color: var(--bpass-accent);
      letter-spacing: 0.3px;
      text-transform: uppercase;
    }

    @media (max-width: 460px) {
      .dp-bpass-stub { width: 88px; padding: 12px 8px; }
      .dp-bpass-amount { font-size: 15px; }
    }
  `}</style>
);

const barHeights = [7, 12, 5, 16, 9, 14, 6, 11, 8, 15, 5, 10];

function InvoiceCard({ invoice, paymentStatus, onClick }) {
  // paymentStatus comes from the linked deal's payment_status — this is
  // the real-world "is this paid" signal (set in DealFormSheet), so the
  // card always reflects whatever the deal currently says.
  const status = paymentStatus || "Pending";
  const { color, bg, border } = getStatusStyle(status);

  return (
    <>
      <BoardingPassStyle />
      <div
        className="dp-bpass"
        style={{ "--bpass-accent": color }}
        onClick={() => onClick(invoice)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") onClick(invoice);
        }}
      >
        <div className="dp-bpass-accent" />

        <div className="dp-bpass-main">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
            <div>
              <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 1, color: "var(--slate)", textTransform: "uppercase", marginBottom: 3 }}>
                Invoice No.
              </div>
              <div className="dp-inv-mono dp-display" style={{ fontWeight: 700, fontSize: 15.5, fontFamily: "'JetBrains Mono', 'Courier New', ui-monospace, monospace" }}>
                {invoice.invoice_number || "—"}
              </div>
            </div>

            <span
              style={{
                padding: "4px 11px",
                borderRadius: 999,
                background: bg,
                color,
                border: `1px solid ${border}`,
                fontSize: 11.5,
                fontWeight: 700,
                flexShrink: 0,
                whiteSpace: "nowrap",
              }}
            >
              {status}
            </span>
          </div>

          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 700, fontSize: 15.5, marginBottom: 2 }}>
              <User2 size={14} style={{ color: "var(--slate)", flexShrink: 0 }} />
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {invoice.client_name || "Unknown Client"}
              </span>
            </div>
            <div style={{ color: "var(--slate)", fontSize: 13, paddingLeft: 20 }}>
              {invoice.company_name || "No company listed"}
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, color: "var(--slate)" }}>
            <Calendar size={13} />
            Issued {formatShortDate(invoice.invoice_date)}
            {invoice.due_date && (
              <>
                <span style={{ opacity: 0.5 }}>•</span>
                Due {formatShortDate(invoice.due_date)}
              </>
            )}
          </div>
        </div>

        <div className="dp-bpass-divider" />

        <div className="dp-bpass-stub">
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, color: "var(--slate)", textTransform: "uppercase" }}>
            Total
          </div>
          <div className="dp-bpass-amount dp-display">
            ₹{Number(invoice.total || 0).toLocaleString("en-IN")}
          </div>

          <div className="dp-bpass-barcode">
            {barHeights.map((h, i) => (
              <span key={i} style={{ height: h }} />
            ))}
          </div>

          <span className="dp-bpass-open">
            View
            <ArrowUpRight size={11} />
          </span>
        </div>
      </div>
    </>
  );
}

export default InvoiceCard;