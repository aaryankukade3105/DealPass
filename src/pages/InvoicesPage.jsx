import { useEffect, useMemo, useState } from "react";
import EmptyState from "../components/common/EmptyState";
import { getInvoices } from "../services/invoiceService";
import InvoiceCard from "../components/invoices/InvoiceCard";
import { Search, Receipt, TrendingUp, Clock3, X } from "lucide-react";

const STATUS_FILTERS = ["All", "Draft", "Sent", "Paid", "Cancelled"];

const PageStyle = () => (
  <style>{`
    .dp-invp-stat {
      flex: 1;
      min-width: 128px;
      background: var(--paper);
      border: 1px solid var(--line);
      border-radius: 16px;
      padding: 14px 16px;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .dp-invp-stat-icon {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .dp-invp-search {
      display: flex;
      align-items: center;
      gap: 10px;
      background: var(--paper);
      border: 1.5px solid var(--line);
      border-radius: 14px;
      padding: 11px 14px;
      transition: border-color .15s ease, box-shadow .15s ease;
    }
    .dp-invp-search:focus-within {
      border-color: #6C5CE7;
      box-shadow: 0 0 0 4px rgba(108,92,231,0.12);
    }
    .dp-invp-search input {
      border: none;
      outline: none;
      background: transparent;
      flex: 1;
      font-size: 14px;
      color: inherit;
      min-width: 0;
    }
    .dp-invp-chip {
      padding: 7px 14px;
      border-radius: 999px;
      border: 1.5px solid var(--line);
      background: var(--paper);
      color: var(--slate);
      font-size: 12.5px;
      font-weight: 700;
      cursor: pointer;
      white-space: nowrap;
      transition: all .15s ease;
    }
    .dp-invp-chip:hover { border-color: #6C5CE7aa; }
    .dp-invp-chip.active {
      background: #12172B;
      border-color: #12172B;
      color: #fff;
    }
    .dp-invp-chips {
      display: flex;
      gap: 8px;
      overflow-x: auto;
      padding-bottom: 2px;
      scrollbar-width: none;
    }
    .dp-invp-chips::-webkit-scrollbar { display: none; }

    .dp-invp-skel {
      height: 148px;
      border-radius: 18px;
      background: linear-gradient(90deg, var(--paper) 25%, var(--line) 37%, var(--paper) 63%);
      background-size: 400% 100%;
      animation: dpInvpShimmer 1.4s ease infinite;
      margin-bottom: 16px;
      border: 1px solid var(--line);
    }
    @keyframes dpInvpShimmer {
      0% { background-position: 100% 50%; }
      100% { background-position: 0 50%; }
    }
  `}</style>
);

