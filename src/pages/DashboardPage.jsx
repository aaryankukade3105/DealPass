import React, { useEffect, useMemo, useRef, useState } from "react";

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
  User,
  AlertTriangle,
  ChevronDown,
  ArrowRight,
  Plus,
  ShieldCheck,
} from "lucide-react";

import { formatINR } from "../utils/formatters";
import { computeStats, buildChartData } from "../utils/dashboard";

/* ---------------------------------- styles ---------------------------------- */

const PageStyle = () => (
  <style>{`
    .dp-dash-hero {
      border-radius: 22px;
      padding: 24px;
      margin-bottom: 16px;
      background: linear-gradient(135deg, rgba(255,59,92,0.06), rgba(108,92,231,0.05));
      border: 1px solid rgba(255,59,92,0.12);
      position: relative;
      overflow: hidden;
    }
    .dp-dash-card {
      border-radius: 18px;
      padding: 18px;
      margin-bottom: 14px;
      background: var(--surface, #fff);
      border: 1px solid var(--line);
    }
    .dp-dash-chip {
      padding: 7px 13px;
      border-radius: 999px;
      border: 1px solid var(--line);
      background: #fff;
      color: var(--slate);
      font-size: 12.5px;
      font-weight: 700;
      cursor: pointer;
      white-space: nowrap;
      transition: all .15s ease;
      flex-shrink: 0;
    }
    .dp-dash-chip.active {
      background: var(--signal, #FF3B5C);
      border-color: var(--signal, #FF3B5C);
      color: #fff;
    }
    .dp-dash-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 14px 0;
      border-top: 1px solid var(--line);
      transition: background .12s ease;
    }
    .dp-dash-row.clickable {
      cursor: pointer;
      margin: 0 -8px;
      padding: 14px 8px;
      border-radius: 12px;
    }
    .dp-dash-row.clickable:hover {
      background: rgba(20,20,30,0.035);
    }
    .dp-dash-quickbtn {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 13px 14px;
      border-radius: 14px;
      font-weight: 700;
      font-size: 13.5px;
      cursor: pointer;
      border: 1px solid var(--line);
      background: #fff;
      color: var(--ink);
      transition: transform .1s ease, box-shadow .15s ease;
    }
    .dp-dash-quickbtn:active { transform: scale(0.98); }
    .dp-dash-quickbtn.primary {
      background: var(--signal, #FF3B5C);
      border-color: var(--signal, #FF3B5C);
      color: #fff;
      box-shadow: 0 6px 16px rgba(255,59,92,0.25);
    }
    .dp-health-bar {
      display: flex;
      width: 100%;
      height: 14px;
      border-radius: 999px;
      overflow: hidden;
      background: #F1F2F8;
    }
    .dp-health-seg {
      height: 100%;
      transition: width .4s ease;
      min-width: 0;
    }
    .dp-health-legend {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      font-weight: 600;
      color: var(--slate);
    }
    .dp-health-dot {
      width: 8px;
      height: 8px;
      border-radius: 999px;
      flex-shrink: 0;
    }
    .dp-health-ring {
      width: 72px;
      height: 72px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      position: relative;
    }
  `}</style>
);

/* ---------------------------------- helpers ---------------------------------- */

function PeriodChips({ periods, value, onChange, labelFor }) {
  return (
    <div
      className="dp-scroll"
      style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 2 }}
    >
      {periods.map((period) => (
        <button
          key={period}
          type="button"
          className={`dp-dash-chip ${value === period ? "active" : ""}`}
          onClick={() => onChange(period)}
        >
          {labelFor ? labelFor(period) : period === "total" ? "All" : `${period}D`}
        </button>
      ))}
    </div>
  );
}

