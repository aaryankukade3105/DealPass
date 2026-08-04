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
  User,
  AlertTriangle,
  Banknote,
  ChevronDown,
} from "lucide-react";

import { formatINR } from "../utils/formatters";
import { computeStats, buildChartData } from "../utils/dashboard";

/* ---------- shared glass primitives ---------- */

const glassCard = {
  padding: 20,
  marginBottom: 18,
  borderRadius: 20,
  background: "rgba(255,255,255,0.45)",
  backdropFilter: "blur(20px) saturate(180%)",
  WebkitBackdropFilter: "blur(20px) saturate(180%)",
  border: "1px solid rgba(255,255,255,0.55)",
  boxShadow: "0 8px 32px rgba(31,38,135,0.10)",
};

const glassChip = (active) => ({
  border: active
    ? "1px solid rgba(108,92,231,0.5)"
    : "1px solid rgba(20,20,30,0.10)",
  background: active
    ? "linear-gradient(135deg, rgba(108,92,231,0.95), rgba(130,110,255,0.85))"
    : "rgba(255,255,255,0.4)",
  backdropFilter: "blur(6px)",
  WebkitBackdropFilter: "blur(6px)",
  color: active ? "#fff" : "rgba(20,20,30,0.75)",
  fontWeight: active ? 700 : 600,
  fontSize: 13,
  padding: "8px 14px",
  borderRadius: 999,
  cursor: "pointer",
  whiteSpace: "nowrap",
  boxShadow: active ? "0 4px 14px rgba(108,92,231,0.32)" : "none",
  transition: "all .15s ease",
  flexShrink: 0,
});

const iconTile = (bg) => ({
  width: 44,
  height: 44,
  borderRadius: 14,
  background: bg,
  backdropFilter: "blur(4px)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
});

const ActionRow = ({ icon, iconBg, title, subtitle, value, valueColor, last }) => (
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "14px 4px",
      borderBottom: last ? "none" : "1px solid rgba(20,20,30,0.07)",
    }}
  >
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <div style={iconTile(iconBg)}>{icon}</div>
      <div>
        <div style={{ fontWeight: 700, fontSize: 14.5 }}>{title}</div>
        <div style={{ fontSize: 12, color: "var(--slate)" }}>{subtitle}</div>
      </div>
    </div>
    <div className="dp-display" style={{ fontSize: 19, fontWeight: 800, color: valueColor }}>
      {value}
    </div>
  </div>
);

const AnalyticsRow = ({ icon: Icon, bg, title, value, last }) => (
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "15px 4px",
      borderBottom: last ? "none" : "1px solid rgba(20,20,30,0.07)",
    }}
  >
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <div style={iconTile(bg)}>
        <Icon size={19} strokeWidth={2.2} color="#111827" />
      </div>
      <div>
        <div style={{ fontWeight: 700, fontSize: 14.5 }}>{title}</div>
        <div style={{ color: "var(--slate)", fontSize: 11.5 }}>This month</div>
      </div>
    </div>
    <div className="dp-display" style={{ fontSize: 18, fontWeight: 800 }}>
      {value}
    </div>
  </div>
);

/* ---------- main component ---------- */

