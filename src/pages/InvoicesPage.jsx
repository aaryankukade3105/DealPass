import { useEffect, useMemo, useState } from "react";
import { Search, FileText, IndianRupee, ArrowUpDown } from "lucide-react";
import EmptyState from "../components/common/EmptyState";
import { getInvoices } from "../services/invoiceService";
import InvoiceCard from "../components/invoices/InvoiceCard";

/* ---------------------------------------------------------------------------
 * NOTE ON FIELDS: this page only relies on fields we know exist on the
 * invoice row from the editor's save payload — invoice_number, client_name,
 * company_name, invoice_date, total. If your invoices table also has a
 * payment/status column (e.g. "Paid"/"Pending"/"Overdue"), tell me the field
 * name and I'll wire in a status quick-filter too; I didn't want to guess
 * at a column that might not exist.
 * ------------------------------------------------------------------------- */

const SORT_OPTIONS = [
  { key: "recent", label: "Most Recent" },
  { key: "oldest", label: "Oldest First" },
  { key: "highest", label: "Highest Value" },
  { key: "lowest", label: "Lowest Value" },
  { key: "client_az", label: "Client A–Z" },
];

function formatINR(amount) {
  const n = Number(amount) || 0;
  return "₹" + n.toLocaleString("en-IN");
}

function matchesSearch(invoice, query) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const haystacks = [invoice.invoice_number, invoice.client_name, invoice.company_name];
  return haystacks.some((v) => (v || "").toLowerCase().includes(q));
}

function sortInvoices(list, sortBy) {
  const copy = [...list];
  switch (sortBy) {
    case "recent":
      return copy.sort(
        (a, b) => new Date(b.invoice_date || 0) - new Date(a.invoice_date || 0)
      );
    case "oldest":
      return copy.sort(
        (a, b) => new Date(a.invoice_date || 0) - new Date(b.invoice_date || 0)
      );
    case "highest":
      return copy.sort((a, b) => (Number(b.total) || 0) - (Number(a.total) || 0));
    case "lowest":
      return copy.sort((a, b) => (Number(a.total) || 0) - (Number(b.total) || 0));
    case "client_az":
      return copy.sort((a, b) =>
        (a.client_name || "").localeCompare(b.client_name || "")
      );
    default:
      return copy;
  }
}

function SkeletonCard({ delay }) {
  return (
    <div
      style={{
        borderRadius: 16,
        border: "1px solid var(--border, rgba(0,0,0,0.08))",
        padding: 18,
        marginBottom: 12,
        background:
          "linear-gradient(90deg, rgba(0,0,0,0.035) 25%, rgba(0,0,0,0.06) 37%, rgba(0,0,0,0.035) 63%)",
        backgroundSize: "400% 100%",
        animation: `dpShimmer 1.4s ease infinite`,
        animationDelay: `${delay}ms`,
        height: 78,
      }}
    />
  );
}

