import { useEffect, useState } from "react";
import EmptyState from "../components/common/EmptyState";
import { getInvoices } from "../services/invoiceService";
import InvoiceCard from "../components/invoices/InvoiceCard";

function InvoicesPage({
  deals,
  onOpenInvoice,
}) {
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState([]);

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

  return (
    <div
      className="dp-scroll"
      style={{
        flex: 1,
        overflowY: "auto",
        padding: "18px 18px 100px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 18,
        }}
      >
        <div
          className="dp-display"
          style={{
            fontSize: 21,
            fontWeight: 700,
          }}
        >
          Invoices
        </div>

        <span
          style={{
            fontSize: 12,
            color: "var(--slate)",
            fontWeight: 600,
          }}
        >
          {invoices.length} total
        </span>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 40 }}>
          Loading...
        </div>
      ) : invoices.length === 0 ? (
        <EmptyState text="No invoices yet. Generate your first invoice from a deal." />
      ) : (
       invoices.map((invoice) => (
<InvoiceCard
  key={invoice.id}
  invoice={invoice}
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