function DashboardPage({ deals, account, onAddDeal, onOpenDeal }) {
  const stats = useMemo(() => computeStats(deals), [deals]);
  const chartData = useMemo(() => buildChartData(deals), [deals]);

  const [dealPeriod, setDealPeriod] = useState(30);
  const [showMonthDropdown, setShowMonthDropdown] = useState(false);
  const [earningPeriod, setEarningPeriod] = useState(30);
  const [pendingRevenuePeriod] = useState(30);
  const [analyticsMonth, setAnalyticsMonth] = useState(
    new Date().toLocaleString("default", { month: "long", year: "numeric" })
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

  const monthlyRevenue = useMemo(
    () => analyticsDeals.reduce((sum, deal) => sum + Number(deal.commercials || 0), 0),
    [analyticsDeals]
  );

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

  const highestDealAmount = useMemo(() => {
    if (analyticsDeals.length === 0) return 0;
    return Math.max(...analyticsDeals.map((deal) => Number(deal.payment_received_amount) || 0));
  }, [analyticsDeals]);

  return (
    <div
      className="dp-scroll"
      style={{
        flex: 1,
        overflowY: "auto",
        padding: "18px 18px 90px",
      }}
    >
      {/* ---------- Header ---------- */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 46,
              height: 46,
              borderRadius: 14,
              background: "linear-gradient(135deg, rgba(255,59,92,0.16), rgba(255,59,92,0.06))",
              backdropFilter: "blur(4px)",
              color: "var(--signal)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 14px rgba(255,59,92,0.15)",
            }}
          >
            <User size={22} strokeWidth={2.2} />
          </div>

          <div>
            <div style={{ fontSize: 13, color: "var(--slate)", fontWeight: 500 }}>Welcome,</div>
            <div className="dp-display" style={{ fontSize: 22, fontWeight: 800, marginTop: 1 }}>
              {(account?.full_name || account?.name || "Creator").split(" ")[0]}
            </div>
          </div>
        </div>
      </div>

      {/* ---------- Earnings Overview ---------- */}
      <div style={{ ...glassCard, padding: 24 }}>
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
          <div style={iconTile("rgba(217,119,6,0.14)")}>
            <Wallet size={18} strokeWidth={2.2} color="#D97706" />
          </div>
          Earnings Overview
        </div>

        <div
          className="dp-display dp-mono"
          style={{ fontSize: 38, fontWeight: 800, marginTop: 14, letterSpacing: -0.5 }}
        >
          {earningPeriod === "total" ? formatINR(stats.totalEarnings) : formatINR(stats.earnings[earningPeriod])}
        </div>

        <div style={{ marginTop: 4, marginBottom: 16 }}>
          <span style={{ color: "var(--slate)", fontSize: 13, fontWeight: 600 }}>
            {earningPeriod === "total" ? "All Time" : `Last ${earningPeriod} Days`}
          </span>
        </div>

        <div
          className="dp-scroll"
          style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 2 }}
        >
          {[15, 30, 60, "total"].map((period) => (
            <button
              key={period}
              onClick={() => setEarningPeriod(period)}
              style={glassChip(earningPeriod === period)}
            >
              {period === "total" ? "All" : `${period}D`}
            </button>
          ))}
        </div>
      </div>

      {/* ---------- Brand Deals Made ---------- */}
      <div style={glassCard}>
        <div className="dp-label" style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Handshake size={16} color="#6C5CE7" />
          Brand Deals Made
        </div>

        <div className="dp-display" style={{ fontSize: 40, fontWeight: 800, marginTop: 8, letterSpacing: -1 }}>
          {stats.dealCounts[dealPeriod]}
        </div>

        <div style={{ fontSize: 13, color: "var(--slate)", marginTop: 2, marginBottom: 14, fontWeight: 600 }}>
          {dealPeriod === "total" ? "All Time" : `Last ${dealPeriod} Days`}
        </div>

        <div
          className="dp-scroll"
          style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 2 }}
        >
          {[7, 15, 30, 60, "total"].map((period) => (
            <button
              key={period}
              onClick={() => setDealPeriod(period)}
              style={glassChip(dealPeriod === period)}
            >
              {period === "total" ? "All" : `${period}D`}
            </button>
          ))}
        </div>
      </div>

      {/* ---------- Action Center ---------- */}
      <div style={glassCard}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <div style={iconTile("rgba(220,38,38,0.12)")}>
            <HandCoins size={19} strokeWidth={2.2} color="#DC2626" />
          </div>
          <div>
            <div className="dp-display" style={{ fontSize: 17, fontWeight: 800 }}>
              Action Center
            </div>
            <div style={{ fontSize: 12, color: "var(--slate)" }}>Things that need your attention</div>
          </div>
        </div>

        <ActionRow
          icon={<Banknote size={19} strokeWidth={2.2} color="#D97706" />}
          iconBg="rgba(217,119,6,0.14)"
          title="Pending Revenue"
          subtitle="Awaiting payment"
          value={formatINR(stats.pendingRevenue[pendingRevenuePeriod])}
          valueColor="#D97706"
        />
        <ActionRow
          icon={<AlertTriangle size={19} strokeWidth={2.2} color="#DC2626" />}
          iconBg="rgba(220,38,38,0.12)"
          title="Overdue Revenue"
          subtitle="Requires follow-up"
          value={formatINR(stats.overdueRevenue)}
          valueColor="#DC2626"
        />
        <ActionRow
          icon={<CreditCard size={19} strokeWidth={2.2} color="#2563EB" />}
          iconBg="rgba(37,99,235,0.12)"
          title="Pending Payments"
          subtitle="Brands yet to pay"
          value={stats.pendingPayments}
          valueColor="#2563EB"
        />
        <ActionRow
          icon={<Clapperboard size={19} strokeWidth={2.2} color="#7C3AED" />}
          iconBg="rgba(124,58,237,0.12)"
          title="Pending Content"
          subtitle="Content yet to post"
          value={stats.pendingCollabs}
          valueColor="#7C3AED"
          last
        />
      </div>

      {/* ---------- Monthly Analytics ---------- */}
      <div style={glassCard}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <div className="dp-label">Monthly Analytics</div>

          <div style={{ position: "relative" }}>
            <button
              onClick={() => setShowMonthDropdown((prev) => !prev)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                border: "1px solid rgba(20,20,30,0.12)",
                background: "rgba(255,255,255,0.5)",
                backdropFilter: "blur(6px)",
                borderRadius: 999,
                padding: "7px 12px",
                cursor: "pointer",
                color: "var(--ink)",
                fontWeight: 700,
                fontSize: 13,
              }}
            >
              {analyticsMonth}
              <ChevronDown size={14} />
            </button>

            {showMonthDropdown && (
              <>
                <div
                  onClick={() => setShowMonthDropdown(false)}
                  style={{ position: "fixed", inset: 0, zIndex: 19 }}
                />
                <div
                  style={{
                    position: "absolute",
                    top: "115%",
                    right: 0,
                    background: "rgba(255,255,255,0.75)",
                    backdropFilter: "blur(20px) saturate(180%)",
                    WebkitBackdropFilter: "blur(20px) saturate(180%)",
                    border: "1px solid rgba(255,255,255,0.6)",
                    borderRadius: 14,
                    overflow: "hidden",
                    boxShadow: "0 12px 32px rgba(20,20,40,0.18)",
                    zIndex: 20,
                    minWidth: 190,
                    maxHeight: 240,
                    overflowY: "auto",
                  }}
                >
                  {months.length === 0 && (
                    <div style={{ padding: "12px 16px", fontSize: 13, color: "var(--slate)" }}>
                      No dated deals yet
                    </div>
                  )}
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
                        fontSize: 13.5,
                        fontWeight: month === analyticsMonth ? 700 : 500,
                        color: month === analyticsMonth ? "#6C5CE7" : "var(--ink)",
                        background:
                          month === analyticsMonth ? "rgba(108,92,231,0.10)" : "transparent",
                      }}
                    >
                      {month}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <AnalyticsRow icon={Wallet} bg="rgba(22,163,74,0.14)" title="Revenue" value={formatINR(monthlyRevenue)} />
          <AnalyticsRow icon={Handshake} bg="rgba(37,99,235,0.14)" title="Deals" value={analyticsDeals.length} />
          <AnalyticsRow
            icon={TrendingUp}
            bg="rgba(217,119,6,0.14)"
            title="Average Deal"
            value={formatINR(averageDealValue)}
          />
          <AnalyticsRow
            icon={Trophy}
            bg="rgba(124,58,237,0.14)"
            title="Highest Deal"
            value={formatINR(highestDealAmount)}
          />
          <AnalyticsRow
            icon={Star}
            bg="rgba(219,39,119,0.14)"
            title="Top Brand"
            value={topPayingBrand?.brand_name || "—"}
            last
          />
        </div>
      </div>

      {/* ---------- Chart ---------- */}
      {hasChartData && (
        <div style={{ ...glassCard, padding: "18px 10px 10px" }}>
          <div className="dp-label" style={{ paddingLeft: 10, marginBottom: 4 }}>
            Earnings received — last 8 weeks
          </div>
          <div style={{ height: 120 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 8, right: 10, left: 0, bottom: 0 }}>
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 10, fill: "var(--slate)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  formatter={(v) => formatINR(v)}
                  contentStyle={{
                    fontSize: 12,
                    borderRadius: 10,
                    border: "1px solid rgba(255,255,255,0.6)",
                    background: "rgba(255,255,255,0.85)",
                    backdropFilter: "blur(10px)",
                  }}
                />
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

      {/* ---------- Collection Rate ---------- */}
      <div style={{ ...glassCard, padding: 18, display: "flex", alignItems: "center", gap: 14 }}>
        <div style={iconTile("rgba(22,163,74,0.14)")}>
          <Receipt size={19} strokeWidth={2.2} color="#16a34a" />
        </div>
        <div>
          <div className="dp-display" style={{ fontSize: 22, fontWeight: 800 }}>
            {stats.collectionRate}%
          </div>
          <div style={{ fontSize: 12, color: "var(--slate)", fontWeight: 600 }}>
            Collection Rate
          </div>
        </div>
      </div>

      {/* ---------- Recent Deal ---------- */}
      <div className="dp-label" style={{ marginBottom: 8 }}>
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