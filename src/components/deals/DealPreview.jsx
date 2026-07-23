import { Download } from "lucide-react";
import { jsPDF } from "jspdf";
import { formatINR, formatDate } from "../../utils/formatters";
import { useRef } from "react";
import html2canvas from "html2canvas";
import autoTable from "jspdf-autotable";

function DealPreview({ deal, account, onClose }) {
 const previewRef = useRef(null);
const exportRef = useRef(null);
const downloadDealPass = async () => {
  if (!previewRef.current) return;

  try {
  const node = previewRef.current;

const original = {
  maxHeight: node.style.maxHeight,
  overflowY: node.style.overflowY,
};

node.style.maxHeight = "none";
node.style.overflowY = "visible";

const canvas = await html2canvas(node, {
  scale: 3,
  useCORS: true,
  backgroundColor: "#ffffff",
  scrollX: 0,
  scrollY: -window.scrollY,
});


const dataUrl = canvas.toDataURL("image/png");
node.style.maxHeight = original.maxHeight;
node.style.overflowY = original.overflowY;

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

const imgWidth = canvas.width;
const imgHeight = canvas.height;

const pageWidth = pdf.internal.pageSize.getWidth();
const pageHeight = pdf.internal.pageSize.getHeight();

const margin = 10;

const availableWidth = pageWidth - margin * 2;
const availableHeight = pageHeight - margin * 2;

const ratio = imgWidth / imgHeight;

let pdfWidth = availableWidth;
let pdfHeight = pdfWidth / ratio;

if (pdfHeight > availableHeight) {
  pdfHeight = availableHeight;
  pdfWidth = pdfHeight * ratio;
}

const x = (pageWidth - pdfWidth) / 2;
const y = (pageHeight - pdfHeight) / 2;

pdf.addImage(dataUrl, "PNG", x, y, pdfWidth, pdfHeight);

pdf.save(`${deal.brand_name}-DealPass.pdf`);
  } catch (err) {
    console.error(err);
  }
};
  if (!deal) return null;

  const chipStyle = (bg) => ({
    display: "inline-block",
    padding: "6px 12px",
    borderRadius: 999,
    background: bg,
    fontWeight: 700,
    fontSize: 12,
    marginRight: 8,
  });

  const Section = ({ title, children }) => (
    <div
      style={{
        borderTop: "1px dashed var(--line)",
        paddingTop: 18,
        marginTop: 18,
      }}
    >
      <div
        style={{
          fontSize: 11,
          letterSpacing: 2,
          color: "var(--slate)",
          fontWeight: 700,
          marginBottom: 10,
        }}
      >
        {title}
      </div>
      {children}
    </div>
  );

 return (
  <>
    {/* Backdrop */}
    <div
      className="dp-sheet-backdrop"
      onClick={onClose}
      style={{
        backdropFilter: "blur(14px)",
        background: "rgba(0,0,0,.25)",
        animation: "fadeBackdrop .25s ease",
        zIndex: 70,
      }}
    />

    {/* Floating Buttons (NOT downloaded) */}
    <div
      style={{
        position: "fixed",
        top: "5%",
        right: "5%",
        display: "flex",
        gap: 10,
        zIndex: 72,
      }}
    >
      <button
        onClick={downloadDealPass}
        title="Download Deal Pass"
        style={{
          width: 42,
          height: 42,
          borderRadius: "50%",
          border: "1px solid var(--line)",
          background: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          boxShadow: "0 6px 14px rgba(0,0,0,.15)",
        }}
      >
        <Download size={18} color="var(--ink)" />
      </button>

      <button
        onClick={onClose}
        title="Close"
        style={{
          width: 42,
          height: 42,
          borderRadius: "50%",
          border: "1px solid var(--line)",
          background: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          boxShadow: "0 6px 14px rgba(0,0,0,.15)",
          color: "var(--ink)",
          fontWeight: 700,
          fontSize: 20,
        }}
      >
        ✕
      </button>
    </div>

    {/* This is the only thing that gets downloaded */}
 <div
  ref={previewRef}
  className="dp-card"
      style={{
        position: "fixed",
        left: "50%",
        top: "50%",
        transform: "translate(-50%,-50%)",
        width: "92%",
        maxWidth: 520,
        maxHeight: "90vh",
        overflowY: "auto",
        padding: 28,
        borderRadius: 24,
        zIndex: 71,
        animation: "dealZoom .28s ease",
        boxShadow: "0 40px 80px rgba(0,0,0,.28)",
      }}
    >
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div
            style={{
              letterSpacing: 4,
              fontWeight: 700,
              fontSize: 12,
              color: "var(--slate)",
            }}
          >
            ✈ DEALPASS
          </div>

          <div
            className="dp-display"
            style={{
              marginTop: 12,
              fontSize: 30,
              fontWeight: 700,
            }}
          >
            {deal.brand_name}
          </div>

          <div
            style={{
              marginTop: 6,
              color: "var(--slate)",
            }}
          >
            {deal.deal_title}
          </div>
        </div>

        <div style={{ textAlign: "center", marginBottom: 22 }}>
          <div style={{ fontSize: 12, color: "var(--slate)" }}>
            COMMERCIALS
          </div>

          <div
            style={{
              fontSize: 36,
              fontWeight: 800,
              marginTop: 4,
            }}
          >
            {formatINR(deal.commercials)}
          </div>
        </div>

        <div style={{ marginBottom: 18 }}>
          <span style={chipStyle("#DDF7E8")}>{deal.deal_status}</span>
          <span style={chipStyle("#FFF2C8")}>{deal.payment_status}</span>
        </div>

        <Section title="DEAL DETAILS">
        <div>
  <b>From:</b> {account?.full_name || "Creator"}
</div>
          <div><b>To:</b> {deal.brand_name}</div>
          <div><b>Type:</b> {deal.collaboration_type}</div>
          <div><b>Confirmed:</b> {formatDate(deal.confirmation_date)}</div>
        </Section>

        <Section title="DELIVERABLES">
          <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
          {(deal.deliverables || []).map((item, index) => (
  <span key={`${item}-${index}`} style={chipStyle("var(--paper)")}>
    {item}
  </span>
))}
          </div>
        </Section>

        <Section title="CONTACT">
          <div><b>POC:</b> {deal.poc_name || "—"}</div>
          <div><b>Phone:</b> {deal.contact_number || "—"}</div>
        </Section>

        <Section title="PAYMENT">
          <div><b>Mode:</b> {deal.payment_mode}</div>
          <div><b>Deadline:</b> {formatDate(deal.payment_deadline)}</div>
          <div><b>Received:</b> {deal.payment_received_amount ? formatINR(deal.payment_received_amount) : "—"}</div>
          <div><b>Received Date:</b> {formatDate(deal.payment_received_date)}</div>
        </Section>

        <Section title="TIMELINE">
          <div><b>Content Due:</b> {formatDate(deal.content_due_date)}</div>
          <div><b>Submitted:</b> {formatDate(deal.content_submitted_date)}</div>
          <div><b>Posted:</b> {formatDate(deal.posted_date)}</div>
        </Section>
{deal.campaign_links?.length > 0 && (
  <Section title="CAMPAIGN LINKS">
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      {deal.campaign_links.map((link, index) => (
        <a
          key={index}
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: "#2563EB",
            wordBreak: "break-all",
            textDecoration: "underline",
          }}
        >
          {link}
        </a>
      ))}
    </div>
  </Section>
)}
        <Section title="INVOICE">
          <div><b>Sent:</b> {deal.invoice_sent ? "Yes" : "No"}</div>
          <div><b>Invoice No:</b> {deal.invoice_number || "—"}</div>
          <div><b>Transaction:</b> {deal.transaction_id || "—"}</div>
        </Section>

        {deal.notes && (
          <Section title="NOTES">
            <div>{deal.notes}</div>
          </Section>
        )}
<Section title="PASS INFORMATION">
  <div><b>Deal ID:</b> {deal.id?.slice(0, 8)}</div>
  <div><b>Created:</b> {formatDate(deal.created_at)}</div>

  <div
    style={{
      marginTop: 18,
      paddingTop: 14,
      borderTop: "1px dashed var(--line)",
      fontSize: 10,
      color: "var(--slate)",
      lineHeight: 1.6,
      textAlign: "center",
    }}
  >
    <strong>Disclaimer:</strong> This DealPass is generated for personal
    record-keeping purposes only. It is not a legally binding document,
    contract, invoice, receipt, or proof of payment.
  </div>

  <div
    style={{
      marginTop: 14,
      textAlign: "center",
      color: "var(--slate)",
      fontSize: 11,
      letterSpacing: 2,
      fontWeight: 600,
    }}
  >
    Powered by DealPass
  </div>
</Section>
      </div>
    </>
  );
}
export default DealPreview;