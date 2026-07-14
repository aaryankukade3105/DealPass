
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
    const [earningPeriod, setEarningPeriod] = useState(30);
    const hasChartData = chartData.some((d) => d.value > 0);
console.log(deals);

  return (
    <div className="dp-scroll" style={{ flex: 1, overflowY: "auto", padding: "18px 18px 90px" }}>
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 13, color: "var(--slate)" }}>Welcome back,</div>
        <div className="dp-display" style={{ fontSize: 21, fontWeight: 700 }}>
          {(account?.name || "Creator").split(" ")[0]} 👋
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
        {period === "total" ? "All" : `${period}D`}
      </button>
    ))}
  </div>

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
    {[7, 15, 30, 60, 90, "total"].map((period) => (
      <button
        key={period}
        className={`dp-chip ${
          dealPeriod === period ? "active" : ""
        }`}
        onClick={() => setDealPeriod(period)}
      >
        {period === "total" ? "All" : `${period}D`}
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

      <div className="dp-label" style={{ marginBottom: 8 }}>Most recent deal</div>
      {stats.recentDeal ? (
        <DealCard deal={stats.recentDeal} onClick={() => onOpenDeal(stats.recentDeal)} compact />
      ) : (
        <EmptyState text="No deals yet. Add your first brand collab to see it here." actionLabel="Add a deal" onAction={onAddDeal} />
      )}
    </div>
  );
}
export default DashboardPage;