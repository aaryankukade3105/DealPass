import { useEffect, useMemo, useState } from "react";
import EmptyState from "../components/common/EmptyState";
import { getInvoices } from "../services/invoiceService";
import InvoiceCard from "../components/invoices/InvoiceCard";
import { Search, Receipt, TrendingUp, Clock3, X, Wallet, AlertTriangle, Handshake} from "lucide-react";

const STATUS_FILTERS = [
  "All",
  "Pending",
  "Partially Paid",
  "Paid",
  "Overdue",
  "Barter",
];
// Invoice objects coming from the API/service aren't guaranteed to use the
// same field name for their total everywhere (total vs grand_total vs
// amount), which is why Paid/Pending were showing ₹0 before — this pulls
// whichever one actually has a value.
const getInvoiceTotal = (inv) =>
  Number(
    inv.total ??
      inv.grand_total ??
      inv.amount ??
      inv.invoice_total ??
      inv.total_amount ??
      0
  ) || 0;

const PageStyle = () => (
  <style>{`
    .dp-invp-stat {
      flex: 1;
      min-width: 128px;
      border-radius: 18px;
      padding: 14px 16px;
      display: flex;
      align-items: center;
      gap: 12px;
      background: rgba(255,255,255,0.45);
      backdrop-filter: blur(20px) saturate(180%);
      -webkit-backdrop-filter: blur(20px) saturate(180%);
      border: 1px solid rgba(255,255,255,0.55);
      box-shadow: 0 6px 20px rgba(31,38,135,0.08);
      transition: transform .15s ease, box-shadow .15s ease;
    }
    .dp-invp-stat.highlight {
      border: 1.5px solid var(--stat-accent, rgba(108,92,231,0.4));
      background: var(--stat-bg, rgba(255,255,255,0.5));
      box-shadow: 0 8px 24px var(--stat-shadow, rgba(31,38,135,0.10));
    }
    .dp-invp-stat-icon {
      width: 38px;
      height: 38px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      backdrop-filter: blur(4px);
    }
    .dp-invp-search {
      display: flex;
      align-items: center;
      gap: 10px;
      background: rgba(255,255,255,0.45);
      backdrop-filter: blur(16px) saturate(180%);
      -webkit-backdrop-filter: blur(16px) saturate(180%);
      border: 1.5px solid rgba(255,255,255,0.55);
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
      padding: 8px 15px;
      border-radius: 999px;
      border: 1px solid rgba(20,20,30,0.10);
      background: rgba(255,255,255,0.4);
      backdrop-filter: blur(6px);
      -webkit-backdrop-filter: blur(6px);
      color: rgba(20,20,30,0.75);
      font-size: 12.5px;
      font-weight: 700;
      cursor: pointer;
      white-space: nowrap;
      transition: all .15s ease;
      flex-shrink: 0;
    }
    .dp-invp-chip:hover { border-color: #6C5CE7aa; }
    .dp-invp-chip.active {
      background: linear-gradient(135deg, rgba(108,92,231,0.95), rgba(130,110,255,0.85));
      border-color: rgba(108,92,231,0.5);
      color: #fff;
      box-shadow: 0 4px 14px rgba(108,92,231,0.32);
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
      background: linear-gradient(90deg, rgba(255,255,255,0.35) 25%, rgba(255,255,255,0.6) 37%, rgba(255,255,255,0.35) 63%);
      background-size: 400% 100%;
      animation: dpInvpShimmer 1.4s ease infinite;
      margin-bottom: 16px;
      border: 1px solid rgba(255,255,255,0.5);
      backdrop-filter: blur(10px);
    }
    @keyframes dpInvpShimmer {
      0% { background-position: 100% 50%; }
      100% { background-position: 0 50%; }
    }
  `}</style>
);

