
import React, { useMemo, useState } from "react";

import DealCard from "../components/deals/DealCard";
import EmptyState from "../components/common/EmptyState";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  Cell,
} from "recharts";

import {
  Clock,
  Receipt,
} from "lucide-react";

import {
  formatINR,
} from "../utils/formatters";

import {
  computeStats,
  buildChartData,
} from "../utils/dashboard";

function DashboardPage({ deals, account, onAddDeal, onOpenDeal}) {
  const stats = useMemo(() => computeStats(deals), [deals]);
  const chartData = useMemo(() => buildChartData(deals), [deals]);
    const [dealPeriod, setDealPeriod] = useState(30);
   const [showMonthDropdown, setShowMonthDropdown] = useState(false);
    const [earningPeriod, setEarningPeriod] = useState(30);
    const [analyticsMonth, setAnalyticsMonth] = useState(
  new Date().toLocaleString("default", {
    month: "long",
    year: "numeric",
  })
);
    const hasChartData = chartData.some((d) => d.value > 0);
const months = useMemo(() => {
  return [
    ...new Set(
      deals
        .filter((deal) => deal.confirmation_date)
        .map((deal) =>
          new Date(deal.confirmation_date).toLocaleString("default", {
            month: "long",
            year: "numeric",
          })
        )
    ),
  ];
}, [deals]);

const analyticsDeals = useMemo(() => {
  return deals.filter((deal) => {
    if (!deal.confirmation_date) return false;

    return (
      new Date(deal.confirmation_date).toLocaleString("default", {
        month: "long",
        year: "numeric",
      }) === analyticsMonth
    );
  });
}, [deals, analyticsMonth]);

const monthlyRevenue = useMemo(() => {
  return analyticsDeals.reduce(
    (sum, deal) => sum + Number(deal.commercials),
    0
  );
}, [analyticsDeals]);
const averageDealValue = useMemo(() => {
  if (analyticsDeals.length === 0) return 0;

  return monthlyRevenue / analyticsDeals.length;
}, [monthlyRevenue, analyticsDeals]);
const topPayingBrand = useMemo(() => {
  if (analyticsDeals.length === 0) return null;

  return analyticsDeals.reduce((highest, current) => {
    const highestAmount = Number(highest.payment_received_amount) || 0;
    const currentAmount = Number(current.payment_received_amount) || 0;

    return currentAmount > highestAmount ? current : highest;
  });
}, [analyticsDeals]);

const monthlyRevenueChart = useMemo(() => {
  const grouped = {};

  deals.forEach((deal) => {
    if (!deal.confirmation_date) return;

    const month = new Date(deal.confirmation_date).toLocaleString(
      "default",
      {
        month: "short",
        year: "2-digit",
      }
    );

    grouped[month] =
      (grouped[month] || 0) +
      (Number(deal.payment_received_amount) || 0);
  });

  return Object.entries(grouped).map(([label, value]) => ({
    label,
    value,
  }));
}, [deals]);

const highestDealAmount = useMemo(() => {
  if (analyticsDeals.length === 0) return 0;

  return Math.max(
    ...analyticsDeals.map(
      (deal) => Number(deal.payment_received_amount) || 0
    )
  );
}, [analyticsDeals]);

  return (
    <div className="dp-scroll" style={{ flex: 1, overflowY: "auto", padding: "18px 18px 90px" }}>
    <div style={{ marginBottom: 18 }}>
  <div
    style={{
      fontSize: 13,
      color: "var(--slate)",
    }}
  >
    Welcome,
  </div>

  <div
    className="dp-display"
    style={{
      fontSize: 21,
      fontWeight: 700,
      marginTop: 2,
    }}
  >
    {(account?.full_name || account?.name || "Creator").split(" ")[0]} 👋
  </div>
</div>

   <div className="dp-card" style={{ padding: 20, marginBottom: 18 }}>

  <div className="dp-label">
    Total Earnings Received
  </div>

  <div
    className="dp-display dp-mono"
    style={{
      fontSize: 36,
      fontWeight: 700,
      marginTop: 6,
    }}
  >
    {earningPeriod === "total"
      ? formatINR(stats.totalEarnings)
      : formatINR(stats.earnings[earningPeriod])}
  </div>

  <div
    style={{
      fontSize: 13,
      color: "var(--slate)",
      marginTop: 2,
      marginBottom: 14,
    }}
  >
    {earningPeriod === "total"
      ? "All Time"
      : `Last ${earningPeriod} Days`}
  </div>

  <div
    className="dp-scroll"
    style={{
      display: "flex",
      gap: 8,
      overflowX: "auto",
      paddingBottom: 2,
    }}
  >
    {[15, 30, 60, "total"].map((period) => (
      <button
  key={period}
  className={`dp-chip ${
    earningPeriod === period ? "active" : ""
  }`}
  onClick={() => setEarningPeriod(period)}
>
  {period === "total"
    ? "All"
    : period === "month"
    ? "Month"
    : `${period}D`}
</button>
    ))}
  </div>
{earningPeriod === "month" && (
  <select
    value={selectedMonth}
    onChange={(e) => setSelectedMonth(e.target.value)}
    style={{
      width: "100%",
      marginTop: 12,
      padding: "10px 12px",
      borderRadius: 10,
      border: "1px solid var(--line)",
      background: "#fff",
      fontSize: 14,
      color: "var(--ink)",
    }}
  >
    <option value="">Select Month</option>

    {months.map((month) => (
      <option key={month} value={month}>
        {month}
      </option>
    ))}
  </select>
)}
</div>
   <div className="dp-card" style={{ padding: 18, marginBottom: 18 }}>

  <div className="dp-label">
    Brand Deals Made
  </div>

  <div
    className="dp-display"
    style={{
      fontSize: 40,
      fontWeight: 700,
      marginTop: 6,
    }}
  >
    {stats.dealCounts[dealPeriod]}
  </div>

  <div
    style={{
      fontSize: 13,
      color: "var(--slate)",
      marginTop: 2,
      marginBottom: 14,
    }}
  >
    {dealPeriod === "total"
      ? "All Time"
      : `Last ${dealPeriod} Days`}
  </div>

  <div
    className="dp-scroll"
    style={{
      display: "flex",
      gap: 8,
      overflowX: "auto",
      paddingBottom: 2,
    }}
  >
   {[7, 15, 30, 60, "total"].map((period) => (
      <button
  key={period}
  className={`dp-chip ${
    dealPeriod === period ? "active" : ""
  }`}
  onClick={() => setDealPeriod(period)}
>
  {period === "total"
    ? "All"
    : period === "month"
    ? "Month"
    : `${period}D`}
</button>
    ))}
  </div>

</div>

      <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        <div className="dp-card" style={{ flex: 1, padding: 14 }}>
          <Clock size={16} color="var(--amber)" />
          <div className="dp-display" style={{ fontSize: 20, fontWeight: 700, marginTop: 6 }}>{stats.pendingCollabs}</div>
          <div style={{ fontSize: 11.5, color: "var(--slate)", fontWeight: 600 }}>Collabs pending</div>
        </div>
        <div className="dp-card" style={{ flex: 1, padding: 14 }}>
          <Receipt size={16} color="var(--signal)" />
          <div className="dp-display" style={{ fontSize: 20, fontWeight: 700, marginTop: 6 }}>{stats.pendingPayments}</div>
          <div style={{ fontSize: 11.5, color: "var(--slate)", fontWeight: 600 }}>Payments pending</div>
        </div>
      </div>
<div className="dp-card" style={{ padding: 18, marginBottom: 16 }}>

  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 18,
    }}
  >
    <div className="dp-label">
      Monthly Analytics
    </div>

 <div style={{ position: "relative" }}>
  <button
    onClick={() => setShowMonthDropdown((prev) => !prev)}
    style={{
      border: "none",
      background: "transparent",
      cursor: "pointer",
      color: "var(--ink)",
      fontWeight: 700,
      fontSize: 14,
    }}
  >
    {analyticsMonth} ▼
  </button>

  {showMonthDropdown && (
    <div
      style={{
        position: "absolute",
        top: "110%",
        right: 0,
        background: "#fff",
        border: "1px solid var(--line)",
        borderRadius: 12,
        overflow: "hidden",
        boxShadow: "0 12px 24px rgba(0,0,0,.12)",
        zIndex: 20,
        minWidth: 180,
      }}
    >
      {months.map((month) => (
        <div
          key={month}
          onClick={() => {
            setAnalyticsMonth(month);
            setShowMonthDropdown(false);
          }}
          style={{
            padding: "12px 16px",
            cursor: "pointer",
            fontWeight: month === analyticsMonth ? 700 : 500,
          }}
        >
          {month}
        </div>
      ))}
    </div>
  )}
