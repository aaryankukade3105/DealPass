import React, { useState } from "react";
import {
  Clapperboard,
  Clock,
  MapPin,
  CheckCircle2,
  CalendarClock,
  XCircle,
  Bell,
} from "lucide-react";

function formatTime(time) {
  if (!time) return "Time not set";
  return new Date(`1970-01-01T${time}`).toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function ShootReminderModal({
  checkinDeal,
  updateShootStatus,
  onInProgress,
  onResolve,
}){
  const [busy, setBusy] = useState(false);

  if (!checkinDeal) return null;

  const act = async (fn) => {
    setBusy(true);
    try {
      await fn();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15,15,20,.55)",
        zIndex: 200,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
      }}
    >
      <div
        className="dp-card"
        style={{
          width: "100%",
          maxWidth: 480,
          borderRadius: "20px 20px 0 0",
          padding: 24,
          paddingBottom: "max(24px, env(safe-area-inset-bottom))",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: "#EDE9FE",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Clapperboard size={20} color="#7C3AED" strokeWidth={2.4} />
          </div>
          <div>
            <div className="dp-display" style={{ fontSize: 17, fontWeight: 800 }}>
              Shoot in progress?
            </div>
            <div style={{ fontSize: 12.5, color: "var(--slate)" }}>
              {checkinDeal.brand_name} • {checkinDeal.deal_title}
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 6,
            padding: "12px 14px",
            borderRadius: 12,
            background: "rgba(124,58,237,.06)",
            marginBottom: 18,
            fontSize: 13,
            color: "var(--ink)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Clock size={14} color="#7C3AED" />
            Was scheduled for {formatTime(checkinDeal.shoot_time)}
          </div>
          {checkinDeal.shoot_location && (
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <MapPin size={14} color="#7C3AED" />
              {checkinDeal.shoot_location}
            </div>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <button
            type="button"
            disabled={busy}
            onClick={() => act(async () => onInProgress())}
            className="dp-btn-signal"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              background: "#7C3AED",
            }}
          >
            Yes, still shooting, ask again in 1hr
          </button>

          <button
            type="button"
            disabled={busy}
onClick={() =>
  act(async () => {
    await updateShootStatus(checkinDeal.id, "Shot");
    onResolve();
  })
}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              padding: "12px 16px",
              borderRadius: 12,
              border: "1px solid #BBF7D0",
              background: "#F0FDF4",
              color: "#166534",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            <CheckCircle2 size={18} />
            Completed
          </button>

          <button
            type="button"
            disabled={busy}
           onClick={() =>
  act(async () => {
    await updateShootStatus(checkinDeal.id, "Rescheduled", {
      shoot_date: null,
      shoot_time: null,
    });
    onResolve();
  })
}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              padding: "12px 16px",
              borderRadius: 12,
              border: "1px solid var(--line)",
              background: "transparent",
              color: "var(--ink)",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            <CalendarClock size={18} />
            Postponed
          </button>

          <button
            type="button"
            disabled={busy}
         onClick={() =>
  act(async () => {
    await updateShootStatus(checkinDeal.id, "Cancelled");
    onResolve();
  })
}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              padding: "12px 16px",
              borderRadius: 12,
              border: "1px solid var(--line)",
              background: "transparent",
              color: "#DC2626",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            <XCircle size={18} />
            Cancelled
          </button>
        </div>
      </div>
    </div>
  );
}

/** Non-blocking banner shown exactly at shoot time. */
export function ShootNowBanner({ deal, onDismiss }) {
  if (!deal) return null;

  return (
    <div
      className="dp-card"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: 14,
        marginBottom: 16,
        border: "1px solid #FCA5A5",
        background: "#FEF2F2",
      }}
    >
      <div
        style={{
          width: 38,
          height: 38,
          borderRadius: 10,
          background: "#FEE2E2",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Bell size={18} color="#DC2626" strokeWidth={2.4} />
      </div>

      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: "#B91C1C" }}>
          Shoot time: {deal.brand_name}
        </div>
        <div style={{ fontSize: 12, color: "var(--slate)" }}>
          {formatTime(deal.shoot_time)}
          {deal.shoot_location ? ` • ${deal.shoot_location}` : ""}
        </div>
      </div>

      <button
        type="button"
        onClick={onDismiss}
        style={{
          background: "none",
          border: "none",
          color: "#DC2626",
          fontWeight: 700,
          fontSize: 12.5,
          cursor: "pointer",
          flexShrink: 0,
        }}
      >
        Got it
      </button>
    </div>
  );
}

export default ShootReminderModal;