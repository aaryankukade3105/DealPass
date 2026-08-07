import { useCallback, useEffect, useRef, useState } from "react";

const CHECK_AGAIN_MS = 60 * 60 * 1000; // ask again after 1 hour if "in progress"
const POLL_MS = 15000;                 // check every 15s

function getShootDateTime(deal) {
  if (!deal.shoot_date || !deal.shoot_time) return null;
  const dt = new Date(`${deal.shoot_date}T${deal.shoot_time}`);
  return isNaN(dt.getTime()) ? null : dt;
}
const UNRESOLVED_STATUSES = [
  "Scheduled",
  "Rescheduled",
];

function isEligible(deal) {
  if (!deal.shoot_date || !deal.shoot_time) return false;
  if (deal.deal_status === "Cancelled" || deal.deal_status === "Completed") return false;
  const status = deal.shoot_status || "Scheduled";
  return UNRESOLVED_STATUSES.includes(status);
}

export function useShootReminders(deals, updateShootStatus) {
  const [alertDeal, setAlertDeal] = useState(null);
  const [checkinDeal, setCheckinDeal] = useState(null);
  const [hiddenDealIds, setHiddenDealIds] = useState(new Set());
  const dismissedAlerts = useRef(new Set());

  const tick = useCallback(() => {
    const now = Date.now();
    const nextHidden = new Set();
    let nextAlert = null;
    let nextCheckin = null;

    for (const deal of deals) {
      const dt = getShootDateTime(deal);
      if (!dt) continue;


     if (!isEligible(deal)) continue;

const shootTime = dt.getTime();
const reminderKey = `${deal.id}-${deal.shoot_date}-${deal.shoot_time}`;
/* Before shoot */
if (now < shootTime) continue;

/* Exactly at shoot time -> Banner */
if (
  now >= shootTime &&
  now < shootTime + 60000 &&
  !dismissedAlerts.current.has(reminderKey)
) {
  nextAlert = deal;
  continue;
}
/* Scheduled -> Popup after 1 minute */
if (
  deal.shoot_status === "Scheduled" &&
  now >= shootTime + 60000
) {
  nextCheckin = nextCheckin || deal;
  continue;
}

/* In Progress -> Ask again after next_check_at */
if (
  deal.shoot_status === "In Progress" &&
  deal.shoot_next_check_at &&
  now >= new Date(deal.shoot_next_check_at).getTime()
) {
  nextCheckin = nextCheckin || deal;
}
    }

    setHiddenDealIds(nextHidden);
    setAlertDeal(nextAlert);
    if (nextCheckin) setCheckinDeal(nextCheckin);
  }, [deals]);

  useEffect(() => {
    tick();
    const id = setInterval(tick, POLL_MS);
    return () => clearInterval(id);
  }, [tick]);

 const dismissAlert = useCallback(() => {
  if (alertDeal) {
    const reminderKey =
      `${alertDeal.id}-${alertDeal.shoot_date}-${alertDeal.shoot_time}`;

    dismissedAlerts.current.add(reminderKey);
  }

  setAlertDeal(null);
}, [alertDeal]);

const markInProgress = useCallback(async () => {
  if (!checkinDeal) return;

  await updateShootStatus(checkinDeal.id, "In Progress");

  setCheckinDeal(null);
}, [checkinDeal, updateShootStatus]);

  // status: "Shot" | "Rescheduled" | "Cancelled"
const resolveCheckin = useCallback(() => {
  setCheckinDeal(null);
}, []);

  return {
    alertDeal,
    dismissAlert,
    checkinDeal,
    markInProgress,
    resolveCheckin,
    hiddenDealIds,
  };
}