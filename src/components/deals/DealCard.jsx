import {
  Pencil,
  Trash2,
  FileText,
  Clock3,
  MapPin,
  ArrowUpRight,
} from "lucide-react";

import { formatINR, formatDate } from "../../utils/formatters";

import {
  DEAL_STATUS_COLORS,
  PAYMENT_STATUS_COLORS,
  COLLABORATION_TYPE_COLORS,
} from "../../utils/constants";

function formatDisplayTime(value) {
  if (!value) return "";

  const [h, m] = value.split(":").map(Number);

  if (Number.isNaN(h) || Number.isNaN(m)) {
    return value;
  }

  const period = h >= 12 ? "PM" : "AM";
  const hh = h % 12 === 0 ? 12 : h % 12;

  return `${hh}:${String(m).padStart(2, "0")} ${period}`;
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

  const paymentStatus =
    deal.collaboration_type === "Barter"
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

  const deliverables = Array.isArray(deal.deliverables)
    ? deal.deliverables
    : [];

  const hasShootInfo = Boolean(
    deal.shoot_date || deal.shoot_location
  );

  const isBarter = deal.collaboration_type === "Barter";

  const isPaid =
    !isBarter && deal.payment_status === "Paid";

  return (
    <article
      className="dp-tier-card"
      onClick={onClick}
      style={{
        cursor: onClick ? "pointer" : "default",
      }}
    >
      {/* =====================================================
          MAIN TICKET
      ===================================================== */}

      <div className="dp-tier-main">
        {/* TOP ACCENT */}
        <div
          className="dp-tier-accent"
          style={{
            background: dealStatus.text,
          }}
        />

        {/* ===================================================
            HEADER
        =================================================== */}

        <div className="dp-tier-header">
          <div className="dp-tier-brand-wrap">
            <div className="dp-tier-label">
              COLLABORATION
            </div>

            <div className="dp-tier-brand">
              {deal.brand_name}
            </div>

            {deal.poc_name && (
              <div className="dp-tier-poc">
                {deal.poc_name}

                {deal.contact_number && (
                  <>
                    <span className="dp-tier-meta-dot" />
                    {deal.contact_number}
                  </>
                )}
              </div>
            )}
          </div>

          <div className="dp-tier-commercial">
            <div className="dp-tier-label">
              VALUE
            </div>

            <div
              className="dp-tier-commercial-value"
              style={{
                color: isBarter
                  ? paymentStatus.text
                  : "var(--ink)",
              }}
            >
              {isBarter
                ? "BARTER"
                : formatINR(deal.commercials)}
            </div>
          </div>
        </div>

        {/* ===================================================
            STATUS ROW
        =================================================== */}

        <div className="dp-tier-status-row">
          {deal.deal_status && (
            <span
              className="dp-tier-status"
              style={{
                color: dealStatus.text,
                background: dealStatus.bg,
                borderColor: dealStatus.border,
              }}
            >
              <span
                className="dp-tier-status-dot"
                style={{
                  background: dealStatus.text,
                }}
              />

              {deal.deal_status}
            </span>
          )}

          <span
            className="dp-tier-status"
            style={{
              color: paymentStatus.text,
              background: paymentStatus.bg,
              borderColor: paymentStatus.border,
            }}
          >
            {isBarter ? "Barter" : deal.payment_status}
          </span>
        </div>

        {/* ===================================================
            DELIVERABLES
        =================================================== */}

        {deliverables.length > 0 && (
          <div className="dp-tier-deliverables">
            {deliverables.slice(0, 4).map((item, index) => {
              const label =
                typeof item === "string"
                  ? item
                  : `${item.type || "Deliverable"}${
                      item.qty ? ` ×${item.qty}` : ""
                    }`;

              return (
                <span
                  key={`${label}-${index}`}
                  className="dp-tier-deliverable"
                >
                  {label}
                </span>
              );
            })}

            {deliverables.length > 4 && (
              <span className="dp-tier-more">
                +{deliverables.length - 4}
              </span>
            )}
          </div>
        )}

        {/* ===================================================
            INFORMATION GRID
        =================================================== */}

        <div className="dp-tier-info">
          <div className="dp-tier-info-item">
            <span className="dp-tier-info-label">
              CONFIRMED
            </span>

            <span className="dp-tier-info-value">
              {formatDate(deal.confirmation_date)}
            </span>
          </div>

          {deal.confirmation_mode && (
            <div className="dp-tier-info-item">
              <span className="dp-tier-info-label">
                VIA
              </span>

              <span className="dp-tier-info-value">
                {deal.confirmation_mode}
              </span>
            </div>
          )}

          {hasShootInfo && deal.shoot_date && (
            <div className="dp-tier-info-item">
              <span className="dp-tier-info-label">
                SHOOT
              </span>

              <span className="dp-tier-info-value dp-tier-inline">
                <Clock3 size={11} />

                {formatDate(deal.shoot_date)}

                {deal.shoot_time &&
                  ` · ${formatDisplayTime(
                    deal.shoot_time
                  )}`}
              </span>
            </div>
          )}

          {hasShootInfo && deal.shoot_location && (
            <div className="dp-tier-info-item dp-tier-location">
              <span className="dp-tier-info-label">
                LOCATION
              </span>

              <span className="dp-tier-info-value dp-tier-inline">
                <MapPin size={11} />

                <span>
                  {deal.shoot_location}
                </span>
              </span>
            </div>
          )}
        </div>

        {/* ===================================================
            ACTION BAR
        =================================================== */}

        {!compact && (
          <div className="dp-tier-actions">
            <button
              type="button"
              className="dp-tier-action dp-tier-action-neutral"
              onClick={(event) => {
                event.stopPropagation();
                onEdit?.(deal);
              }}
            >
              <Pencil size={13} />
              <span>Edit deal</span>
            </button>

            <button
              type="button"
              className="dp-tier-action dp-tier-action-primary"
              onClick={(event) => {
                event.stopPropagation();
                onGenerateInvoice?.(deal);
              }}
            >
              <FileText size={13} />
              <span>Invoice</span>
            </button>

            <button
              type="button"
              className="dp-tier-action dp-tier-action-danger"
              onClick={(event) => {
                event.stopPropagation();
                onDelete?.(deal);
              }}
            >
              <Trash2 size={13} />
              <span>Delete</span>
            </button>
          </div>
        )}
      </div>

      {/* =====================================================
          RIGHT TICKET STUB
      ===================================================== */}

      <aside className="dp-tier-stub">
        {/* PERFORATION */}
        <div className="dp-tier-perforation" />

        <div className="dp-tier-stub-content">
          <div className="dp-tier-stub-label">
            DEALPASS
          </div>

          <div
            className="dp-tier-stamp"
            style={{
              color: dealStatus.text,
              borderColor: dealStatus.border,
              background: dealStatus.bg,
            }}
          >
            {deal.deal_status || "PENDING"}
          </div>

          <div className="dp-tier-stub-divider" />

          <div className="dp-tier-stub-data">
            <span>
              {isPaid
                ? "PAYMENT"
                : isBarter
                ? "TYPE"
                : "PAYMENT DUE"}
            </span>

            <strong
              style={{
                color: isPaid
                  ? "#15803D"
                  : isBarter
                  ? paymentStatus.text
                  : deal.payment_deadline
                  ? paymentStatus.text
                  : "var(--slate)",
              }}
            >
              {isPaid
                ? "PAID"
                : isBarter
                ? "BARTER"
                : deal.payment_deadline
                ? formatDate(deal.payment_deadline)
                : "—"}
            </strong>
          </div>
        </div>

        {onClick && (
          <div className="dp-tier-arrow">
            <ArrowUpRight size={14} />
          </div>
        )}
      </aside>
    </article>
  );
}

export default DealCard;