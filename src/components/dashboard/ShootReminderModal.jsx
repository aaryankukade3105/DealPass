import React, { useState } from "react";
import {
  Clapperboard,
  Clock,
  MapPin,
  CheckCircle2,
  CalendarClock,
  XCircle,
  Bell,
  ArrowLeft,
  HelpCircle,
} from "lucide-react";
import DateField from "../common/DateField";
import { TimeField } from "../deals/DealFormSheet";

function formatTime(time) {
  if (!time) return "Time not set";
  return new Date(`1970-01-01T${time}`).toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  });
}

// Tomorrow, as YYYY-MM-DD — postponing to "today" isn't really postponing.
function tomorrowStr() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

const ACTION_BTN_STYLE = `
.srm-btn {
  transition: transform .1s ease, opacity .1s ease, filter .1s ease;
}
.srm-btn:active {
  transform: scale(0.96);
  filter: brightness(0.96);
}
.srm-btn:disabled {
  opacity: 0.6;
}
`;

function ShootReminderModal({
  checkinDeal,
  updateShootStatus,
  onInProgress,
  onResolve,
}) {
  const [busy, setBusy] = useState(false);
  // "menu" = the default four options, "postpone" = the date+time sub-step
  const [view, setView] = useState("menu");
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");

  if (!checkinDeal) return null;

  const act = async (fn) => {
    setBusy(true);
    try {
      await fn();
    } finally {
      setBusy(false);
    }
  };

  const closeAndReset = () => {
    setView("menu");
    setNewDate("");
    setNewTime("");
  };

  const confirmNewDate = () =>
    act(async () => {
      await updateShootStatus(checkinDeal.id, "Scheduled", {
        shoot_date: newDate,
        shoot_time: newTime,
      });
      closeAndReset();
      onResolve();
    });

  const confirmDateTBD = () =>
    act(async () => {
      await updateShootStatus(checkinDeal.id, "Not Scheduled", {
        shoot_date: null,
        shoot_time: null,
      });
      closeAndReset();
      onResolve();
    });

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
      <style>{ACTION_BTN_STYLE}</style>

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
        {view === "menu" ? (
          <>
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
                className="dp-btn-signal srm-btn"
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
                className="srm-btn"
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
                onClick={() => {
                  setNewDate(tomorrowStr());
                  setNewTime(checkinDeal.shoot_time || "");
                  setView("postpone");
                }}
                className="srm-btn"
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
                className="srm-btn"
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
          </>
        ) : (
          /* ---------- Postpone sub-step: pick a new date + time ---------- */
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <button
                type="button"
                onClick={closeAndReset}
                disabled={busy}
                className="srm-btn"
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  border: "1px solid var(--line)",
                  background: "transparent",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  flexShrink: 0,
                }}
                aria-label="Back"
              >
                <ArrowLeft size={16} />
              </button>
              <div>
                <div className="dp-display" style={{ fontSize: 17, fontWeight: 800 }}>
                  When's the new shoot?
                </div>
                <div style={{ fontSize: 12.5, color: "var(--slate)" }}>
                  {checkinDeal.brand_name} • {checkinDeal.deal_title}
                </div>
              </div>
            </div>

            <label
              style={{
                display: "block",
                fontSize: 12,
                fontWeight: 700,
                color: "var(--slate)",
                marginBottom: 6,
              }}
            >
              New shoot date
            </label>

            <div style={{ marginBottom: 14 }}>
              <DateField
                value={newDate}
                onChange={setNewDate}
                minDate={tomorrowStr()}
                placeholder="Select new shoot date"
              />
            </div>

            <label
              style={{
                display: "block",
                fontSize: 12,
                fontWeight: 700,
                color: "var(--slate)",
                marginBottom: 6,
              }}
            >
              New shoot time
            </label>

            <div style={{ marginBottom: 14 }}>
              <TimeField
                value={newTime}
                onChange={setNewTime}
                placeholder="Select shoot time"
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <button
                type="button"
                disabled={busy || !newDate || !newTime}
                onClick={confirmNewDate}
                className="dp-btn-signal srm-btn"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                <CalendarClock size={18} />
                Reschedule to this date & time
              </button>

              <button
                type="button"
                disabled={busy}
                onClick={confirmDateTBD}
                className="srm-btn"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  padding: "12px 16px",
                  borderRadius: 12,
                  border: "1px solid var(--line)",
                  background: "transparent",
                  color: "var(--slate)",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                <HelpCircle size={18} />
                Date yet to decide
              </button>
            </div>
          </>
        )}
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