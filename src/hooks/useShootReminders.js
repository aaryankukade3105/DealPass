import { useCallback, useEffect, useRef, useState } from "react";

const POLL_MS = 15000; // check every 15s

function getShootDateTime(deal) {
  if (!deal.shoot_date || !deal.shoot_time) return null;
  const dt = new Date(`${deal.shoot_date}T${deal.shoot_time}`);
  return isNaN(dt.getTime()) ? null : dt;
}

// "In Progress" belongs here too — it still needs a follow-up check-in
// once shoot_next_check_at passes. Excluding it was what silently broke
// the "ask again in 1hr" flow.
const UNRESOLVED_STATUSES = ["Scheduled", "Rescheduled", "In Progress"];

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

    // Silently clear any "Cancelled" shoot whose 1hr grace window has
    // passed — no popup, just resets it back to a clean slate so it
    // drops off the dashboard.
    deals.forEach((deal) => {
      const status = deal.shoot_status || "Scheduled";
      if (
        status === "Cancelled" &&
        deal.shoot_next_check_at &&
        now >= new Date(deal.shoot_next_check_at).getTime()
      ) {
        updateShootStatus(deal.id, "Not Scheduled", {
          shoot_date: null,
          shoot_time: null,
        });
      }
    });
    const nextHidden = new Set();
    let nextAlert = null;
    let nextCheckin = null;

    // Process shoots earliest-first so, if several are overdue at once,
    // the *earliest* one always wins the single alert/check-in slot —
    // instead of whichever happened to sit last in the deals array.
    const eligible = deals
      .filter(isEligible)
      .map((deal) => ({ deal, dt: getShootDateTime(deal) }))
      .filter((entry) => entry.dt)
      .sort((a, b) => a.dt - b.dt);

    for (const { deal, dt } of eligible) {
      const shootTime = dt.getTime();
      // Normalize once, and use this everywhere below — this is what
      // isEligible() already assumed, so the two now agree.
      const status = deal.shoot_status || "Scheduled";
      const reminderKey = `${deal.id}-${deal.shoot_date}-${deal.shoot_time}`;

      /* Before shoot time — nothing to do yet. */
      if (now < shootTime) continue;

      /* Exactly at shoot time -> one-time, non-blocking banner. */
      if (
        now < shootTime + 60000 &&
        !dismissedAlerts.current.has(reminderKey)
      ) {
        if (!nextAlert) {
          nextAlert = deal;
          nextHidden.add(deal.id);
        }
        continue;
      }

      /* Scheduled or Rescheduled, past the 1-min grace window ->
         ask whether the shoot actually happened. */
      if (
        (status === "Scheduled" || status === "Rescheduled") &&
        now >= shootTime + 60000
      ) {
        if (!nextCheckin) {
          nextCheckin = deal;
          nextHidden.add(deal.id);
        }
        continue;
      }

      /* In Progress -> ask again once shoot_next_check_at has passed. */
      if (
        status === "In Progress" &&
        deal.shoot_next_check_at &&
        now >= new Date(deal.shoot_next_check_at).getTime()
      ) {
        if (!nextCheckin) {
          nextCheckin = deal;
          nextHidden.add(deal.id);
        }
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
      const reminderKey = `${alertDeal.id}-${alertDeal.shoot_date}-${alertDeal.shoot_time}`;
      dismissedAlerts.current.add(reminderKey);
    }
    setAlertDeal(null);
  }, [alertDeal]);

  const markInProgress = useCallback(async () => {
    if (!checkinDeal) return;
    await updateShootStatus(checkinDeal.id, "In Progress");
    setCheckinDeal(null);
  }, [checkinDeal, updateShootStatus]);

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