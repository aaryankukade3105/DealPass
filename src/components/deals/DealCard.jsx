import { Pencil, Trash2, FileText } from "lucide-react";

import { formatINR, formatDate } from "../../utils/formatters";

import {
  DEAL_STATUS_COLORS,
  PAYMENT_STATUS_COLORS,
  COLLABORATION_TYPE_COLORS,
} from "../../utils/constants";

/* =========================================================
   DealCard styles — boarding pass theme, self-contained.
========================================================= */

const DEAL_CARD_STYLES = `
.bp-card {
  position: relative;
  width: 100%;
  border-radius: 16px;
  background: #FFFFFF;
  border: 1px solid #E5E7EB;
  box-shadow: 0 1px 2px rgba(16, 24, 40, 0.04);
  overflow: hidden;
  transition: box-shadow 0.15s ease, transform 0.15s ease;
}

.bp-card:hover {
  box-shadow: 0 4px 14px rgba(16, 24, 40, 0.08);
  transform: translateY(-1px);
}

.bp-ticket {
  display: flex;
  cursor: pointer;
}

/* ---- Main panel ---- */

.bp-main {
  flex: 1 1 auto;
  min-width: 0;
  padding: 18px 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.bp-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.bp-label {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: #9CA3AF;
  margin: 0 0 3px;
}

.bp-collab {
  font-size: 13px;
  font-weight: 600;
  color: #6B7280;
  margin: 0 0 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.bp-deal-name {
  font-size: 18px;
  font-weight: 700;
  color: var(--ink, #111827);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.bp-pill {
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 999px;
  border: 1px solid transparent;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
}

/* Deliverables */

.bp-deliverables {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.bp-chip {
  padding: 4px 9px;
  border-radius: 7px;
  background: #F3F4F6;
  color: #374151;
  font-size: 11px;
  font-weight: 500;
  white-space: nowrap;
}

.bp-chip--muted {
  background: transparent;
  border: 1px dashed #D1D5DB;
  color: #9CA3AF;
}

/* Confirmation / payment due footer */

.bp-footer {
  display: flex;
  align-items: center;
  gap: 24px;
  padding-top: 12px;
  border-top: 1px dashed #E5E7EB;
}

.bp-footer-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.bp-footer-item--due {
  margin-left: auto;
  text-align: right;
}

.bp-footer-value {
  font-size: 13px;
  font-weight: 700;
  color: var(--ink, #111827);
}

.bp-footer-value--due {
  color: #B45309;
}

/* ---- Perforation between main + stub ---- */

.bp-perforation {
  position: relative;
  flex: 0 0 0;
  width: 0;
  border-left: 2px dashed #D1D5DB;
}

.bp-perforation::before,
.bp-perforation::after {
  content: "";
  position: absolute;
  left: -10px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--page-bg, #F9FAFB);
  border: 1px solid #E5E7EB;
}

.bp-perforation::before {
  top: -10px;
}

.bp-perforation::after {
  bottom: -10px;
}

/* ---- Stub panel ---- */

.bp-stub {
  flex: 0 0 132px;
  padding: 18px 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  text-align: center;
  background: #FAFAFA;
}

.bp-stub-label {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: #9CA3AF;
  margin: 0;
}

.bp-stub-value {
  font-size: 19px;
  font-weight: 700;
  line-height: 1.2;
}

/* ---- Action bar (below the ticket, clearly labeled) ---- */

.bp-actions {
  display: flex;
  border-top: 1px solid #F3F4F6;
}

.bp-action {
  flex: 1 1 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 11px 8px;
  border: none;
  background: #FFFFFF;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s ease;
}

.bp-action + .bp-action {
  border-left: 1px solid #F3F4F6;
}

.bp-action--neutral {
  color: #4B5563;
}
.bp-action--neutral:hover {
  background: #F9FAFB;
}

.bp-action--primary {
  color: #1D4ED8;
}
.bp-action--primary:hover {
  background: #EFF6FF;
}

.bp-action--danger {
  color: #B91C1C;
}
.bp-action--danger:hover {
  background: #FEF2F2;
}
`;

function DealCardStyles() {
  return <style data-deal-card-styles="">{DEAL_CARD_STYLES}</style>;
}

