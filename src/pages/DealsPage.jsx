import React, { useState } from "react";
import { Search } from "lucide-react";
import DealCard from "../components/deals/DealCard";
import EmptyState from "../components/common/EmptyState";

function DealsPage({
  deals,
  onAdd,
  onEdit,
  onDelete,
  onOpenDeal,
}) {
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");

  const filtered = deals
    .filter((d) => {
  if (filter === "pending" && d.payment_status !== "Pending") return false;

if (filter === "completed" && d.payment_status !== "Paid") return false;

if (
  query &&
  !d.brand_name.toLowerCase().includes(query.toLowerCase())
)
  return false;
      return true;
    })
    .sort((a, b) => new Date(b.confirmationDate || 0) - new Date(a.confirmationDate || 0));

  return (
    <div className="dp-scroll" style={{ flex: 1, overflowY: "auto", padding: "18px 18px 100px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div className="dp-display" style={{ fontSize: 21, fontWeight: 700 }}>Your deals</div>
        <span style={{ fontSize: 12, color: "var(--slate)", fontWeight: 600 }}>{deals.length} total</span>
      </div>

      <div style={{ position: "relative", marginBottom: 12 }}>
        <Search size={15} style={{ position: "absolute", left: 12, top: 11, color: "var(--slate)" }} />
        <input className="dp-input" style={{ paddingLeft: 34 }} placeholder="Search by brand" value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {[["all", "All"], ["pending", "Payment pending"], ["completed", "Paid"]].map(([k, label]) => (
          <button key={k} className={`dp-chip ${filter === k ? "active" : ""}`} onClick={() => setFilter(k)}>
            {label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          text={deals.length === 0 ? "No deals yet. Tap the + button to log your first brand collab." : "No deals match this filter."}
          actionLabel={deals.length === 0 ? "Add a deal" : undefined}
          onAction={deals.length === 0 ? onAdd : undefined}
        />
      ) : (
      filtered.map((deal) => (
  <DealCard
    key={deal.id}
    deal={deal}
    onClick={() => onOpenDeal(deal)}
    onEdit={onEdit}
    onDelete={onDelete}
  />
)))}
    </div>
  );
}
export default DealsPage;