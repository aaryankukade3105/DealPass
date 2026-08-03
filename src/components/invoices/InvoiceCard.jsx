function InvoiceCard({ invoice, onClick }) {
  const status = invoice.status || "Draft";

  const statusColor =
    status === "Paid"
      ? "#22c55e"
      : status === "Sent"
      ? "#3b82f6"
      : status === "Cancelled"
      ? "#ef4444"
      : "#f59e0b";

  return (
    <div
      onClick={() => onClick(invoice)}
      style={{
        background: "var(--paper)",
        border: "1px solid var(--line)",
        borderRadius: 18,
        padding: 16,
        marginBottom: 14,
        cursor: "pointer",
        transition: "0.2s",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 10,
        }}
      >
        <div className="dp-display" style={{ fontWeight: 700 }}>
          {invoice.invoice_number}
        </div>

        <span
          style={{
            padding: "4px 10px",
            borderRadius: 999,
            background: `${statusColor}20`,
            color: statusColor,
            fontSize: 12,
            fontWeight: 700,
          }}
        >
          {status}
        </span>
      </div>

      <div
        style={{
          fontWeight: 600,
          fontSize: 15,
          marginBottom: 4,
        }}
      >
        {invoice.client_name || "Unknown Client"}
      </div>

      <div
        style={{
          color: "var(--slate)",
          fontSize: 13,
          marginBottom: 10,
        }}
      >
        {invoice.company_name || "—"}
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span
          style={{
            color: "var(--slate)",
            fontSize: 13,
          }}
        >
          {invoice.invoice_date}
        </span>

        <div
          className="dp-display"
          style={{
            fontWeight: 700,
            fontSize: 17,
          }}
        >
          ₹{Number(invoice.total || 0).toLocaleString("en-IN")}
        </div>
      </div>
    </div>
  );
}

export default InvoiceCard;