export default function InvoicesPage({ onOpenInvoice }) {
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState([]);
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [sortOpen, setSortOpen] = useState(false);

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

  const filtered = useMemo(
    () => sortInvoices(invoices.filter((inv) => matchesSearch(inv, query)), sortBy),
    [invoices, query, sortBy]
  );

  const totalValue = useMemo(
    () => invoices.reduce((sum, inv) => sum + (Number(inv.total) || 0), 0),
    [invoices]
  );

  const activeSortLabel = SORT_OPTIONS.find((o) => o.key === sortBy)?.label;

  return (
    <div
      className="dp-scroll"
      style={{
        flex: 1,
        overflowY: "auto",
        padding: "18px 18px 100px",
      }}
    >
      <style>{`
        @keyframes dpShimmer {
          0% { background-position: 100% 0; }
          100% { background-position: 0 0; }
        }
        @keyframes dpInvFadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .dp-inv-list-item {
          animation: dpInvFadeUp .3s ease both;
        }
        .dp-inv-sort-menu {
          animation: dpInvFadeUp .15s ease both;
        }
        .dp-inv-stat-card {
          transition: transform .15s ease, box-shadow .15s ease;
        }
        .dp-inv-stat-card:active {
          transform: scale(0.98);
        }
      `}</style>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <div className="dp-display" style={{ fontSize: 21, fontWeight: 700 }}>
          Invoices
        </div>
        <span style={{ fontSize: 12, color: "var(--slate)", fontWeight: 600 }}>
          {invoices.length} total
        </span>
      </div>

      {/* Stats row */}
      {!loading && invoices.length > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 10,
            marginBottom: 18,
          }}
        >
          <div
            className="dp-inv-stat-card"
            style={{
              borderRadius: 16,
              padding: "14px 16px",
              background: "linear-gradient(135deg, #12172B 0%, #232B4D 100%)",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                background: "rgba(255,255,255,0.12)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <FileText size={16} color="#FFB100" />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 11, opacity: 0.7, fontWeight: 600 }}>Invoices</div>
              <div style={{ fontSize: 17, fontWeight: 700 }}>{invoices.length}</div>
            </div>
          </div>

          <div
            className="dp-inv-stat-card"
            style={{
              borderRadius: 16,
              padding: "14px 16px",
              background: "linear-gradient(135deg, #6C5CE7 0%, #8B7CF6 100%)",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                background: "rgba(255,255,255,0.16)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <IndianRupee size={16} color="#fff" />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 11, opacity: 0.85, fontWeight: 600 }}>Total Value</div>
              <div
                style={{
                  fontSize: 17,
                  fontWeight: 700,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {formatINR(totalValue)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search + sort */}
      {!loading && invoices.length > 0 && (
        <div style={{ display: "flex", gap: 8, marginBottom: 16, position: "relative" }}>
          <div style={{ position: "relative", flex: 1 }}>
            <Search
              size={15}
              style={{ position: "absolute", left: 12, top: 11, color: "var(--slate)" }}
            />
            <input
              className="dp-input"
              style={{ paddingLeft: 34, width: "100%" }}
              placeholder="Search client, company or invoice no."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <button
            type="button"
            className="dp-chip"
            style={{ display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap" }}
            onClick={() => setSortOpen((v) => !v)}
          >
            <ArrowUpDown size={14} />
            Sort
          </button>

          {sortOpen && (
            <>
              <div
                style={{ position: "fixed", inset: 0, zIndex: 9 }}
                onClick={() => setSortOpen(false)}
              />
              <div
                className="dp-inv-sort-menu"
                style={{
                  position: "absolute",
                  top: "calc(100% + 6px)",
                  right: 0,
                  zIndex: 10,
                  background: "#fff",
                  border: "1px solid var(--border, rgba(0,0,0,0.08))",
                  borderRadius: 12,
                  boxShadow: "0 8px 30px rgba(18,23,43,0.14)",
                  padding: 6,
                  minWidth: 180,
                }}
              >
                {SORT_OPTIONS.map((opt) => (
                  <div
                    key={opt.key}
                    onClick={() => {
                      setSortBy(opt.key);
                      setSortOpen(false);
                    }}
                    style={{
                      padding: "9px 12px",
                      borderRadius: 8,
                      fontSize: 13.5,
                      fontWeight: sortBy === opt.key ? 700 : 500,
                      color: sortBy === opt.key ? "var(--violet, #6C5CE7)" : "inherit",
                      background: sortBy === opt.key ? "rgba(108,92,231,0.08)" : "transparent",
                      cursor: "pointer",
                    }}
                  >
                    {opt.label}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {!loading && invoices.length > 0 && (query || sortBy !== "recent") && (
        <div style={{ fontSize: 12, color: "var(--slate)", marginBottom: 10, fontWeight: 600 }}>
          {filtered.length} of {invoices.length} shown
          {sortBy !== "recent" ? ` · sorted by ${activeSortLabel}` : ""}
        </div>
      )}

      {loading ? (
        <div>
          <SkeletonCard delay={0} />
          <SkeletonCard delay={100} />
          <SkeletonCard delay={200} />
        </div>
      ) : invoices.length === 0 ? (
        <EmptyState text="No invoices yet. Generate your first invoice from a deal." />
      ) : filtered.length === 0 ? (
        <EmptyState text={`No invoices match "${query}".`} />
      ) : (
        filtered.map((invoice, i) => (
          <div
            key={invoice.id}
            className="dp-inv-list-item"
            style={{ animationDelay: `${Math.min(i, 8) * 35}ms` }}
          >
            <InvoiceCard invoice={invoice} onClick={onOpenInvoice} />
          </div>
        ))
      )}
    </div>
  );
}