function DealCard({
  deal,
  onClick,
  onEdit,
  onDelete,
  onGenerateInvoice,
  compact,
}) {
  const dealStatus =
    DEAL_STATUS_COLORS?.[deal.deal_status] || {
      bg: "#F3F4F6",
      text: "#4B5563",
      border: "#D1D5DB",
    };

  const isBarter = deal.collaboration_type === "Barter";

  const paymentStatus = isBarter
    ? COLLABORATION_TYPE_COLORS?.Barter || {
        bg: "#F3E8FF",
        text: "#7E22CE",
        border: "#D8B4FE",
      }
    : PAYMENT_STATUS_COLORS?.[deal.payment_status] || {
        bg: "#F3F4F6",
        text: "#4B5563",
        border: "#D1D5DB",
      };

  const isPaid = !isBarter && deal.payment_status === "Paid";

  const deliverables = Array.isArray(deal.deliverables)
    ? deal.deliverables
    : [];

  const showPaymentDue = !isBarter && !isPaid && Boolean(deal.payment_deadline);

  return (
    <div className="bp-card">
      <DealCardStyles />

      <div className="bp-ticket" onClick={onClick}>
        {/* MAIN PANEL */}
        <div className="bp-main">
          <div className="bp-row">
            <div>
              <p className="bp-collab">{deal.brand_name}</p>
              <h3 className="bp-deal-name">
                {deal.deal_name || deal.brand_name}
              </h3>
            </div>

            <span
              className="bp-pill"
              style={{
                color: dealStatus.text,
                background: dealStatus.bg,
                borderColor: dealStatus.border,
              }}
            >
              {deal.deal_status || "Pending"}
            </span>
          </div>

          {deliverables.length > 0 && (
            <div className="bp-deliverables">
              {deliverables.slice(0, 4).map((item, index) => {
                const label =
                  typeof item === "string"
                    ? item
                    : `${item.type || "Deliverable"}${
                        item.qty ? ` ×${item.qty}` : ""
                      }`;

                return (
                  <span key={`${label}-${index}`} className="bp-chip">
                    {label}
                  </span>
                );
              })}

              {deliverables.length > 4 && (
                <span className="bp-chip bp-chip--muted">
                  +{deliverables.length - 4}
                </span>
              )}
            </div>
          )}

          <div className="bp-footer">
            <div className="bp-footer-item">
              <span className="bp-label">Confirmed</span>
              <span className="bp-footer-value">
                {formatDate(deal.confirmation_date)}
              </span>
            </div>

            {showPaymentDue && (
              <div className="bp-footer-item bp-footer-item--due">
                <span className="bp-label">Payment due</span>
                <span className="bp-footer-value bp-footer-value--due">
                  {formatDate(deal.payment_deadline)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* PERFORATION */}
        <div className="bp-perforation" />

        {/* STUB PANEL */}
        <div className="bp-stub">
          <p className="bp-stub-label">Value</p>
          <div
            className="bp-stub-value"
            style={{ color: isBarter ? paymentStatus.text : "var(--ink)" }}
          >
            {isBarter ? "Barter" : formatINR(deal.commercials)}
          </div>

          <span
            className="bp-pill"
            style={{
              color: paymentStatus.text,
              background: paymentStatus.bg,
              borderColor: paymentStatus.border,
            }}
          >
            {isBarter ? "Barter" : deal.payment_status}
          </span>
        </div>
      </div>

      {/* ACTIONS — clearly labeled */}
      {!compact && (
        <div className="bp-actions">
          <button
            type="button"
            className="bp-action bp-action--neutral"
            onClick={(event) => {
              event.stopPropagation();
              onEdit?.(deal);
            }}
          >
            <Pencil size={14} />
            <span>Edit</span>
          </button>

          <button
            type="button"
            className="bp-action bp-action--primary"
            onClick={(event) => {
              event.stopPropagation();
              onGenerateInvoice?.(deal);
            }}
          >
            <FileText size={14} />
            <span>Invoice</span>
          </button>

          <button
            type="button"
            className="bp-action bp-action--danger"
            onClick={(event) => {
              event.stopPropagation();
              onDelete?.(deal);
            }}
          >
            <Trash2 size={14} />
            <span>Delete</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default DealCard;