</div>
  </div>

  <div
    style={{
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 12,
    }}
  >
    <div className="dp-card" style={{ padding: 14 }}>
      <div className="dp-label">Revenue</div>
      <div className="dp-display" style={{ fontSize: 24, marginTop: 6 }}>
        {formatINR(monthlyRevenue)}
      </div>
    </div>

    <div className="dp-card" style={{ padding: 14 }}>
      <div className="dp-label">Deals</div>
      <div className="dp-display" style={{ fontSize: 24, marginTop: 6 }}>
          {analyticsDeals.length}
      </div>
    </div>

    <div className="dp-card" style={{ padding: 14 }}>
      <div className="dp-label">Avg / Deal</div>
      <div className="dp-display" style={{ fontSize: 22, marginTop: 6 }}>
        {formatINR(averageDealValue)}
      </div>
    </div>

    <div className="dp-card" style={{ padding: 14 }}>
      <div className="dp-label">Highest Brand</div>
      <div
        style={{
          fontWeight: 700,
          marginTop: 8,
        }}
      >
          {topPayingBrand?.brand_name || "—"}
      </div>
    </div>
  </div>
<div className="dp-card" style={{ padding: 14 }}>
  <div className="dp-label">Highest Deal</div>

  <div
    className="dp-display"
    style={{
      fontSize: 22,
      marginTop: 6,
    }}
  >
    {formatINR(highestDealAmount)}
  </div>
</div>
</div>
      {hasChartData && (
        <div className="dp-card" style={{ padding: "16px 8px 8px", marginBottom: 16 }}>
          <div className="dp-label" style={{ paddingLeft: 10 }}>Earnings received — last 8 weeks</div>
          <div style={{ height: 110 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 8, right: 10, left: 0, bottom: 0 }}>
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: "var(--slate)" }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(v) => formatINR(v)} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {chartData.map((_, i) => <Cell key={i} fill="var(--signal)" />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="dp-label" style={{ marginBottom: 8 }}>
  Most recent deal
</div>

{stats.recentDeal ? (
  <DealCard
    deal={stats.recentDeal}
    onClick={() => onOpenDeal(stats.recentDeal)}
    compact
  />
) : (
  <EmptyState
    text="No deals yet. Add your first brand collab to see it here."
    actionLabel="Add a deal"
    onAction={onAddDeal}
  />
)}

</div>
  );
}
export default DashboardPage;