function StatCard({ icon, iconBg, label, value, accent, bg, shadow, highlight }) {
  return (
    <div
      className={`dp-invp-stat ${highlight ? "highlight" : ""}`}
      style={
        highlight
          ? {
              "--stat-accent": accent,
              "--stat-bg": bg,
              "--stat-shadow": shadow,
            }
          : undefined
      }
    >
      <div className="dp-invp-stat-icon" style={{ background: iconBg }}>
        {icon}
      </div>
      <div style={{ minWidth: 0 }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: "var(--slate)",
            textTransform: "uppercase",
            letterSpacing: 0.4,
          }}
        >
          {label}
        </div>
        <div
          className="dp-display"
          style={{
            fontSize: 17,
            fontWeight: 800,
            marginTop: 1,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
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
const dealMap = useMemo(
  () => Object.fromEntries(deals.map((d) => [d.id, d])),
  [deals]
);
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
  const counts = {
    total: invoices.length,
    pending: 0,
    partiallyPaid: 0,
    paid: 0,
    overdue: 0,
    barter: 0,
  };

  invoices.forEach((inv) => {
    const status =
      dealMap[inv.deal_id]?.payment_status || "Pending";

    switch (status) {
      case "Pending":
        counts.pending++;
        break;

      case "Partially Paid":
        counts.partiallyPaid++;
        break;

      case "Paid":
        counts.paid++;
        break;

      case "Overdue":
        counts.overdue++;
        break;

      case "Barter":
        counts.barter++;
        break;
    }
  });

  return counts;
}, [invoices, dealMap]);
const statCards = [
  {
    key: "total",
    label: "Total",
    value: stats.total,
    icon: <Receipt size={17} color="#6C5CE7" />,
    iconBg: "rgba(108,92,231,0.16)",
    accent: "rgba(108,92,231,0.45)",
    bg: "rgba(237,233,254,0.65)",
    shadow: "rgba(108,92,231,0.18)",
    highlight: true,
  },
  {
    key: "paid",
    label: "Paid",
    value: stats.paid,
    icon: <TrendingUp size={17} color="#16A34A" />,
    iconBg: "rgba(22,163,74,0.16)",
    accent: "rgba(22,163,74,0.45)",
    bg: "rgba(220,252,231,0.65)",
    shadow: "rgba(22,163,74,0.18)",
  },
  {
    key: "pending",
    label: "Pending",
    value: stats.pending,
    icon: <Clock3 size={17} color="#D97706" />,
    iconBg: "rgba(217,119,6,0.16)",
    accent: "rgba(217,119,6,0.45)",
    bg: "rgba(254,243,199,0.65)",
    shadow: "rgba(217,119,6,0.18)",
  },
  {
    key: "partiallyPaid",
    label: "Partial",
    value: stats.partiallyPaid,
    icon: <Wallet size={17} color="#2563EB" />,
    iconBg: "rgba(37,99,235,0.16)",
    accent: "rgba(37,99,235,0.45)",
    bg: "rgba(219,234,254,0.65)",
    shadow: "rgba(37,99,235,0.18)",
  },
  {
    key: "overdue",
    label: "Overdue",
    value: stats.overdue,
    icon: <AlertTriangle size={17} color="#DC2626" />,
    iconBg: "rgba(220,38,38,0.16)",
    accent: "rgba(220,38,38,0.45)",
    bg: "rgba(254,226,226,0.65)",
    shadow: "rgba(220,38,38,0.18)",
  },
  {
    key: "barter",
    label: "Barter",
    value: stats.barter,
    icon: <Handshake size={17} color="#7C3AED" />,
    iconBg: "rgba(124,58,237,0.16)",
    accent: "rgba(124,58,237,0.45)",
    bg: "rgba(237,233,254,0.65)",
    shadow: "rgba(124,58,237,0.18)",
  },
];
  const filteredInvoices = useMemo(() => {
    const q = search.trim().toLowerCase();

    return invoices
    .filter((inv) => {
  if (statusFilter === "All") return true;

  const status =
    dealMap[inv.deal_id]?.payment_status || "Pending";

  return status === statusFilter;
})  
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
            background: "rgba(255,255,255,0.5)",
            backdropFilter: "blur(6px)",
            border: "1px solid rgba(255,255,255,0.6)",
            borderRadius: 999,
            padding: "5px 12px",
          }}
        >
          {invoices.length} total
        </span>
      </div>

      {!loading && invoices.length > 0 && (
        <>
          {/* Stats row — Paid & Pending are highlighted since they carry the
              actual invoice money values, not just counts */}
        <div
  style={{
    display: "flex",
    gap: 10,
    overflowX: "auto",
    paddingBottom: 6,
    marginBottom: 18,
    scrollbarWidth: "none",
  }}
>
  {statCards.map((card) => (
    <div
      key={card.key}
      style={{
        minWidth: 150,
        flexShrink: 0,
      }}
    >
      <StatCard
        icon={card.icon}
        iconBg={card.iconBg}
        label={card.label}
        value={card.value}
        accent={card.accent}
        bg={card.bg}
        shadow={card.shadow}
        highlight={card.highlight}
      />
    </div>
  ))}
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
            paymentStatus={deals.find((d) => d.id === invoice.deal_id)?.payment_status}
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