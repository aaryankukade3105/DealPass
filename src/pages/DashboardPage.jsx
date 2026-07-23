
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
  Wallet,
  HandCoins,
  CreditCard,
  Clapperboard,
  Handshake,
  TrendingUp,
  Trophy,
  Star,
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
    const [pendingRevenuePeriod, setPendingRevenuePeriod] = useState(30);
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

   <div className="dp-card" style={{ padding: 24, marginBottom: 18 }}>

<div
  style={{
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontSize: 14,
    fontWeight: 700,
    color: "var(--ink)",
  }}
>
  <Wallet
  size={20}
  strokeWidth={2.2}
  color="#D97706"
/> Earnings Overview
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
    marginTop: 10,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  }}
>
  <span
    style={{
      color: "var(--slate)",
      fontSize: 13,
      fontWeight: 600,
    }}
  >
    {earningPeriod === "total"
      ? "All Time"
      : `Last ${earningPeriod} Days`}
  </span>
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

     <div className="dp-card" style={{ padding: 20, marginBottom: 18 }}>
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 8,
      marginBottom: 18,
    }}
  >
    <span style={{ fontSize: 22 }}><HandCoins
  size={20}
  strokeWidth={2.2}
  color="#DC2626"
/></span>

    <div>
      <div
        className="dp-display"
        style={{ fontSize: 18, fontWeight: 700 }}
      >
        Action Center
      </div>

      <div
        style={{
          fontSize: 12,
          color: "var(--slate)",
        }}
      >
        Things that need your attention
      </div>
    </div>
  </div>

  <div
  style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "14px 0",
    borderTop: "1px solid var(--line)",
  }}
>
  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
    <div
      style={{
        width: 42,
        height: 42,
        borderRadius: 12,
        background: "#FEF3C7",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 20,
      }}
    >
      💰
    </div>

    <div>
      <div style={{ fontWeight: 700 }}>Pending Revenue</div>
      <div style={{ fontSize: 12, color: "var(--slate)" }}>
        Awaiting payment
      </div>
    </div>
  </div>

  <div
    className="dp-display"
    style={{ fontSize: 20, color: "#D97706" }}
  >
    {formatINR(stats.pendingRevenue[pendingRevenuePeriod])}
  </div>
</div>

<div
  style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "14px 0",
    borderTop: "1px solid var(--line)",
  }}
>
  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
    <div
      style={{
        width: 42,
        height: 42,
        borderRadius: 12,
        background: "#FEE2E2",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 20,
      }}
    >
      🚨
    </div>

    <div>
      <div style={{ fontWeight: 700 }}>Overdue Revenue</div>
      <div style={{ fontSize: 12, color: "var(--slate)" }}>
        Requires follow-up
      </div>
    </div>
  </div>

  <div
    className="dp-display"
    style={{ fontSize: 20, color: "#DC2626" }}
  >
    {formatINR(stats.overdueRevenue)}
  </div>
</div>

<div
  style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "14px 0",
    borderTop: "1px solid var(--line)",
  }}
>
  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
    <div
      style={{
        width: 42,
        height: 42,
        borderRadius: 12,
        background: "#DBEAFE",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 20,
      }}
    >
      <CreditCard
  size={20}
  strokeWidth={2.2}
  color="#2563EB"
/>
    </div>

    <div>
      <div style={{ fontWeight: 700 }}>Pending Payments</div>
      <div style={{ fontSize: 12, color: "var(--slate)" }}>
        Brands yet to pay
      </div>
    </div>
  </div>

  <div
    className="dp-display"
    style={{ fontSize: 20, color: "#2563EB" }}
  >
    {stats.pendingPayments}
  </div>
</div>

<div
  style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "14px 0",
    borderTop: "1px solid var(--line)",
    borderBottom: "1px solid var(--line)",
  }}
>
  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
    <div
      style={{
        width: 42,
        height: 42,
        borderRadius: 12,
        background: "#EDE9FE",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 20,
      }}
    >
      <Clapperboard
  size={20}
  strokeWidth={2.2}
  color="#7C3AED"
/>
    </div>

    <div>
      <div style={{ fontWeight: 700 }}>Pending Content</div>
      <div style={{ fontSize: 12, color: "var(--slate)" }}>
        Content yet to post
      </div>
    </div>
  </div>

  <div
    className="dp-display"
    style={{ fontSize: 20, color: "#7C3AED" }}
  >
    {stats.pendingCollabs}
  </div>
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
    display: "flex",
    flexDirection: "column",
    marginTop: 8,
  }}
>

  {[
    {
    icon: Wallet,
      title: "Revenue",
      value: formatINR(monthlyRevenue),
      color: "#DCFCE7",
    },
    {
     icon: Handshake,
      title: "Deals",
      value: analyticsDeals.length,
      color: "#DBEAFE",
    },
    {
      icon: TrendingUp,
      title: "Average Deal",
      value: formatINR(averageDealValue),
      color: "#FEF3C7",
    },
    {
      icon: Trophy,
      title: "Highest Deal",
      value: formatINR(highestDealAmount),
      color: "#F3E8FF",
    },
    {
      icon: Star,
      title: "Top Brand",
      value: topPayingBrand?.brand_name || "—",
      color: "#FCE7F3",
    },
  ].map((item, index) => (
    <div
      key={item.title}
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "16px 0",
        borderBottom:
          index === 4 ? "none" : "1px solid var(--line)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
    <div
  style={{
    width: 42,
    height: 42,
    borderRadius: 12,
    background: item.color,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  }}
>
  <item.icon
    size={20}
    strokeWidth={2.2}
    color="#111827"
  />
</div>

        <div>
          <div
            style={{
              fontWeight: 700,
              fontSize: 15,
            }}
          >
            {item.title}
          </div>

          <div
            style={{
              color: "var(--slate)",
              fontSize: 12,
            }}
          >
            This month
          </div>
        </div>
      </div>

      <div
        className="dp-display"
        style={{
          fontSize: 19,
          fontWeight: 700,
        }}
      >
        {item.value}
      </div>
    </div>
  ))}

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
<div className="dp-card" style={{ flex: 1, padding: 14 }}>
  <Receipt size={16} color="#16a34a" />

  <div
    className="dp-display"
    style={{
      fontSize: 20,
      fontWeight: 700,
      marginTop: 6,
    }}
  >
    {stats.collectionRate}%
  </div>

  <div
    style={{
      fontSize: 11.5,
      color: "var(--slate)",
      fontWeight: 600,
    }}
  >
    Collection Rate
  </div>
</div>
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