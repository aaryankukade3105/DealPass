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

  // IMPORTANT: pendingRevenue and overdueRevenue are each driven strictly by
  // the explicit `payment_status` field the user set on the deal (same field
  // the ChipSelect writes to), not by re-deriving "is this overdue?" from
  // dates. Previously overdueRevenue was computed from `payment_deadline`
  // alone, which meant a deal the user had explicitly marked "Pending" (but
  // whose deadline had quietly passed) got counted as overdue revenue too —
  // so Pending and Overdue totals overlapped and looked identical. Keying
  // strictly off payment_status keeps the two mutually exclusive and in
  // sync with whatever status the user actually chose in the form.
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

  // Outstanding balance still owed on Partially Paid deals — not shown as
  // its own stat card yet, but useful for a true payment-health picture.
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

  // ---- Payment Health Score ----
  // A single 0-100 score that's more informative than collection rate alone:
  // two creators with identical collection rates but different overdue-deal
  // counts should NOT look equally healthy. Each overdue deal knocks points
  // off the base collection rate (capped), and a few outstanding partial
  // payments knock off a little more. This is intentionally specific to how
  // brand-deal payment cycles behave, not a generic "% paid" number.
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