import React, { useEffect, useState } from "react";
import { Search, ChevronDown, SlidersHorizontal, X } from "lucide-react";
import DealCard from "../components/deals/DealCard";
import EmptyState from "../components/common/EmptyState";
import DealFilterSheet from "../components/deals/DealFilterSheet";

const DEFAULT_FILTERS = {
  payment: "All",
  dealStatus: "All",
  invoice: "All",
  collaboration: "All",
};

const PageStyle = () => (
  <style>{`
    .dp-deals-search {
      display: flex;
      align-items: center;
      gap: 10px;
      background: rgba(255,255,255,0.45);
      backdrop-filter: blur(16px) saturate(180%);
      -webkit-backdrop-filter: blur(16px) saturate(180%);
      border: 1.5px solid rgba(255,255,255,0.55);
      border-radius: 14px;
      padding: 11px 14px 11px 36px;
      position: relative;
      transition: border-color .15s ease, box-shadow .15s ease;
    }
    .dp-deals-search:focus-within {
      border-color: #6C5CE7;
      box-shadow: 0 0 0 4px rgba(108,92,231,0.12);
    }
    .dp-deals-search input {
      border: none;
      outline: none;
      background: transparent;
      flex: 1;
      font-size: 14px;
      color: inherit;
      min-width: 0;
    }
  `}</style>
);

