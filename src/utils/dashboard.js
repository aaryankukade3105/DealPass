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
    (d) => d.payment_status !== "Paid"
  ).length;
const pendingRevenue = {};

[15, 30, 60].forEach((days) => {
  pendingRevenue[days] = deals
    .filter((d) => {
      if (d.collaboration_type !== "Paid") return false;

      if (d.payment_status === "Paid") return false;

      if (!d.confirmation_date) return false;

      const diff = daysBetween(d.confirmation_date);

      return diff >= 0 && diff <= days;
    })
    .reduce(
      (sum, d) => sum + (Number(d.commercials) || 0),
      0
    );
});

pendingRevenue.total = deals
  .filter(
    (d) =>
      d.collaboration_type === "Paid" &&
      d.payment_status !== "Paid"
  )
  .reduce(
    (sum, d) => sum + (Number(d.commercials) || 0),
    0
  );
  const overdueRevenue = deals
  .filter((d) => {
    if (d.collaboration_type !== "Paid") return false;

    if (d.payment_status === "Paid") return false;

    if (!d.payment_deadline) return false;

    return daysBetween(d.payment_deadline) > 0;
  })
  .reduce(
    (sum, d) => sum + (Number(d.commercials) || 0),
    0
  );
  const totalCommercials = deals
  .filter((d) => d.collaboration_type === "Paid")
  .reduce(
    (sum, d) => sum + (Number(d.commercials) || 0),
    0
  );

const collectionRate =
  totalCommercials === 0
    ? 0
    : Math.round((totalEarnings / totalCommercials) * 100);
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
         collectionRate,
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