function StatCard({ icon, iconBg, iconColor, label, value }) {
  return (
    <div className="dp-invp-stat">
      <div className="dp-invp-stat-icon" style={{ background: iconBg }}>
        {icon}
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--slate)", textTransform: "uppercase", letterSpacing: 0.4 }}>
          {label}
        </div>
        <div className="dp-display" style={{ fontSize: 17, fontWeight: 800, marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {value}
        </div>
      </div>
    </div>
  );
}

function InvoicesPage({ deals, onOpenInvoice }) {
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    async function loadInvoices() {
      try {
        const data = await getInvoices();
        setInvoices(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadInvoices();
  }, []);

  const stats = useMemo(() => {
    const paid = invoices.filter((inv) => (inv.status || "Draft") === "Paid");
    const pending = invoices.filter((inv) => {
      const s = inv.status || "Draft";
      return s !== "Paid" && s !== "Cancelled";
    });

    const paidTotal = paid.reduce((sum, inv) => sum + Number(inv.total || 0), 0);
    const pendingTotal = pending.reduce((sum, inv) => sum + Number(inv.total || 0), 0);

    return {
      count: invoices.length,
      paidTotal,
      pendingCount: pending.length,
      pendingTotal,
    };
  }, [invoices]);

  const filteredInvoices = useMemo(() => {
    const q = search.trim().toLowerCase();

    return invoices
      .filter((inv) => (statusFilter === "All" ? true : (inv.status || "Draft") === statusFilter))
      .filter((inv) => {
        if (!q) return true;
        return (
          (inv.invoice_number || "").toLowerCase().includes(q) ||
          (inv.client_name || "").toLowerCase().includes(q) ||
          (inv.company_name || "").toLowerCase().includes(q)
        );
      })
      .sort((a, b) => new Date(b.invoice_date || 0) - new Date(a.invoice_date || 0));
  }, [invoices, search, statusFilter]);

  return (
    <div
      className="dp-scroll"
      style={{
        flex: 1,
        overflowY: "auto",
        padding: "18px 18px 100px",
      }}
    >
      <PageStyle />

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 18,
        }}
      >
        <div>
          <div className="dp-display" style={{ fontSize: 21, fontWeight: 700 }}>
            Invoices
          </div>
          <div style={{ fontSize: 12.5, color: "var(--slate)", marginTop: 2 }}>
            Every invoice you've raised, in one place
          </div>
        </div>

        <span
          style={{
            fontSize: 12,
            color: "var(--slate)",
            fontWeight: 600,
            background: "var(--paper)",
            border: "1px solid var(--line)",
            borderRadius: 999,
            padding: "5px 12px",
          }}
        >
          {invoices.length} total
        </span>
      </div>

      {!loading && invoices.length > 0 && (
        <>
          {/* Stats row */}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 16 }}>
            <StatCard
              icon={<Receipt size={17} color="#6C5CE7" />}
              iconBg="#F5F4FF"
              label="Total Invoices"
              value={stats.count}
            />
            <StatCard
              icon={<TrendingUp size={17} color="#16A34A" />}
              iconBg="#F0FDF4"
              label="Paid"
              value={`₹${stats.paidTotal.toLocaleString("en-IN")}`}
            />
            <StatCard
              icon={<Clock3 size={17} color="#B45309" />}
              iconBg="#FFFBEB"
              label={`Pending (${stats.pendingCount})`}
              value={`₹${stats.pendingTotal.toLocaleString("en-IN")}`}
            />
          </div>

          {/* Search */}
          <div className="dp-invp-search" style={{ marginBottom: 12 }}>
            <Search size={16} style={{ color: "var(--slate)", flexShrink: 0 }} />
            <input
              placeholder="Search by client, company, or invoice number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                style={{ background: "none", border: "none", cursor: "pointer", display: "flex", color: "var(--slate)" }}
              >
                <X size={15} />
              </button>
            )}
          </div>

          {/* Status filter chips */}
          <div className="dp-invp-chips" style={{ marginBottom: 18 }}>
            {STATUS_FILTERS.map((s) => (
              <button
                key={s}
                type="button"
                className={`dp-invp-chip ${statusFilter === s ? "active" : ""}`}
                onClick={() => setStatusFilter(s)}
              >
                {s}
              </button>
            ))}
          </div>
        </>
      )}

      {loading ? (
        <>
          <div className="dp-invp-skel" />
          <div className="dp-invp-skel" />
          <div className="dp-invp-skel" />
        </>
      ) : invoices.length === 0 ? (
        <EmptyState text="No invoices yet. Generate your first invoice from a deal." />
      ) : filteredInvoices.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "40px 16px",
            color: "var(--slate)",
            fontSize: 13.5,
          }}
        >
          No invoices match your search or filter.
        </div>
      ) : (
        filteredInvoices.map((invoice) => (
    <InvoiceCard
  key={invoice.id}
  invoice={invoice}
  paymentStatus={
    deals.find((d) => d.id === invoice.deal_id)?.payment_status
  }
  onClick={() => {
    const deal = deals.find((d) => d.id === invoice.deal_id);

    if (!deal) {
      alert("Associated deal not found.");
      return;
    }

    onOpenInvoice(deal);
  }}
/>
        ))
      )}
    </div>
  );
}

export default InvoicesPage;