function DealsPage({
  deals,
  onAdd,
  onEdit,
  onDelete,
  onOpenDeal,
  onGenerateInvoice,
  // When set by the parent (e.g. clicking "Pending Revenue" on the
  // Dashboard), these filters are applied on top of DEFAULT_FILTERS the
  // moment they change. onFiltersApplied lets the parent clear the
  // override afterwards so it doesn't re-apply on every future visit to
  // this page (which would otherwise trap the user on a stale filter).
  initialFilters,
  onFiltersApplied,
}) {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState("Newest");
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (initialFilters) {
      setFilters({ ...DEFAULT_FILTERS, ...initialFilters });
      onFiltersApplied?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialFilters]);

  const activeFilterCount = Object.values(filters).filter((v) => v !== "All").length;

  const clearFilter = (key) =>
    setFilters((prev) => ({ ...prev, [key]: "All" }));

  const filtered = deals
    .filter((d) => {
      // Search
      if (
        query &&
        ![d.brand_name, d.deal_title, d.poc_name]
          .filter(Boolean)
          .some((field) => field.toLowerCase().includes(query.toLowerCase()))
      ) {
        return false;
      }

      // Payment Status
      if (filters.payment !== "All" && d.payment_status !== filters.payment) {
        return false;
      }

      // Deal Status
      if (filters.dealStatus !== "All" && d.deal_status !== filters.dealStatus) {
        return false;
      }

      // Invoice
      if (filters.invoice !== "All") {
        const hasInvoice = Boolean(d.invoice_created ?? d.invoice_id ?? d.invoice);
        if (filters.invoice === "Created" && !hasInvoice) return false;
        if (filters.invoice === "Not Created" && hasInvoice) return false;
      }

      // Collaboration type
      if (
        filters.collaboration !== "All" &&
        d.collaboration_type !== filters.collaboration
      ) {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      const dateA = new Date(a.confirmation_date || 0);
      const dateB = new Date(b.confirmation_date || 0);
      return sortBy === "Newest" ? dateB - dateA : dateA - dateB;
    });

  return (
    <div
      className="dp-scroll"
      style={{ flex: 1, overflowY: "auto", padding: "18px 18px 100px" }}
    >
      <PageStyle />

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 14,
        }}
      >
        <div className="dp-display" style={{ fontSize: 21, fontWeight: 700 }}>
          Your deals
        </div>
        <span
          style={{
            fontSize: 12,
            color: "var(--slate)",
            fontWeight: 600,
            background: "rgba(255,255,255,0.5)",
            backdropFilter: "blur(6px)",
            border: "1px solid rgba(255,255,255,0.6)",
            borderRadius: 999,
            padding: "4px 11px",
          }}
        >
          {filtered.length} of {deals.length}
        </span>
      </div>

      <div style={{ marginBottom: 12 }}>
        <div className="dp-deals-search">
          <Search
            size={15}
            style={{ position: "absolute", left: 12, color: "var(--slate)" }}
          />
          <input
            placeholder="Search by brand"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        <button
          onClick={() => setShowFilters(true)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 7,
            padding: "9px 15px",
            borderRadius: 12,
            border: activeFilterCount
              ? "1px solid rgba(108,92,231,0.4)"
              : "1px solid rgba(20,20,30,0.12)",
            background: activeFilterCount
              ? "rgba(108,92,231,0.14)"
              : "rgba(255,255,255,0.45)",
            backdropFilter: "blur(10px) saturate(180%)",
            WebkitBackdropFilter: "blur(10px) saturate(180%)",
            fontWeight: 600,
            fontSize: 13.5,
            cursor: "pointer",
            color: activeFilterCount ? "#6C5CE7" : "inherit",
          }}
        >
          <SlidersHorizontal size={14} />
          Filters
          {activeFilterCount > 0 && (
            <span
              style={{
                fontSize: 11,
                fontWeight: 800,
                color: "#fff",
                background: "#6C5CE7",
                borderRadius: 999,
                padding: "1px 6px",
                minWidth: 16,
              }}
            >
              {activeFilterCount}
            </span>
          )}
        </button>

        <button
          onClick={() =>
            setSortBy((s) => (s === "Newest" ? "Oldest" : "Newest"))
          }
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "9px 15px",
            borderRadius: 12,
            border: "1px solid rgba(20,20,30,0.12)",
            background: "rgba(255,255,255,0.45)",
            backdropFilter: "blur(10px) saturate(180%)",
            WebkitBackdropFilter: "blur(10px) saturate(180%)",
            fontWeight: 600,
            fontSize: 13.5,
            cursor: "pointer",
          }}
        >
          {sortBy}
          <ChevronDown size={14} />
        </button>
      </div>

      <DealFilterSheet
        open={showFilters}
        onClose={() => setShowFilters(false)}
        filters={filters}
        setFilters={setFilters}
      />

      {activeFilterCount > 0 && (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
          {Object.entries(filters).map(([key, value]) =>
            value !== "All" ? (
              <button
                key={key}
                onClick={() => clearFilter(key)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "7px 12px",
                  borderRadius: 999,
                  border: "1px solid rgba(108,92,231,0.4)",
                  background: "rgba(108,92,231,0.12)",
                  backdropFilter: "blur(6px)",
                  WebkitBackdropFilter: "blur(6px)",
                  color: "#6C5CE7",
                  fontSize: 12.5,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                {value}
                <X size={12} strokeWidth={3} />
              </button>
            ) : null
          )}

          <button
            onClick={() => setFilters(DEFAULT_FILTERS)}
            style={{
              padding: "7px 12px",
              borderRadius: 999,
              border: "none",
              background: "transparent",
              color: "var(--slate)",
              fontSize: 12.5,
              fontWeight: 600,
              cursor: "pointer",
              textDecoration: "underline",
            }}
          >
            Clear all
          </button>
        </div>
      )}

      {filtered.length === 0 ? (
        <EmptyState
          text={
            deals.length === 0
              ? "No deals yet. Tap the + button to log your first brand collab."
              : "No deals match this filter."
          }
          actionLabel={
            deals.length === 0
              ? "Add a deal"
              : activeFilterCount > 0
              ? "Clear filters"
              : undefined
          }
          onAction={
            deals.length === 0
              ? onAdd
              : activeFilterCount > 0
              ? () => setFilters(DEFAULT_FILTERS)
              : undefined
          }
        />
      ) : (
        filtered.map((deal) => (
          <DealCard
            key={deal.id}
            deal={deal}
            onClick={() => onOpenDeal(deal)}
            onEdit={onEdit}
            onDelete={onDelete}
            onGenerateInvoice={onGenerateInvoice}
          />
        ))
      )}
    </div>
  );
}

export default DealsPage;