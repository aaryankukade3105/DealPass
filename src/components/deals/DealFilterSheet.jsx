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

const Section = ({ icon, title, options, value, onChange }) => (
  <div style={{ marginBottom: 24 }}>
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        marginBottom: 12,
        fontWeight: 700,
        fontSize: 13,
        color: "rgba(20,20,30,0.55)",
        textTransform: "uppercase",
        letterSpacing: 0.4,
      }}
    >
      {icon}
      {title}
    </div>

    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 8,
      }}
    >
      {options.map((option) => {
        const active = value === option;

        return (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "9px 14px",
              borderRadius: 999,
              border: active
                ? "1px solid rgba(108,92,231,0.55)"
                : "1px solid rgba(20,20,30,0.10)",
              background: active
                ? "linear-gradient(135deg, rgba(108,92,231,0.95), rgba(130,110,255,0.85))"
                : "rgba(255,255,255,0.35)",
              backdropFilter: "blur(6px)",
              WebkitBackdropFilter: "blur(6px)",
              color: active ? "#fff" : "rgba(20,20,30,0.8)",
              fontSize: 13.5,
              fontWeight: active ? 700 : 500,
              cursor: "pointer",
              transition: "all .18s ease",
              boxShadow: active
                ? "0 4px 14px rgba(108,92,231,0.35)"
                : "none",
            }}
          >
            {active && <Check size={13} strokeWidth={3} />}
            {option}
          </button>
        );
      })}
    </div>
  </div>
);

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
      {/* Backdrop — blurred but bg still visible */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(20,20,35,0.28)",
          backdropFilter: "blur(3px)",
          WebkitBackdropFilter: "blur(3px)",
          zIndex: 998,
          animation: "dpFadeIn .18s ease",
        }}
      />

      <div
        style={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 999,
          maxHeight: "82vh",
          display: "flex",
          flexDirection: "column",
          borderRadius: "24px 24px 0 0",
          background: "rgba(255,255,255,0.55)",
          backdropFilter: "blur(24px) saturate(180%)",
          WebkitBackdropFilter: "blur(24px) saturate(180%)",
          border: "1px solid rgba(255,255,255,0.6)",
          borderBottom: "none",
          boxShadow: "0 -8px 40px rgba(20,20,40,0.25)",
          animation: "dpSlideUp .22s cubic-bezier(.32,.72,.35,1)",
        }}
      >
        {/* Drag handle */}
        <div
          style={{
            width: 40,
            height: 4,
            borderRadius: 999,
            background: "rgba(20,20,30,0.18)",
            margin: "10px auto 4px",
          }}
        />

        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "10px 20px 16px",
            borderBottom: "1px solid rgba(20,20,30,0.08)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <SlidersHorizontal size={18} color="#6C5CE7" />
            <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800 }}>
              Filters
            </h3>
            {activeCount > 0 && (
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  color: "#fff",
                  background: "#6C5CE7",
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
            onClick={onClose}
            style={{
              border: "none",
              background: "rgba(20,20,30,0.06)",
              cursor: "pointer",
              display: "flex",
              padding: 8,
              borderRadius: 999,
            }}
          >
            <X size={17} />
          </button>
        </div>

        {/* Scrollable content */}
        <div
          style={{
            padding: "18px 20px 8px",
            overflowY: "auto",
          }}
        >
          <Section
            icon={<CreditCard size={15} color="#6C5CE7" />}
            title="Payment Status"
            options={["All", "Pending", "Partially Paid", "Paid", "Overdue", "Barter"]}
            value={filters.payment}
            onChange={(payment) => setFilters((p) => ({ ...p, payment }))}
          />

          <Section
            icon={<Clapperboard size={15} color="#6C5CE7" />}
            title="Deal Status"
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
          />

          <Section
            icon={<Receipt size={15} color="#6C5CE7" />}
            title="Invoice"
            options={["All", "Created", "Not Created"]}
            value={filters.invoice}
            onChange={(invoice) => setFilters((p) => ({ ...p, invoice }))}
          />

          <Section
            icon={<Handshake size={15} color="#6C5CE7" />}
            title="Collaboration"
            options={["All", "Paid", "Barter"]}
            value={filters.collaboration}
            onChange={(collaboration) =>
              setFilters((p) => ({ ...p, collaboration }))
            }
          />
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            gap: 10,
            padding: "14px 20px calc(env(safe-area-inset-bottom, 0px) + 16px)",
            borderTop: "1px solid rgba(20,20,30,0.08)",
            background: "rgba(255,255,255,0.35)",
          }}
        >
          <button
            onClick={reset}
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              padding: "13px 0",
              borderRadius: 14,
              border: "1px solid rgba(20,20,30,0.14)",
              background: "rgba(255,255,255,0.5)",
              fontWeight: 700,
              fontSize: 14,
              cursor: "pointer",
              color: "rgba(20,20,30,0.75)",
            }}
          >
            <RotateCcw size={15} />
            Reset
          </button>

          <button
            onClick={onClose}
            style={{
              flex: 1.4,
              padding: "13px 0",
              borderRadius: 14,
              border: "none",
              background: "linear-gradient(135deg, #ce5ce7, #8E7CFF)",
              color: "#fff",
              fontWeight: 700,
              fontSize: 14,
              cursor: "pointer",
              boxShadow: "0 6px 18px rgba(227, 28, 214, 0.4)",
            }}
          >
            Show results
          </button>
        </div>
      </div>

      <style>{`
        @keyframes dpFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes dpSlideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </>
  );
}

export default DealFilterSheet;