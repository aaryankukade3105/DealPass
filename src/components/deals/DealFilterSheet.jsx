import { useState } from "react";
import {
  X,
  CreditCard,
  Clapperboard,
  Receipt,
  Handshake,
  Check,
  RotateCcw,
  SlidersHorizontal,
} from "lucide-react";
import {
  PAYMENT_STATUS_COLORS,
  DEAL_STATUS_COLORS,
  COLLABORATION_TYPE_COLORS,
} from "../../utils/constants";

/* ------------------------------------------------------------------ */
/*  Section accents — same pattern as the Dashboard's Action Center     */
/*  rows and DealFormSheet's section headers: a tinted icon box with a  */
/*  matching accent, not one global purple everywhere.                  */
/* ------------------------------------------------------------------ */
const SECTION_META = {
  payment: { icon: CreditCard, accent: "#2563EB", tint: "#DBEAFE", label: "Payment Status" },
  dealStatus: { icon: Clapperboard, accent: "#7C3AED", tint: "#EDE9FE", label: "Deal Status" },
  invoice: { icon: Receipt, accent: "#16A34A", tint: "#DCFCE7", label: "Invoice" },
  collaboration: { icon: Handshake, accent: "#D97706", tint: "#FEF3C7", label: "Collaboration" },
};

// Falls back to a section's own accent for options that don't have a
// dedicated status color (e.g. "All", "Created", "Not Created").
function chipColorFor(sectionId, option, colorMap) {
  if (option === "All") return "var(--slate)";
  return colorMap?.[option] || SECTION_META[sectionId].accent;
}

function Section({ id, options, value, onChange, colorMap }) {
  const meta = SECTION_META[id];
  const Icon = meta.icon;

  return (
    <div style={{ marginBottom: 22 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <div
          style={{
            width: 26,
            height: 26,
            borderRadius: 8,
            background: meta.tint,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Icon size={13} color={meta.accent} strokeWidth={2.4} />
        </div>
        <div className="dp-label" style={{ marginBottom: 0 }}>
          {meta.label}
        </div>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {options.map((option) => {
          const active = value === option;
          const color = chipColorFor(id, option, colorMap);
          return (
            <button
              key={option}
              type="button"
              onClick={() => onChange(option)}
              className="dp-chip"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                border: active ? `1.5px solid ${color}` : "1px solid var(--line)",
                background: active ? `${color}15` : "var(--surface, #fff)",
                color: active ? color : "var(--slate)",
                fontWeight: active ? 700 : 600,
              }}
            >
              {active && <Check size={12} strokeWidth={3} />}
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}

const DEFAULT_FILTERS = {
  payment: "All",
  dealStatus: "All",
  invoice: "All",
  collaboration: "All",
};

function DealFilterSheet({ open, onClose, filters, setFilters }) {
  if (!open) return null;

  const reset = () => setFilters(DEFAULT_FILTERS);
  const activeCount = Object.values(filters).filter((v) => v !== "All").length;

  return (
    <>
      <div className="dp-sheet-backdrop" onClick={onClose} />

      <div
        className="dp-sheet"
        style={{
          top: "auto",
          bottom: 0,
          maxHeight: "82vh",
          borderRadius: "22px 22px 0 0",
          animation: "dpSlideUp .22s cubic-bezier(.32,.72,.35,1)",
        }}
      >
        {/* Drag handle */}
        <div
          style={{
            width: 38,
            height: 4,
            borderRadius: 999,
            background: "var(--line)",
            margin: "10px auto 2px",
            flexShrink: 0,
          }}
        />

        {/* Header — same layout/border as DealFormSheet's header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "12px 18px 14px",
            borderBottom: "1px solid var(--line)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <SlidersHorizontal size={17} color="var(--signal)" />
            <div className="dp-display" style={{ fontSize: 17, fontWeight: 800 }}>
              Filters
            </div>
            {activeCount > 0 && (
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  color: "#fff",
                  background: "var(--signal)",
                  borderRadius: 999,
                  padding: "2px 7px",
                  minWidth: 18,
                  textAlign: "center",
                }}
              >
                {activeCount}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              border: "none",
              background: "#F1F2F8",
              cursor: "pointer",
              display: "flex",
              padding: 8,
              borderRadius: 999,
              color: "var(--slate)",
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="dp-scroll" style={{ padding: "18px 18px 6px", overflowY: "auto", flex: 1 }}>
          <Section
            id="payment"
            options={["All", "Pending", "Partially Paid", "Paid", "Overdue", "Barter"]}
            value={filters.payment}
            onChange={(payment) => setFilters((p) => ({ ...p, payment }))}
            colorMap={PAYMENT_STATUS_COLORS}
          />

          <Section
            id="dealStatus"
            options={[
              "All",
              "Negotiation",
              "Confirmed",
              "Content Shot",
              "Content Submitted",
              "Posted",
              "Completed",
              "Cancelled",
            ]}
            value={filters.dealStatus}
            onChange={(dealStatus) => setFilters((p) => ({ ...p, dealStatus }))}
            colorMap={DEAL_STATUS_COLORS}
          />

          <Section
            id="invoice"
            options={["All", "Created", "Not Created"]}
            value={filters.invoice}
            onChange={(invoice) => setFilters((p) => ({ ...p, invoice }))}
          />

          <Section
            id="collaboration"
            options={["All", "Paid", "Barter"]}
            value={filters.collaboration}
            onChange={(collaboration) => setFilters((p) => ({ ...p, collaboration }))}
            colorMap={COLLABORATION_TYPE_COLORS}
          />
        </div>

        {/* Footer — same button language as DealFormSheet's save control */}
        <div
          style={{
            display: "flex",
            gap: 10,
            padding: "14px 18px calc(env(safe-area-inset-bottom, 0px) + 16px)",
            borderTop: "1px solid var(--line)",
            background: "var(--surface, #fff)",
            flexShrink: 0,
          }}
        >
          <button
            type="button"
            onClick={reset}
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 7,
              padding: "13px 0",
              borderRadius: 12,
              border: "1px solid var(--line)",
              background: "var(--surface, #fff)",
              fontWeight: 700,
              fontSize: 13.5,
              cursor: "pointer",
              color: "var(--slate)",
            }}
          >
            <RotateCcw size={14} />
            Reset
          </button>

          <button
            type="button"
            onClick={onClose}
            className="dp-btn-signal"
            style={{ flex: 1.4 }}
          >
            Show results
          </button>
        </div>
      </div>

      <style>{`
        @keyframes dpSlideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </>
  );
}

export default DealFilterSheet;