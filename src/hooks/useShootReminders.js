import { useCallback, useEffect, useRef, useState } from "react";

const CHECK_AGAIN_MS = 60 * 60 * 1000; // ask again after 1 hour if "in progress"
const POLL_MS = 15000;                 // check every 15s

function getShootDateTime(deal) {
  if (!deal.shoot_date || !deal.shoot_time) return null;
  const dt = new Date(`${deal.shoot_date}T${deal.shoot_time}`);
  return isNaN(dt.getTime()) ? null : dt;
}

const UNRESOLVED_STATUSES = ["Not Scheduled", "Scheduled", "Rescheduled"];

function isEligible(deal) {
  if (!deal.shoot_date || !deal.shoot_time) return false;
  if (deal.deal_status === "Cancelled" || deal.deal_status === "Completed") return false;
  const status = deal.shoot_status || "Scheduled";
  return UNRESOLVED_STATUSES.includes(status);
}

/**
 * Purely time-driven reminders based on shoot_date + shoot_time:
 *
 *  - alertDeal: the shoot whose time has arrived (banner, non-blocking).
 *  - checkinDeal: the shoot that needs "shoot in progress?" answered
 *    right now (blocking popup) — either 1 min after shoot time, or
 *    1 hour after the user last said "still in progress".
 *  - hiddenDealIds: deal ids that should be removed from the dashboard
 *    schedule — either because the user marked Completed, or because
 *    Postponed/Cancelled was chosen more than 1 hour ago.
 */
export function useShootReminders(deals, updateShootStatus) {
  const [alertDeal, setAlertDeal] = useState(null);
  const [checkinDeal, setCheckinDeal] = useState(null);
  const [hiddenDealIds, setHiddenDealIds] = useState(new Set());
  const dismissedAlertIds = useRef(new Set());

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

/* Before shoot */
if (now < shootTime) continue;

/* Exactly at shoot time -> Banner */
if (
  now >= shootTime &&
  now < shootTime + 60000 &&
  !dismissedAlertIds.current.has(deal.id)
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
    if (alertDeal) dismissedAlertIds.current.add(alertDeal.id);
    setAlertDeal(null);
  }, [alertDeal]);

const markInProgress = useCallback(async () => {
  if (!checkinDeal) return;

  await updateShootStatus(checkinDeal.id, "In Progress");

  setCheckinDeal(null);
}, [checkinDeal, updateShootStatus]);

  // status: "Shot" | "Rescheduled" | "Cancelled"
 const resolveCheckin = useCallback(() => {
  if (!checkinDeal) return;

  clearDealState(checkinDeal.id);

  setCheckinDeal(null);
}, [checkinDeal]);

  return {
    alertDeal,
    dismissAlert,
    checkinDeal,
    markInProgress,
    resolveCheckin,
    hiddenDealIds,
  };
}