import { formatINR } from "./formatters";

export function daysBetween(dateStr) {
  if (!dateStr) return Infinity;

  const d = new Date(dateStr);

  if (isNaN(d.getTime())) return Infinity;

  const today = new Date();

  today.setHours(0, 0, 0, 0);
  d.setHours(0, 0, 0, 0);

  return Math.floor((today - d) / 86400000);
}

// Combines shoot_date + shoot_time into a real Date so we can tell whether
// a shoot is still ahead of us or has already started/passed. If no time
// was set, we treat the shoot as "due" only once the day itself is over
// (23:59), so we don't nag mid-morning for a shoot with an unset time.
function getShootDateTime(deal) {
  if (!deal.shoot_date) return null;

  const time = deal.shoot_time || "23:59";
  const dt = new Date(`${deal.shoot_date}T${time}`);

  return isNaN(dt.getTime()) ? null : dt;
}

// Statuses that mean "this shoot still needs a decision" — anything else
// (Shot / Cancelled) is considered resolved and won't trigger reminders.
const UNRESOLVED_SHOOT_STATUSES = ["Not Scheduled", "Scheduled", "Rescheduled"];

export function computeStats(deals) {
  const totalEarnings = deals
    .filter((d) => d.payment_status === "Paid")
    .reduce(
      (sum, d) =>
        sum +
        (Number(d.payment_received_amount) ||
          Number(d.commercials) ||
          0),
      0
    );

  const earnings = {};

  [15, 30, 60].forEach((days) => {
    earnings[days] = deals
      .filter((d) => {
        if (d.payment_status !== "Paid") return false;

        if (!d.payment_received_date) return false;

        const diff = daysBetween(d.payment_received_date);

        return diff >= 0 && diff <= days;
      })
      .reduce(
        (sum, d) =>
          sum +
          (Number(d.payment_received_amount) ||
            Number(d.commercials) ||
            0),
        0
      );
  });

  const dealCounts = {
    7: 0,
    15: 0,
    30: 0,
    60: 0,
    90: 0,
    total: deals.length,
  };

  deals.forEach((deal) => {
    if (!deal.confirmation_date) return;

    const diff = daysBetween(deal.confirmation_date);

    if (diff >= 0 && diff <= 7) dealCounts[7]++;
    if (diff >= 0 && diff <= 15) dealCounts[15]++;
    if (diff >= 0 && diff <= 30) dealCounts[30]++;
    if (diff >= 0 && diff <= 60) dealCounts[60]++;
    if (diff >= 0 && diff <= 90) dealCounts[90]++;
  });

  const pendingCollabs = deals.filter(
    (d) => d.deal_status !== "Completed"
  ).length;

  const pendingPayments = deals.filter(
    (d) => d.payment_status !== "Paid" && d.payment_status !== "Barter"
  ).length;

  const pendingRevenue = {};

  [15, 30, 60].forEach((days) => {
    pendingRevenue[days] = deals
      .filter((d) => {
        if (d.collaboration_type !== "Paid") return false;
        if (d.payment_status !== "Pending") return false;
        if (!d.confirmation_date) return false;

        const diff = daysBetween(d.confirmation_date);

        return diff >= 0 && diff <= days;
      })
      .reduce((sum, d) => sum + (Number(d.commercials) || 0), 0);
  });

  pendingRevenue.total = deals
    .filter(
      (d) => d.collaboration_type === "Paid" && d.payment_status === "Pending"
    )
    .reduce((sum, d) => sum + (Number(d.commercials) || 0), 0);

  const overdueDeals = deals.filter(
    (d) => d.collaboration_type === "Paid" && d.payment_status === "Overdue"
  );

  const overdueRevenue = overdueDeals.reduce(
    (sum, d) => sum + (Number(d.commercials) || 0),
    0
  );

  const overdueCount = overdueDeals.length;

  const partiallyPaidOutstanding = deals
    .filter((d) => d.payment_status === "Partially Paid")
    .reduce(
      (sum, d) =>
        sum +
        Math.max(
          (Number(d.commercials) || 0) - (Number(d.payment_received_amount) || 0),
          0
        ),
      0
    );

  const totalCommercials = deals
    .filter((d) => d.collaboration_type === "Paid")
    .reduce((sum, d) => sum + (Number(d.commercials) || 0), 0);

  const collectionRate =
    totalCommercials === 0
      ? 0
      : Math.round((totalEarnings / totalCommercials) * 100);

  const OVERDUE_PENALTY_PER_DEAL = 8;
  const MAX_OVERDUE_PENALTY = 55;
  const PARTIAL_PENALTY_PER_DEAL = 3;
  const MAX_PARTIAL_PENALTY = 15;

  const partiallyPaidCount = deals.filter(
    (d) => d.payment_status === "Partially Paid"
  ).length;

  const overduePenalty = Math.min(
    overdueCount * OVERDUE_PENALTY_PER_DEAL,
    MAX_OVERDUE_PENALTY
  );
  const partialPenalty = Math.min(
    partiallyPaidCount * PARTIAL_PENALTY_PER_DEAL,
    MAX_PARTIAL_PENALTY
  );

  const rawScore =
    totalCommercials === 0 ? null : collectionRate - overduePenalty - partialPenalty;

  const healthScore =
    rawScore === null ? null : Math.max(0, Math.min(100, Math.round(rawScore)));

  let healthLabel = "No Paid Deals Yet";
  let healthColor = "#94A3B8";

  if (healthScore !== null) {
    if (healthScore >= 85) {
      healthLabel = "Excellent";
      healthColor = "#16A34A";
    } else if (healthScore >= 65) {
      healthLabel = "Good";
      healthColor = "#65A30D";
    } else if (healthScore >= 40) {
      healthLabel = "Fair";
      healthColor = "#D97706";
    } else {
      healthLabel = "Needs Attention";
      healthColor = "#DC2626";
    }
  }

  const healthBarTotal = totalEarnings + pendingRevenue.total + overdueRevenue;

  const paymentHealth = {
    score: healthScore,
    label: healthLabel,
    color: healthColor,
    overdueCount,
    partiallyPaidCount,
    partiallyPaidOutstanding,
    segments: {
      paid: totalEarnings,
      pending: pendingRevenue.total,
      overdue: overdueRevenue,
    },
    segmentPercents:
      healthBarTotal === 0
        ? { paid: 0, pending: 0, overdue: 0 }
        : {
            paid: (totalEarnings / healthBarTotal) * 100,
            pending: (pendingRevenue.total / healthBarTotal) * 100,
            overdue: (overdueRevenue / healthBarTotal) * 100,
          },
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingShoots = deals
    .filter((d) => {
      if (d.deal_status !== "Confirmed") return false;
      if (!d.shoot_date) return false;

      const shoot = new Date(d.shoot_date);
      shoot.setHours(0, 0, 0, 0);

      return shoot >= today;
    })
    .sort((a, b) => new Date(a.shoot_date) - new Date(b.shoot_date));

  const todaysShoots = upcomingShoots.filter((d) => {
    const shoot = new Date(d.shoot_date);
    shoot.setHours(0, 0, 0, 0);

    return shoot.getTime() === today.getTime();
  });

  const upcomingThisWeek = upcomingShoots.filter((d) => {
    const shoot = new Date(d.shoot_date);
    shoot.setHours(0, 0, 0, 0);

    const diff = (shoot - today) / 86400000;

    return diff >= 0 && diff <= 7;
  });

  const overdueShoots = deals.filter((d) => {
    if (d.deal_status !== "Confirmed") return false;
    if (!d.shoot_date) return false;

    const shoot = new Date(d.shoot_date);
    shoot.setHours(0, 0, 0, 0);

    return shoot < today;
  });

  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const todaysAgenda = upcomingShoots.filter((d) => {
    const shoot = new Date(d.shoot_date);
    shoot.setHours(0, 0, 0, 0);

    return shoot.getTime() === today.getTime();
  });

  const tomorrowsAgenda = upcomingShoots.filter((d) => {
    const shoot = new Date(d.shoot_date);
    shoot.setHours(0, 0, 0, 0);

    return shoot.getTime() === tomorrow.getTime();
  });

  const futureAgenda = upcomingShoots.filter((d) => {
    const shoot = new Date(d.shoot_date);
    shoot.setHours(0, 0, 0, 0);

    return shoot > tomorrow;
  });

  // ---- Shoot reminders (new) ----
  // Any deal with a shoot_date whose shoot_status hasn't been resolved yet
  // (still "Not Scheduled" / "Scheduled" / "Rescheduled") and whose deal
  // hasn't been cancelled/completed is a candidate for a reminder.
  const now = new Date();

  const shootsPendingAction = deals.filter((d) => {
    if (!d.shoot_date) return false;
    if (d.deal_status === "Cancelled" || d.deal_status === "Completed") return false;

    const status = d.shoot_status || "Scheduled";

    return UNRESOLVED_SHOOT_STATUSES.includes(status);
  });

  // Shoot time has arrived or already passed — ask "did the shoot happen?"
  const dueShootReminders = shootsPendingAction
    .filter((d) => {
      const dt = getShootDateTime(d);
      if (!dt) return false;

      return dt <= now;
    })
    .sort((a, b) => getShootDateTime(a) - getShootDateTime(b));

  // Shoot is scheduled for today but hasn't started yet — a heads-up only.
  const upcomingTodayReminders = shootsPendingAction
    .filter((d) => {
      const dt = getShootDateTime(d);
      if (!dt) return false;

      const shootDay = new Date(d.shoot_date);
      shootDay.setHours(0, 0, 0, 0);

      return shootDay.getTime() === today.getTime() && dt > now;
    })
    .sort((a, b) => getShootDateTime(a) - getShootDateTime(b));

  const recentDeal =
    [...deals].sort(
      (a, b) =>
        new Date(b.confirmation_date) -
        new Date(a.confirmation_date)
    )[0] || null;

  return {
    totalEarnings,
    earnings,
    dealCounts,
    pendingCollabs,
    pendingPayments,
    pendingRevenue,
    overdueRevenue,
    overdueCount,
    partiallyPaidOutstanding,
    collectionRate,
    paymentHealth,

    upcomingShoots,
    todaysShoots,
    upcomingThisWeek,
    overdueShoots,
    todaysAgenda,
    tomorrowsAgenda,
    futureAgenda,

    dueShootReminders,
    upcomingTodayReminders,

    recentDeal,
  };
}

export function buildChartData(deals) {
  const weeks = 8;

  const today = new Date();

  today.setHours(0, 0, 0, 0);

  const buckets = Array.from(
    { length: weeks },
    () => 0
  );

  deals.forEach((d) => {
    if (d.payment_status !== "Paid") return;

    if (!d.payment_received_date) return;

    const date = new Date(d.payment_received_date);

    if (isNaN(date)) return;

    const diffDays = Math.floor(
      (today - date) / 86400000
    );

    if (diffDays < 0 || diffDays > weeks * 7) return;

    const index =
      weeks - 1 - Math.floor(diffDays / 7);

    if (index >= 0 && index < weeks) {
      buckets[index] +=
        Number(d.payment_received_amount) ||
        Number(d.commercials) ||
        0;
    }
  });

  return buckets.map((value, index) => ({
    label:
      index === weeks - 1
        ? "This wk"
        : `${weeks - index}w`,
    value,
  }));
}