function StatRow({ icon, iconBg, title, subtitle, value, valueColor, onClick }) {
  return (
    <div
      className={`dp-dash-row ${onClick ? "clickable" : ""}`}
      onClick={onClick}
      role={onClick ? "button" : undefined}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
        <div
          style={{
            width: 42,
            height: 42,
            borderRadius: 12,
            background: iconBg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {icon}
        </div>

        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 14.5 }}>{title}</div>
          <div style={{ fontSize: 12, color: "var(--slate)" }}>{subtitle}</div>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
        <div className="dp-display" style={{ fontSize: 19, fontWeight: 700, color: valueColor }}>
          {value}
        </div>
        {onClick && <ArrowRight size={15} color="var(--slate)" />}
      </div>
    </div>
  );
}

function HealthRing({ score, color }) {
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const pct = score === null ? 0 : score / 100;
  const dash = circumference * pct;

  return (
    <div className="dp-health-ring">
      <svg width="72" height="72" viewBox="0 0 72 72">
        <circle cx="36" cy="36" r={radius} fill="none" stroke="#F1F2F8" strokeWidth="8" />
        <circle
          cx="36"
          cy="36"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference - dash}`}
          transform="rotate(-90 36 36)"
        />
      </svg>
      <div
        style={{
          position: "absolute",
          fontWeight: 800,
          fontSize: score === null ? 12 : 17,
          color: "var(--ink)",
        }}
      >
        {score === null ? "—" : score}
      </div>
    </div>
  );
}

/* ---------------------------------- page ---------------------------------- */

function DashboardPage({ deals, account, onAddDeal, onOpenDeal, onFilterDeals }) {
  const stats = useMemo(() => computeStats(deals), [deals]);
  const chartData = useMemo(() => buildChartData(deals), [deals]);

  const [dealPeriod, setDealPeriod] = useState(30);
  const [earningPeriod, setEarningPeriod] = useState(30);
  const [pendingRevenuePeriod, setPendingRevenuePeriod] = useState(30);
  const [analyticsMonth, setAnalyticsMonth] = useState(
    new Date().toLocaleString("default", { month: "long", year: "numeric" })
  );
  const [showMonthDropdown, setShowMonthDropdown] = useState(false);
  const monthDropdownRef = useRef(null);

  const hasChartData = chartData.some((d) => d.value > 0);

  useEffect(() => {
    if (!showMonthDropdown) return;

    const handleClickOutside = (e) => {
      if (monthDropdownRef.current && !monthDropdownRef.current.contains(e.target)) {
        setShowMonthDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showMonthDropdown]);

  const months = useMemo(() => {
    const seen = new Map();

    deals.forEach((deal) => {
      if (!deal.confirmation_date) return;
      const d = new Date(deal.confirmation_date);
      if (isNaN(d.getTime())) return;

      const label = d.toLocaleString("default", { month: "long", year: "numeric" });
      const sortKey = d.getFullYear() * 12 + d.getMonth();

      if (!seen.has(label)) seen.set(label, sortKey);
    });

    return [...seen.entries()].sort((a, b) => b[1] - a[1]).map(([label]) => label);
  }, [deals]);

  const analyticsDeals = useMemo(() => {
    return deals.filter((deal) => {
      if (!deal.confirmation_date) return false;
      const d = new Date(deal.confirmation_date);
      if (isNaN(d.getTime())) return false;

      return d.toLocaleString("default", { month: "long", year: "numeric" }) === analyticsMonth;
    });
  }, [deals, analyticsMonth]);

  const monthlyRevenue = useMemo(
    () => analyticsDeals.reduce((sum, deal) => sum + (Number(deal.commercials) || 0), 0),
    [analyticsDeals]
  );

  const averageDealValue = useMemo(
    () => (analyticsDeals.length === 0 ? 0 : monthlyRevenue / analyticsDeals.length),
    [monthlyRevenue, analyticsDeals]
  );

  const topPayingBrand = useMemo(() => {
    if (analyticsDeals.length === 0) return null;

    return analyticsDeals.reduce((highest, current) => {
      const highestAmount = Number(highest.payment_received_amount) || 0;
      const currentAmount = Number(current.payment_received_amount) || 0;
      return currentAmount > highestAmount ? current : highest;
    });
  }, [analyticsDeals]);

  const highestDealAmount = useMemo(() => {
    if (analyticsDeals.length === 0) return 0;

    return Math.max(...analyticsDeals.map((deal) => Number(deal.payment_received_amount) || 0));
  }, [analyticsDeals]);

  // Single funnel through which every dashboard click that should land on
  // a filtered Deals list passes. Parent (App.jsx) wires this to
  // setPage("deals") + a filter override passed into DealsPage.
  const goToDeals = (filters) => {
    if (onFilterDeals) onFilterDeals(filters);
  };

  const health = stats.paymentHealth;

  return (
    <div className="dp-scroll" style={{ flex: 1, overflowY: "auto", padding: "18px 18px 90px" }}>
      <PageStyle />

      {/* ---------- Greeting ---------- */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: "rgba(255,59,92,.08)",
              color: "var(--signal)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <User size={20} strokeWidth={2.2} />
          </div>

          <div>
            <div style={{ fontSize: 13, color: "var(--slate)" }}>Welcome,</div>
            <div className="dp-display" style={{ fontSize: 21, fontWeight: 700, marginTop: 2 }}>
              {(account?.full_name || account?.name || "Creator").split(" ")[0]}
            </div>
          </div>
        </div>
      </div>

      {/* ---------- Quick actions ---------- */}
      <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        <button type="button" className="dp-dash-quickbtn primary" onClick={onAddDeal}>
          <Plus size={16} /> Add Deal
        </button>

        <button
          type="button"
          className="dp-dash-quickbtn"
          onClick={() => goToDeals({ payment: "Pending" })}
        >
          <CreditCard size={16} /> View Pending Payments
        </button>
      </div>

      {/* ---------- Earnings hero ---------- */}
      <div className="dp-dash-hero">
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
          <Wallet size={20} strokeWidth={2.2} color="#D97706" /> Earnings Overview
        </div>

        <div className="dp-display dp-mono" style={{ fontSize: 36, fontWeight: 700, marginTop: 6 }}>
          {earningPeriod === "total" ? formatINR(stats.totalEarnings) : formatINR(stats.earnings[earningPeriod])}
        </div>

        <div style={{ marginTop: 4, marginBottom: 12, color: "var(--slate)", fontSize: 13, fontWeight: 600 }}>
          {earningPeriod === "total" ? "All Time" : `Last ${earningPeriod} Days`}
        </div>

        <PeriodChips periods={[15, 30, 60, "total"]} value={earningPeriod} onChange={setEarningPeriod} />
      </div>

      {/* ---------- Payment Health (unique to this app) ---------- */}
      <div className="dp-dash-card">
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <ShieldCheck size={20} strokeWidth={2.2} color={health.color} />
          <div>
            <div className="dp-display" style={{ fontSize: 18, fontWeight: 700 }}>
              Payment Health
            </div>
            <div style={{ fontSize: 12, color: "var(--slate)" }}>
              Collection rate, weighted against how many deals are overdue
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 16 }}>
          <HealthRing score={health.score} color={health.color} />

          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "3px 10px",
                borderRadius: 999,
                background: `${health.color}1A`,
                color: health.color,
                fontSize: 12,
                fontWeight: 800,
                marginBottom: 6,
              }}
            >
              {health.label}
            </div>

            <div style={{ fontSize: 12.5, color: "var(--slate)", lineHeight: 1.5 }}>
              {health.score === null
                ? "Add a paid deal to start tracking your payment health."
                : health.overdueCount > 0
                ? `${health.overdueCount} deal${health.overdueCount === 1 ? "" : "s"} overdue is pulling your score down.`
                : "No overdue deals — your collections are on track."}
            </div>
          </div>
        </div>

        <div className="dp-health-bar" style={{ marginBottom: 10 }}>
          <div
            className="dp-health-seg"
            style={{ width: `${health.segmentPercents.paid}%`, background: "#16A34A" }}
          />
          <div
            className="dp-health-seg"
            style={{ width: `${health.segmentPercents.pending}%`, background: "#D97706" }}
          />
          <div
            className="dp-health-seg"
            style={{ width: `${health.segmentPercents.overdue}%`, background: "#DC2626" }}
          />
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
          <div className="dp-health-legend">
            <span className="dp-health-dot" style={{ background: "#16A34A" }} />
            Paid · {formatINR(health.segments.paid)}
          </div>
          <div className="dp-health-legend">
            <span className="dp-health-dot" style={{ background: "#D97706" }} />
            Pending · {formatINR(health.segments.pending)}
          </div>
          <div className="dp-health-legend">
            <span className="dp-health-dot" style={{ background: "#DC2626" }} />
            Overdue · {formatINR(health.segments.overdue)}
          </div>
        </div>
      </div>

      {/* ---------- Deals made + Collection rate ---------- */}
      <div style={{ display: "flex", gap: 12, marginBottom: 14 }}>
        <div className="dp-dash-card" style={{ flex: 1.4, marginBottom: 0 }}>
          <div className="dp-label">Brand Deals Made</div>
          <div className="dp-display" style={{ fontSize: 34, fontWeight: 700, marginTop: 6 }}>
            {stats.dealCounts[dealPeriod]}
          </div>
          <div style={{ fontSize: 12.5, color: "var(--slate)", marginTop: 2, marginBottom: 12 }}>
            {dealPeriod === "total" ? "All Time" : `Last ${dealPeriod} Days`}
          </div>
          <PeriodChips periods={[7, 15, 30, 60, "total"]} value={dealPeriod} onChange={setDealPeriod} />
        </div>

        <div
          className="dp-dash-card"
          style={{
            flex: 1,
            marginBottom: 0,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            textAlign: "center",
          }}
        >
          <Receipt size={18} color="#16a34a" />
          <div className="dp-display" style={{ fontSize: 26, fontWeight: 700, marginTop: 8 }}>
            {stats.collectionRate}%
          </div>
          <div style={{ fontSize: 11.5, color: "var(--slate)", fontWeight: 600, marginTop: 2 }}>
            Collection Rate
          </div>
        </div>
      </div>

      {/* ---------- Action Center ---------- */}
      <div className="dp-dash-card">
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <HandCoins size={20} strokeWidth={2.2} color="#DC2626" />
          <div>
            <div className="dp-display" style={{ fontSize: 18, fontWeight: 700 }}>
              Action Center
            </div>
            <div style={{ fontSize: 12, color: "var(--slate)" }}>Things that need your attention</div>
          </div>
        </div>

        <StatRow
          icon={<Wallet size={19} color="#D97706" />}
          iconBg="#FEF3C7"
          title="Pending Revenue"
          subtitle="Awaiting payment"
          value={formatINR(stats.pendingRevenue[pendingRevenuePeriod])}
          valueColor="#D97706"
          onClick={() => goToDeals({ payment: "Pending" })}
        />

        <div style={{ padding: "0 0 6px", marginTop: -6 }}>
          <PeriodChips periods={[15, 30, 60]} value={pendingRevenuePeriod} onChange={setPendingRevenuePeriod} />
        </div>

        <StatRow
          icon={<AlertTriangle size={19} color="#DC2626" />}
          iconBg="#FEE2E2"
          title="Overdue Revenue"
          subtitle={`${stats.overdueCount} deal${stats.overdueCount === 1 ? "" : "s"} past deadline`}
          value={formatINR(stats.overdueRevenue)}
          valueColor="#DC2626"
          onClick={() => goToDeals({ payment: "Overdue" })}
        />

        <StatRow
          icon={<CreditCard size={19} color="#2563EB" />}
          iconBg="#DBEAFE"
          title="Pending Payments"
          subtitle="Brands yet to pay in full"
          value={stats.pendingPayments}
          valueColor="#2563EB"
          onClick={() => goToDeals({ payment: "Pending" })}
        />

        <StatRow
          icon={<Clapperboard size={19} color="#7C3AED" />}
          iconBg="#EDE9FE"
          title="Pending Content"
          subtitle="Content yet to post"
          value={stats.pendingCollabs}
          valueColor="#7C3AED"
        />
      </div>

      {/* ---------- Monthly Analytics ---------- */}
      <div className="dp-dash-card">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <div className="dp-label">Monthly Analytics</div>

          <div style={{ position: "relative" }} ref={monthDropdownRef}>
            <button
              type="button"
              onClick={() => setShowMonthDropdown((prev) => !prev)}
              style={{
                border: "none",
                background: "transparent",
                cursor: "pointer",
                color: "var(--ink)",
                fontWeight: 700,
                fontSize: 14,
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              {analyticsMonth} <ChevronDown size={14} />
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
                  maxHeight: 240,
                  overflowY: "auto",
                }}
              >
                {months.length === 0 ? (
                  <div style={{ padding: "12px 16px", fontSize: 13, color: "var(--slate)" }}>
                    No deals yet
                  </div>
                ) : (
                  months.map((month) => (
                    <div
                      key={month}
                      onClick={() => {
                        setAnalyticsMonth(month);
                        setShowMonthDropdown(false);
                      }}
                      style={{
                        padding: "12px 16px",
                        cursor: "pointer",
                        fontSize: 13.5,
                        fontWeight: month === analyticsMonth ? 700 : 500,
                        background: month === analyticsMonth ? "rgba(255,59,92,0.06)" : "transparent",
                      }}
                    >
                      {month}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {analyticsDeals.length === 0 ? (
          <div style={{ padding: "10px 0", fontSize: 13, color: "var(--slate)" }}>
            No deals confirmed in {analyticsMonth}.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column" }}>
            {[
              { icon: Wallet, title: "Revenue", value: formatINR(monthlyRevenue), color: "#DCFCE7" },
              { icon: Handshake, title: "Deals", value: analyticsDeals.length, color: "#DBEAFE" },
              { icon: TrendingUp, title: "Average Deal", value: formatINR(averageDealValue), color: "#FEF3C7" },
              { icon: Trophy, title: "Highest Deal", value: formatINR(highestDealAmount), color: "#F3E8FF" },
              { icon: Star, title: "Top Brand", value: topPayingBrand?.brand_name || "—", color: "#FCE7F3" },
            ].map((item, index, arr) => (
              <div
                key={item.title}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "14px 0",
                  borderBottom: index === arr.length - 1 ? "none" : "1px solid var(--line)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
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
                    <item.icon size={20} strokeWidth={2.2} color="#111827" />
                  </div>

                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{item.title}</div>
                    <div style={{ color: "var(--slate)", fontSize: 12 }}>This month</div>
                  </div>
                </div>

                <div className="dp-display" style={{ fontSize: 19, fontWeight: 700 }}>
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ---------- Chart ---------- */}
      {hasChartData && (
        <div className="dp-dash-card" style={{ padding: "16px 8px 8px" }}>
          <div className="dp-label" style={{ paddingLeft: 10 }}>
            Earnings received — last 8 weeks
          </div>
          <div style={{ height: 110 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 8, right: 10, left: 0, bottom: 0 }}>
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: "var(--slate)" }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(v) => formatINR(v)} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {chartData.map((_, i) => (
                    <Cell key={i} fill="var(--signal)" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ---------- Recent deal ---------- */}
      <div className="dp-label" style={{ marginBottom: 8, marginTop: 4 }}>
        Most recent deal
      </div>

      {stats.recentDeal ? (
        <DealCard deal={stats.recentDeal} onClick={() => onOpenDeal(stats.recentDeal)} compact />
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