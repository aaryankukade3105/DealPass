import { Download } from "lucide-react";
import { formatINR, formatDate } from "../../utils/formatters";
import { useRef } from "react";
import logo from "../../assets/logo.svg";

/* ------------------------------------------------------------------ */
/*  Print template                                                     */
/*  Built as its own compact HTML string rather than reusing the        */
/*  on-screen scrollable card. The screen card is designed to scroll —  */
/*  generous section spacing, open-ended height — which is exactly      */
/*  wrong for print: it spills across 2-3 A4 pages and lands wherever   */
/*  the browser happens to paginate it. This template is deliberately   */
/*  dense (small type, 2-column grid, tight spacing) and wrapped so it  */
/*  centers on a single sheet regardless of how much/little data a      */
/*  given deal has.                                                     */
/*                                                                       */
/*  Rendering rule: a field only appears if it was actually filled in.  */
/*  No "Not available" placeholders, no empty rows — and if every field */
/*  in a whole section is empty, the section itself is skipped rather   */
/*  than printing a title with nothing under it.                        */
/* ------------------------------------------------------------------ */
function hasValue(v) {
  return v !== undefined && v !== null && String(v).trim() !== "";
}

function buildPrintHTML({ deal, account, fileTitle, logoUrl }) {
  // Returns "" for empty values so callers can filter them out before
  // deciding whether a whole section has anything worth showing.
  const row = (label, value) =>
    hasValue(value)
      ? `
    <div class="dp-row">
      <span class="dp-row-label">${label}</span>
      <span class="dp-row-value">${value}</span>
    </div>`
      : "";

  // Builds a section only if at least one of its rows actually has data.
  const section = (title, rowsHTML, { first = false } = {}) => {
    const filled = rowsHTML.filter(Boolean);
    if (filled.length === 0) return "";
    return `
      <div class="dp-section" ${first ? 'style="margin-top:0; border-top:none; padding-top:0;"' : ""}>
        <div class="dp-section-title">${title}</div>
        ${filled.join("")}
      </div>`;
  };

  const deliverables = deal.deliverables || [];
  const deliverablesHTML =
    deliverables.length > 0
      ? `
      <div class="dp-section" style="margin-top:0; border-top:none; padding-top:0;">
        <div class="dp-section-title">Deliverables</div>
        <div>
          ${deliverables
            .map((item) => {
              const text = typeof item === "string" ? item : `${item.type} ×${item.qty}`;
              return `<span class="dp-chip">${text}</span>`;
            })
            .join("")}
        </div>
      </div>`
      : "";

  const campaignLinksHTML =
    deal.campaign_links?.length > 0
      ? `
      <div class="dp-section">
        <div class="dp-section-title">Campaign Links</div>
        <div class="dp-links">
          ${deal.campaign_links
            .map(
              (link) =>
                `<a href="${link}" target="_blank" rel="noopener noreferrer">${link}</a>`
            )
            .join("")}
        </div>
      </div>`
      : "";

  const notesHTML = hasValue(deal.notes)
    ? `
      <div class="dp-section">
        <div class="dp-section-title">Notes</div>
        <div class="dp-notes">${deal.notes}</div>
      </div>`
    : "";

  const dealDetailsHTML = section(
    "Deal Details",
    [
      row("From", account?.full_name || "Creator"),
      row("To", deal.brand_name),
      row("Type", deal.collaboration_type),
      row("Confirmed", hasValue(deal.confirmation_date) ? formatDate(deal.confirmation_date) : ""),
    ],
    { first: true }
  );

  const contactHTML = section("Contact", [
    row("POC", deal.poc_name),
    row("Phone", deal.contact_number),
  ]);

  const paymentHTML = section("Payment", [
    row("Mode", deal.payment_mode),
    row("Deadline", hasValue(deal.payment_deadline) ? formatDate(deal.payment_deadline) : ""),
    row("Received", deal.payment_received_amount ? formatINR(deal.payment_received_amount) : ""),
    row(
      "Received Date",
      hasValue(deal.payment_received_date) ? formatDate(deal.payment_received_date) : ""
    ),
  ]);

  const timelineHTML = section("Timeline", [
    row("Content Due", hasValue(deal.content_due_date) ? formatDate(deal.content_due_date) : ""),
    row(
      "Submitted",
      hasValue(deal.content_submitted_date) ? formatDate(deal.content_submitted_date) : ""
    ),
    row("Posted", hasValue(deal.posted_date) ? formatDate(deal.posted_date) : ""),
  ]);

  const invoiceHTML = section("Invoice", [
    // "Sent" is a real yes/no fact whenever a deal exists, not an
    // optional field someone fills in — always shown.
    row("Sent", deal.invoice_sent ? "Yes" : "No"),
    row("Invoice No", deal.invoice_number),
    row("Transaction", deal.transaction_id),
  ]);

  const leftColumnHTML = dealDetailsHTML + contactHTML + paymentHTML;
  const rightColumnHTML = deliverablesHTML + timelineHTML + invoiceHTML;

  const statusChipsHTML = [
    hasValue(deal.deal_status)
      ? `<span class="dp-status-chip" style="background:#DDF7E8;">${deal.deal_status}</span>`
      : "",
    hasValue(deal.payment_status)
      ? `<span class="dp-status-chip" style="background:#FFF2C8;">${deal.payment_status}</span>`
      : "",
  ].join("");

  const footerMetaHTML = [
    deal.id
      ? `<span class="dp-row-label">Deal ID: <b style="color:#151823;">${deal.id.slice(0, 8)}</b></span>`
      : "",
    hasValue(deal.created_at)
      ? `<span class="dp-row-label">Created: <b style="color:#151823;">${formatDate(deal.created_at)}</b></span>`
      : "",
  ]
    .filter(Boolean)
    .join("");

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>${fileTitle}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');

          * { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }

          @page {
            size: A4;
            margin: 0;
          }

          html, body {
            margin: 0;
            padding: 0;
            background: #fff;
            height: 100%;
          }

          body {
            font-family: 'Manrope', -apple-system, BlinkMacSystemFont, sans-serif;
            color: #151823;
            /* Center the pass both horizontally and vertically on the page. */
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
          }

          .dp-pass {
            width: 100%;
            max-width: 680px;
            margin: 0 auto;
            padding: 28px 34px;
            page-break-inside: avoid;
          }

          .dp-brand {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            margin-bottom: 2px;
          }
          .dp-brand img { width: 22px; height: 22px; }
          .dp-brand span {
            letter-spacing: 3px;
            font-weight: 700;
            font-size: 10.5px;
            color: #5B6472;
          }

          .dp-header { text-align: center; margin-bottom: 14px; }
          .dp-brand-name { font-size: 24px; font-weight: 800; margin-top: 8px; }
          .dp-deal-title { margin-top: 3px; color: #5B6472; font-size: 13px; }

          .dp-amount-block { text-align: center; margin-bottom: 12px; }
          .dp-amount-label { font-size: 10.5px; color: #5B6472; letter-spacing: 1px; }
          .dp-amount { font-size: 26px; font-weight: 800; margin-top: 2px; }

          .dp-status-row { text-align: center; margin-bottom: 16px; }
          .dp-status-chip {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 999px;
            font-weight: 700;
            font-size: 10.5px;
            margin: 0 4px;
          }

          .dp-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 0 28px;
          }

          .dp-section {
            border-top: 1px dashed #E7E8EF;
            padding-top: 10px;
            margin-top: 10px;
          }
          .dp-section-title {
            font-size: 9.5px;
            letter-spacing: 1.5px;
            color: #5B6472;
            font-weight: 700;
            margin-bottom: 6px;
            text-transform: uppercase;
          }

          .dp-row { display: flex; justify-content: space-between; gap: 10px; font-size: 11.5px; line-height: 1.6; }
          .dp-row-label { color: #5B6472; font-weight: 600; flex-shrink: 0; }
          .dp-row-value { text-align: right; font-weight: 600; word-break: break-word; }

          .dp-chip {
            display: inline-block;
            padding: 4px 10px;
            border-radius: 999px;
            background: #F7F8FC;
            border: 1px solid #E7E8EF;
            font-weight: 600;
            font-size: 10.5px;
            margin: 0 5px 5px 0;
          }

          .dp-links { display: flex; flex-direction: column; gap: 4px; }
          .dp-links a { color: #2563EB; text-decoration: underline; font-size: 10.5px; word-break: break-all; }

          .dp-notes { font-size: 11.5px; line-height: 1.55; }

          .dp-footer {
            margin-top: 16px;
            padding-top: 12px;
            border-top: 1px dashed #E7E8EF;
            text-align: center;
          }
          .dp-disclaimer { font-size: 8.5px; color: #5B6472; line-height: 1.5; max-width: 480px; margin: 0 auto; }
          .dp-powered { margin-top: 10px; font-size: 9.5px; letter-spacing: 1.5px; font-weight: 700; color: #5B6472; }
        </style>
      </head>

      <body>
        <div class="dp-pass">
          <div class="dp-header">
            <div class="dp-brand">
              <img src="${logoUrl}" alt="DealPass" />
              <span>DEALPASS</span>
            </div>
            ${hasValue(deal.brand_name) ? `<div class="dp-brand-name">${deal.brand_name}</div>` : ""}
            ${hasValue(deal.deal_title) ? `<div class="dp-deal-title">${deal.deal_title}</div>` : ""}
          </div>

          ${
            deal.commercials
              ? `
          <div class="dp-amount-block">
            <div class="dp-amount-label">COMMERCIALS</div>
            <div class="dp-amount">${formatINR(deal.commercials)}</div>
          </div>`
              : ""
          }

          ${statusChipsHTML ? `<div class="dp-status-row">${statusChipsHTML}</div>` : ""}

          <div class="dp-grid">
            <div>${leftColumnHTML}</div>
            <div>${rightColumnHTML}</div>
          </div>

          ${campaignLinksHTML}
          ${notesHTML}

          <div class="dp-footer">
            ${footerMetaHTML ? `<div class="dp-row" style="justify-content:center; gap:24px;">${footerMetaHTML}</div>` : ""}
            <div class="dp-disclaimer">
              <strong>Disclaimer:</strong> This DealPass is generated for personal record-keeping
              purposes only. It is not a legally binding document, contract, invoice, receipt, or
              proof of payment.
            </div>
            <div class="dp-powered">POWERED BY DEALPASS</div>
          </div>
        </div>
      </body>
    </html>`;
}

function DealPreview({ deal, account, onClose }) {
  const previewRef = useRef(null);

  const downloadDealPass = () => {
    if (!deal) {
      alert("DealPass not found.");
      return;
    }

    const brandSlug = (deal?.brand_name || "dealpass")
      .trim()
      .replace(/[^a-zA-Z0-9]+/g, "_");
    const fileTitle = `DealPass_${brandSlug}`;

    // Resolve the imported logo asset to an absolute URL so it still
    // loads correctly inside the print iframe's own document.
    const logoUrl = new URL(logo, window.location.href).href;

    const frame = document.createElement("iframe");
    frame.style.cssText =
      "position:fixed; right:0; bottom:0; width:0; height:0; border:0; visibility:hidden;";
    document.body.appendChild(frame);

    const frameDoc = frame.contentWindow.document;
    frameDoc.open();
    frameDoc.write(buildPrintHTML({ deal, account, fileTitle, logoUrl }));
    frameDoc.close();

    const triggerPrint = () => {
      frame.contentWindow.focus();
      frame.contentWindow.print();
    };

    frame.contentWindow.onafterprint = () => {
      if (frame.parentNode) {
        document.body.removeChild(frame);
      }
    };

    if (frameDoc.fonts && frameDoc.fonts.ready) {
      frameDoc.fonts.ready.then(() => {
        setTimeout(triggerPrint, 250);
      });
    } else {
      setTimeout(triggerPrint, 600);
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

  // A field row that renders nothing at all when the value is empty —
  // used so screen sections can check "did any of my rows render?"
  const Field = ({ label, value }) => (hasValue(value) ? <div><b>{label}:</b> {value}</div> : null);

  const hasDealDetails =
    hasValue(account?.full_name) ||
    hasValue(deal.brand_name) ||
    hasValue(deal.collaboration_type) ||
    hasValue(deal.confirmation_date);

  const hasContact = hasValue(deal.poc_name) || hasValue(deal.contact_number);

  const hasPayment =
    hasValue(deal.payment_mode) ||
    hasValue(deal.payment_deadline) ||
    Boolean(deal.payment_received_amount) ||
    hasValue(deal.payment_received_date);

  const hasTimeline =
    hasValue(deal.content_due_date) ||
    hasValue(deal.content_submitted_date) ||
    hasValue(deal.posted_date);

  const hasInvoice = hasValue(deal.invoice_number) || hasValue(deal.transaction_id);

  const hasPassInfo = hasValue(deal.id) || hasValue(deal.created_at);

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

      {/* Floating Buttons (NOT part of the download/print) */}
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

      {/* On-screen preview — this is what the person sees and scrolls,
          unrelated to the compact print template above. Every section
          below only renders if it actually has at least one filled
          field; empty fields inside a rendered section are skipped too. */}
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
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 8,
              marginBottom: 4,
            }}
          >
            <img src={logo} alt="DealPass" style={{ width: 28, height: 28 }} />
            <span style={{ letterSpacing: 4, fontWeight: 700, fontSize: 12, color: "var(--slate)" }}>
              DEALPASS
            </span>
          </div>
          {hasValue(deal.brand_name) && (
            <div className="dp-display" style={{ marginTop: 12, fontSize: 30, fontWeight: 700 }}>
              {deal.brand_name}
            </div>
          )}
          {hasValue(deal.deal_title) && (
            <div style={{ marginTop: 6, color: "var(--slate)" }}>{deal.deal_title}</div>
          )}
        </div>

        {Boolean(deal.commercials) && (
          <div style={{ textAlign: "center", marginBottom: 22 }}>
            <div style={{ fontSize: 12, color: "var(--slate)" }}>COMMERCIALS</div>
            <div style={{ fontSize: 36, fontWeight: 800, marginTop: 4 }}>
              {formatINR(deal.commercials)}
            </div>
          </div>
        )}

        {(hasValue(deal.deal_status) || hasValue(deal.payment_status)) && (
          <div style={{ marginBottom: 18 }}>
            {hasValue(deal.deal_status) && <span style={chipStyle("#DDF7E8")}>{deal.deal_status}</span>}
            {hasValue(deal.payment_status) && (
              <span style={chipStyle("#FFF2C8")}>{deal.payment_status}</span>
            )}
          </div>
        )}

        {hasDealDetails && (
          <Section title="DEAL DETAILS">
            <Field label="From" value={account?.full_name} />
            <Field label="To" value={deal.brand_name} />
            <Field label="Type" value={deal.collaboration_type} />
            {hasValue(deal.confirmation_date) && (
              <div><b>Confirmed:</b> {formatDate(deal.confirmation_date)}</div>
            )}
          </Section>
        )}

        {(deal.deliverables || []).length > 0 && (
          <Section title="DELIVERABLES">
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {deal.deliverables.map((item, index) => (
                <span key={item.type ?? index} style={chipStyle("var(--paper)")}>
                  {typeof item === "string" ? item : `${item.type} ×${item.qty}`}
                </span>
              ))}
            </div>
          </Section>
        )}

        {hasContact && (
          <Section title="CONTACT">
            <Field label="POC" value={deal.poc_name} />
            <Field label="Phone" value={deal.contact_number} />
          </Section>
        )}

        {hasPayment && (
          <Section title="PAYMENT">
            <Field label="Mode" value={deal.payment_mode} />
            {hasValue(deal.payment_deadline) && (
              <div><b>Deadline:</b> {formatDate(deal.payment_deadline)}</div>
            )}
            {Boolean(deal.payment_received_amount) && (
              <div><b>Received:</b> {formatINR(deal.payment_received_amount)}</div>
            )}
            {hasValue(deal.payment_received_date) && (
              <div><b>Received Date:</b> {formatDate(deal.payment_received_date)}</div>
            )}
          </Section>
        )}

        {hasTimeline && (
          <Section title="TIMELINE">
            {hasValue(deal.content_due_date) && (
              <div><b>Content Due:</b> {formatDate(deal.content_due_date)}</div>
            )}
            {hasValue(deal.content_submitted_date) && (
              <div><b>Submitted:</b> {formatDate(deal.content_submitted_date)}</div>
            )}
            {hasValue(deal.posted_date) && (
              <div><b>Posted:</b> {formatDate(deal.posted_date)}</div>
            )}
          </Section>
        )}

        {deal.campaign_links?.length > 0 && (
          <Section title="CAMPAIGN LINKS">
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {deal.campaign_links.map((link, index) => (
                <a
                  key={index}
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "#2563EB", wordBreak: "break-all", textDecoration: "underline" }}
                >
                  {link}
                </a>
              ))}
            </div>
          </Section>
        )}

        {(hasInvoice || deal.invoice_sent !== undefined) && (
          <Section title="INVOICE">
            <div><b>Sent:</b> {deal.invoice_sent ? "Yes" : "No"}</div>
            <Field label="Invoice No" value={deal.invoice_number} />
            <Field label="Transaction" value={deal.transaction_id} />
          </Section>
        )}

        {hasValue(deal.notes) && (
          <Section title="NOTES">
            <div>{deal.notes}</div>
          </Section>
        )}

        {hasPassInfo && (
          <Section title="PASS INFORMATION">
            {hasValue(deal.id) && <div><b>Deal ID:</b> {deal.id.slice(0, 8)}</div>}
            {hasValue(deal.created_at) && (
              <div><b>Created:</b> {formatDate(deal.created_at)}</div>
            )}

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
        )}
      </div>
    </>
  );
}

export default DealPreview;