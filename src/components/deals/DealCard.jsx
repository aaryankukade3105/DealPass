import { Pencil, Trash2 } from "lucide-react";
import { formatINR, formatDate } from "../../utils/formatters";
function DealCard({ deal, onClick, onEdit, onDelete, compact }) {
 const statusInfo =
  deal.payment_status === "Paid"
    ? {
        label: "Paid",
        color: "var(--mint)",
      }
    : {
        label: deal.payment_status,
        color: "var(--amber)",
      };

  return (
    <div
      className="dp-card"
      style={{ display: "flex", overflow: "hidden", marginBottom: 12, cursor: onClick ? "pointer" : "default" }}
      onClick={onClick}
    >
      <div style={{ flex: 1, padding: 14, minWidth: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
          <div style={{ minWidth: 0 }}>
            <div className="dp-display" style={{ fontWeight: 700, fontSize: 15.5 }}>{deal.brand_name}</div>
            {deal.poc_name && (
              <div style={{ fontSize: 12, color: "var(--slate)", marginTop: 1 }}>
                {deal.poc_name}{deal.contact_number ? ` · ${deal.contact_number}` : ""}
              </div>
            )}
          </div>
          <div className="dp-mono" style={{ fontWeight: 700, fontSize: 15, whiteSpace: "nowrap" }}>
            {formatINR(deal.commercials)}
          </div>
        </div>

        {deal.deliverables && deal.deliverables.length > 0 && (
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 10 }}>
            {deal.deliverables.slice(0, 4).map((dv) => (
              <span
                key={dv}
                style={{ fontSize: 10.5, fontWeight: 600, color: "var(--slate)", background: "var(--paper)", padding: "3px 8px", borderRadius: 999 }}
              >
                {dv}
              </span>
            ))}
          </div>
        )}

        <div style={{ marginTop: 10, fontSize: 11, color: "var(--slate)" }}>
          Confirmed {formatDate(deal.confirmation_date)} · {deal.confirmation_mode}
        </div>

        {!compact && (
          <div style={{ display: "flex", gap: 16, marginTop: 10, borderTop: "1px dashed var(--line)", paddingTop: 10 }}>
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(deal); }}
              style={{ display: "flex", alignItems: "center", gap: 5, background: "none", border: "none", color: "var(--ink)", fontSize: 12, fontWeight: 600, cursor: "pointer", padding: 0 }}
            >
              <Pencil size={13} /> Edit
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(deal); }}
              style={{ display: "flex", alignItems: "center", gap: 5, background: "none", border: "none", color: "var(--signal)", fontSize: 12, fontWeight: 600, cursor: "pointer", padding: 0 }}
            >
              <Trash2 size={13} /> Delete
            </button>
          </div>
        )}
      </div>

      <div
        className="dp-divider-dash"
        style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 12px", minWidth: 80 }}
      >
        <span className="dp-stamp" style={{ color: statusInfo.color }}>{statusInfo.label}</span>
        {deal.payment_deadline && deal.payment_status !== "completed" && (
          <div style={{ fontSize: 9.5, color: "var(--slate)", marginTop: 8, textAlign: "center", lineHeight: 1.3 }}>
            Due<br />{formatDate(deal.payment_deadline)}
          </div>
        )}
      </div>
    </div>
  );
}
export default DealCard;