import React, { useMemo, useState } from "react";

import DealCard from "../components/deals/DealCard";
import EmptyState from "../components/common/EmptyState";
import { useShootReminders } from "../hooks/useShootReminders";
import ShootReminderModal, { ShootNowBanner } from "../components/dashboard/ShootReminderModal";
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
  ChevronDown,
  ChevronRight,
  Zap,
  AlertTriangle,
  MapPin,
  Clock,
  CheckCircle2,
} from "lucide-react";

import {
  formatINR,
} from "../utils/formatters";

import {
  computeStats,
  buildChartData,
} from "../utils/dashboard";

/* ------------------------------------------------------------------ */
/* Purely presentational helpers — no data/behavior changes below.    */
/* ------------------------------------------------------------------ */

// Time-of-day greeting. Cosmetic only, derived from the clock, doesn't
// touch any deal/account data or state.
function getGreeting() {
  const h = new Date().getHours();
  if (h < 5) return "Still up,";
  if (h < 12) return "Good morning,";
  if (h < 17) return "Good afternoon,";
  if (h < 21) return "Good evening,";
  return "Working late,";
}

// A single small badge telling you, at a glance, how far away a shoot is —
// this is what replaces burying that information inside a plain date string.
function shootCountdown(dateStr) {
  const d = new Date(dateStr);
  d.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diff = Math.round((d - today) / 86400000);

  if (diff < 0) return { label: "Overdue", color: "#DC2626", bg: "#FEE2E2" };
  if (diff === 0) return { label: "Today", color: "#16A34A", bg: "#DCFCE7" };
  if (diff === 1) return { label: "Tomorrow", color: "#2563EB", bg: "#DBEAFE" };
  return { label: `In ${diff}d`, color: "#7C3AED", bg: "#EDE9FE" };
}
function DashboardPage({
  deals,
  account,
  onAddDeal,
  onOpenDeal,
  updateShootStatus,
}) {
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
const {
  alertDeal,
  dismissAlert,
  checkinDeal,
  markInProgress,
  resolveCheckin,
  hiddenDealIds,
} = useShootReminders(deals, updateShootStatus);

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

const revenueDeals = useMemo(() => {
  return deals.filter((deal) => {
    if (deal.payment_status !== "Paid") return false;
    if (!deal.payment_received_date) return false;

    return (
      new Date(deal.payment_received_date).toLocaleString("default", {
        month: "long",
        year: "numeric",
      }) === analyticsMonth
    );
  });
}, [deals, analyticsMonth]);

const monthlyRevenue = useMemo(() => {
  return revenueDeals.reduce(
    (sum, deal) =>
      sum +
      (Number(deal.payment_received_amount) ||
        Number(deal.commercials) ||
        0),
    0
  );
}, [revenueDeals]);

const averageDealValue = useMemo(() => {
  if (analyticsDeals.length === 0) return 0;

  return monthlyRevenue / analyticsDeals.length;
}, [monthlyRevenue, analyticsDeals]);

const topPayingBrand = useMemo(() => {
  if (revenueDeals.length === 0) return null;

  return revenueDeals.reduce((highest, current) => {
    const highestAmount =
      Number(highest.payment_received_amount) ||
      Number(highest.commercials) ||
      0;

    const currentAmount =
      Number(current.payment_received_amount) ||
      Number(current.commercials) ||
      0;

    return currentAmount > highestAmount ? current : highest;
  });
}, [revenueDeals]);

const monthlyRevenueChart = useMemo(() => {
  const grouped = {};

  deals.forEach((deal) => {
    // Only count paid deals
    if (deal.payment_status !== "Paid") return;

    // Revenue belongs to the month payment was received
    if (!deal.payment_received_date) return;

    const month = new Date(deal.payment_received_date).toLocaleString(
      "default",
      {
        month: "short",
        year: "2-digit",
      }
    );

    if (!grouped[month]) grouped[month] = 0;

    grouped[month] +=
      Number(deal.payment_received_amount) ||
      Number(deal.commercials) ||
      0;
  });

  return Object.entries(grouped).map(([month, revenue]) => ({
    month,
    revenue,
  }));
}, [deals]);

const highestDealAmount = useMemo(() => {
  if (revenueDeals.length === 0) return 0;

  return Math.max(
    ...revenueDeals.map(
      (deal) =>
        Number(deal.payment_received_amount) ||
        Number(deal.commercials) ||
        0
    )
  );
}, [revenueDeals]);
// Cosmetic-only: greeting text, derived purely from the clock.
const greeting = useMemo(() => getGreeting(), []);

// stats.paymentHealth was already being computed in utils/dashboard.js but
// never rendered anywhere. Surfacing it here is a display-only addition —
// no new data, no new computation, nothing else in the app changes.
const health = stats.paymentHealth;

const nextShoot = stats.upcomingShoots[0] || null;

const formatShootTime = (time) => {
  if (!time) return "Time not set";

  return new Date(`1970-01-01T${time}`).toLocaleTimeString(
    "en-IN",
    {
      hour: "numeric",
      minute: "2-digit",
    }
  );
};

// Everything the "Shoot Schedule" card needs to show, in one flat,
// chronologically-sensible list: overdue first (needs attention), then
// today, tomorrow, and the rest — capped so the card doesn't run away.
const scheduleShoots = useMemo(() => {
  const seen = new Set();
  const combined = [];

  [...stats.overdueShoots, ...stats.todaysAgenda, ...stats.tomorrowsAgenda, ...stats.futureAgenda].forEach(
    (d) => {
      if (seen.has(d.id)) return;
      if (hiddenDealIds.has(d.id)) return; // <-- new
      seen.add(d.id);
      combined.push(d);
    }
  );

  return combined.slice(0, 6);
}, [stats.overdueShoots, stats.todaysAgenda, stats.tomorrowsAgenda, stats.futureAgenda, hiddenDealIds]);

const extraShootCount = Math.max(
  stats.overdueShoots.length +
    stats.todaysAgenda.length +
    stats.tomorrowsAgenda.length +
    stats.futureAgenda.length -
    scheduleShoots.length,
  0
);

  return (
    <div className="dp-scroll" style={{ flex: 1, overflowY: "auto", padding: "16px 16px 90px" }}>
    <style>{`
      @keyframes dpxFadeUp {
        from { opacity: 0; transform: translateY(8px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes dpxPulseDot {
        0%, 100% { opacity: 1; transform: scale(1); }
        50% { opacity: .55; transform: scale(.8); }
      }
      .dpx-card {
        animation: dpxFadeUp .35s ease both;
      }
      .dpx-chip {
        transition: transform .12s ease, box-shadow .12s ease;
      }
      .dpx-chip:active {
        transform: scale(0.94);
      }
      .dpx-row {
        transition: transform .12s ease, background .12s ease;
        border-radius: 14px;
      }
      .dpx-row:active {
        transform: scale(0.985);
        background: rgba(0,0,0,.02);
      }
      .dpx-live-dot {
        animation: dpxPulseDot 1.8s ease-in-out infinite;
      }
      .dpx-segbar-seg {
        transition: width .5s cubic-bezier(.22,1,.36,1);
      }
      .dpx-avatar {
        background: linear-gradient(135deg, #FF3B5C 0%, #FF7A59 100%);
        box-shadow: 0 6px 16px rgba(255,59,92,.35);
      }
      .dpx-shoot-card {
        transition: transform .12s ease, box-shadow .12s ease;
      }
      .dpx-shoot-card:active {
        transform: scale(0.98);
      }
    `}</style>

    <div style={{ marginBottom: 20 }} className="dpx-card">
  <div
  style={{
    display: "flex",
    alignItems: "center",
    gap: 12,
  }}
>
  <div
    className="dpx-avatar"
    style={{
      width: 44,
      height: 44,
      borderRadius: 14,
      color: "#fff",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    }}
  >
    <User size={20} strokeWidth={2.4} />
  </div>

  <div>
    <div
      style={{
        fontSize: 12.5,
        color: "var(--slate)",
        fontWeight: 600,
        letterSpacing: .2,
      }}
    >
      {greeting}
    </div>

    <div
      className="dp-display"
      style={{
        fontSize: 22,
        fontWeight: 800,
        marginTop: 1,
      }}
    >
      {(account?.full_name || account?.name || "Creator").split(" ")[0]} 👋
    </div>
  </div>
</div>
</div>

<>
  <ShootReminderModal
    checkinDeal={checkinDeal}
    updateShootStatus={updateShootStatus}
    onInProgress={markInProgress}
    onResolve={resolveCheckin}
  />

  <ShootNowBanner
    deal={alertDeal}
    onDismiss={dismissAlert}
  />
</>
   <div
     className="dp-card dpx-card"
     style={{
       padding: 24,
       marginBottom: 16,
       background: "linear-gradient(135deg, #7C3AED 0%, #DB2777 55%, #F97316 100%)",
       color: "#fff",
       border: "none",
       boxShadow: "0 14px 30px -12px rgba(124,58,237,.55)",
       position: "relative",
       overflow: "hidden",
     }}
   >
     <div
       aria-hidden
       style={{
         position: "absolute",
         top: -40,
         right: -30,
         width: 140,
         height: 140,
         borderRadius: "50%",
         background: "rgba(255,255,255,.10)",
       }}
     />

<div
  style={{
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontSize: 13.5,
    fontWeight: 700,
    color: "rgba(255,255,255,.9)",
    position: "relative",
  }}
>
  <Wallet size={18} strokeWidth={2.4} /> Earnings Overview
</div>

  <div
    className="dp-display dp-mono"
    style={{
      fontSize: 38,
      fontWeight: 800,
      marginTop: 8,
      position: "relative",
    }}
  >
    {earningPeriod === "total"
      ? formatINR(stats.totalEarnings)
      : formatINR(stats.earnings[earningPeriod])}
  </div>
<div
  style={{
    marginTop: 8,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    position: "relative",
  }}
>
  <span
    style={{
      color: "rgba(255,255,255,.85)",
      fontSize: 12.5,
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
      marginTop: 14,
      position: "relative",
    }}
  >
    {[15, 30, 60, "total"].map((period) => (
      <button
  key={period}
  className={`dp-chip dpx-chip`}
  onClick={() => setEarningPeriod(period)}
  style={{
    border: "none",
    fontWeight: 700,
    background:
      earningPeriod === period ? "#fff" : "rgba(255,255,255,.16)",
    color: earningPeriod === period ? "#7C3AED" : "#fff",
  }}
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
   <div className="dp-card dpx-card" style={{ padding: 18, marginBottom: 16 }}>

  <div className="dp-label" style={{ display: "flex", alignItems: "center", gap: 6 }}>
    <Handshake size={14} strokeWidth={2.4} color="#2563EB" />
    Brand Deals Made
  </div>

  <div
    className="dp-display"
    style={{
      fontSize: 40,
      fontWeight: 800,
      marginTop: 6,
      color: "#2563EB",
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
      fontWeight: 600,
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
  className={`dp-chip dpx-chip ${
    dealPeriod === period ? "active" : ""
  }`}
  onClick={() => setDealPeriod(period)}
  style={
    dealPeriod === period
      ? { background: "#2563EB", borderColor: "#2563EB", color: "#fff" }
      : undefined
  }
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

{/* ---------- Shoot Schedule (redesigned) ---------- */}

<div className="dp-card dpx-card" style={{ padding: 20, marginBottom: 16 }}>

  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16,
    }}
  >
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          background: "#EDE9FE",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Clapperboard
          size={18}
          strokeWidth={2.2}
          color="#7C3AED"
        />
      </div>

      <div>
        <div
          className="dp-display"
          style={{
            fontSize: 17,
            fontWeight: 800,
          }}
        >
          Shoot Schedule
        </div>

        <div
          style={{
            fontSize: 12,
            color: "var(--slate)",
          }}
        >
          {stats.overdueShoots.length > 0
            ? `${stats.overdueShoots.length} need${stats.overdueShoots.length === 1 ? "s" : ""} a status update`
            : "Your upcoming schedule"}
        </div>
      </div>
    </div>

    <div
      className="dp-display"
      style={{
        fontSize: 22,
        color: "#7C3AED",
        fontWeight: 800,
      }}
    >
      {stats.upcomingShoots.length}
    </div>
  </div>

  {!nextShoot && stats.overdueShoots.length === 0 ? (

    <div
      style={{
        textAlign: "center",
        color: "var(--slate)",
        padding: "24px 0",
      }}
    >
      No shoots scheduled 🎉
    </div>

  ) : (
    <>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {scheduleShoots.map((shoot) => {
          const isOverdue = stats.overdueShoots.some((d) => d.id === shoot.id);
          const countdown = shootCountdown(shoot.shoot_date);

          return (
            <button
              key={shoot.id}
              type="button"
              onClick={() => onOpenDeal(shoot)}
              className="dpx-shoot-card"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                width: "100%",
                textAlign: "left",
                border: "1px solid var(--line)",
                borderLeft: `4px solid ${countdown.color}`,
                borderRadius: 14,
                padding: "12px 14px",
                background: isOverdue ? "rgba(220,38,38,.04)" : "transparent",
                cursor: "pointer",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  minWidth: 54,
                  padding: "6px 4px",
                  borderRadius: 10,
                  background: countdown.bg,
                  color: countdown.color,
                  fontWeight: 800,
                  fontSize: 11,
                  textAlign: "center",
                  flexShrink: 0,
                }}
              >
                {countdown.label}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  className="dp-display"
                  style={{
                    fontSize: 14.5,
                    fontWeight: 700,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {shoot.brand_name}
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    marginTop: 3,
                    fontSize: 12,
                    color: "var(--slate)",
                  }}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <Clock size={12} />
                    {formatShootTime(shoot.shoot_time)}
                  </span>

                  {shoot.shoot_location && (
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      <MapPin size={12} />
                      {shoot.shoot_location}
                    </span>
                  )}
                </div>
              </div>

              {isOverdue && onMarkShootStatus ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onMarkShootStatus(shoot.id, "Shot");
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    padding: "7px 10px",
                    borderRadius: 999,
                    border: "1px solid #BBF7D0",
                    background: "#F0FDF4",
                    color: "#166534",
                    fontSize: 11.5,
                    fontWeight: 700,
                    cursor: "pointer",
                    flexShrink: 0,
                  }}
                >
                  <CheckCircle2 size={13} />
                  Done
                </button>
              ) : (
                <ChevronRight size={16} color="#B8B8B8" style={{ flexShrink: 0 }} />
              )}
            </button>
          );
        })}
      </div>

      {extraShootCount > 0 && (
        <div
          style={{
            textAlign: "center",
            marginTop: 12,
            color: "#7C3AED",
            fontWeight: 700,
            fontSize: 13,
          }}
        >
          + {extraShootCount} more scheduled
        </div>
      )}
    </>
  )}

</div>
     <div className="dp-card dpx-card" style={{ padding: 20, marginBottom: 16 }}>
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 8,
      marginBottom: 18,
    }}
  >
    <div
      style={{
        width: 34,
        height: 34,
        borderRadius: 10,
        background: "#FEE2E2",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <HandCoins size={18} strokeWidth={2.4} color="#DC2626" />
    </div>

    <div>
      <div
        className="dp-display"
        style={{ fontSize: 18, fontWeight: 800 }}
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
  className="dpx-row"
  style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "14px 10px",
    borderLeft: "4px solid #F59E0B",
    marginBottom: 8,
    background: "rgba(245,158,11,.06)",
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
    style={{ fontSize: 20, color: "#D97706", fontWeight: 800 }}
  >
    {formatINR(stats.pendingRevenue[pendingRevenuePeriod])}
  </div>
</div>

<div
  className="dpx-row"
  style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "14px 10px",
    borderLeft: "4px solid #DC2626",
    marginBottom: 8,
    background: "rgba(220,38,38,.06)",
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
    style={{ fontSize: 20, color: "#DC2626", fontWeight: 800 }}
  >
    {formatINR(stats.overdueRevenue)}
  </div>
</div>

<div
  className="dpx-row"
  style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "14px 10px",
    borderLeft: "4px solid #2563EB",
    marginBottom: 8,
    background: "rgba(37,99,235,.06)",
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
    style={{ fontSize: 20, color: "#2563EB", fontWeight: 800 }}
  >
    {stats.pendingPayments}
  </div>
</div>

<div
  className="dpx-row"
  style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "14px 10px",
    borderLeft: "4px solid #7C3AED",
    background: "rgba(124,58,237,.06)",
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
    style={{ fontSize: 20, color: "#7C3AED", fontWeight: 800 }}
  >
    {stats.pendingCollabs}
  </div>
</div>
</div>

{/* --- NEW: Payment Health gauge. Purely a display of stats.paymentHealth,
     which was already being computed in utils/dashboard.js but never shown
     anywhere in the UI. No new data, no new logic. --- */}
{health && health.score !== null && (
  <div className="dp-card dpx-card" style={{ padding: 20, marginBottom: 16 }}>
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 14,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: 10,
            background: `${health.color}1A`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Zap size={18} strokeWidth={2.4} color={health.color} />
        </div>
        <div className="dp-display" style={{ fontSize: 16, fontWeight: 800 }}>
          Payment Health
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: 5,
        }}
      >
        <span
          className="dp-display dp-mono"
          style={{ fontSize: 24, fontWeight: 800, color: health.color }}
        >
          {health.score}
        </span>
        <span style={{ fontSize: 12, color: "var(--slate)", fontWeight: 700 }}>
          /100
        </span>
      </div>
    </div>

    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "4px 10px",
        borderRadius: 999,
        background: `${health.color}1A`,
        color: health.color,
        fontSize: 12,
        fontWeight: 700,
        marginBottom: 14,
      }}
    >
      {health.label}
    </div>

    <div
      style={{
        display: "flex",
        height: 10,
        borderRadius: 999,
        overflow: "hidden",
        background: "var(--line)",
      }}
    >
      <div
        className="dpx-segbar-seg"
        style={{ width: `${health.segmentPercents.paid}%`, background: "#16A34A" }}
      />
      <div
        className="dpx-segbar-seg"
        style={{ width: `${health.segmentPercents.pending}%`, background: "#F59E0B" }}
      />
      <div
        className="dpx-segbar-seg"
        style={{ width: `${health.segmentPercents.overdue}%`, background: "#DC2626" }}
      />
    </div>

    <div
      style={{
        display: "flex",
        gap: 14,
        marginTop: 10,
        fontSize: 11.5,
        color: "var(--slate)",
        fontWeight: 600,
        flexWrap: "wrap",
      }}
    >
      <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
        <span style={{ width: 8, height: 8, borderRadius: 999, background: "#16A34A", display: "inline-block" }} />
        Paid
      </span>
      <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
        <span style={{ width: 8, height: 8, borderRadius: 999, background: "#F59E0B", display: "inline-block" }} />
        Pending
      </span>
      <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
        <span style={{ width: 8, height: 8, borderRadius: 999, background: "#DC2626", display: "inline-block" }} />
        Overdue
      </span>

      {health.overdueCount > 0 && (
        <span style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 4, color: "#DC2626" }}>
          <AlertTriangle size={12} strokeWidth={2.6} />
          {health.overdueCount} overdue deal{health.overdueCount === 1 ? "" : "s"}
        </span>
      )}
    </div>
  </div>
)}

<div className="dp-card dpx-card" style={{ padding: 18, marginBottom: 16 }}>

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
      display: "flex",
      alignItems: "center",
      gap: 4,
      border: "none",
      background: "rgba(124,58,237,.08)",
      padding: "6px 10px",
      borderRadius: 999,
      cursor: "pointer",
      color: "#7C3AED",
      fontWeight: 700,
      fontSize: 13,
    }}
  >
    {analyticsMonth}
    <ChevronDown
      size={14}
      strokeWidth={2.6}
      style={{
        transform: showMonthDropdown ? "rotate(180deg)" : "rotate(0deg)",
        transition: "transform .15s ease",
      }}
    />
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
            color: month === analyticsMonth ? "#7C3AED" : "var(--ink)",
            background: month === analyticsMonth ? "rgba(124,58,237,.08)" : "transparent",
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
      iconColor: "#16A34A",
    },
    {
     icon: Handshake,
      title: "Deals",
      value: analyticsDeals.length,
      color: "#DBEAFE",
      iconColor: "#2563EB",
    },
    {
      icon: TrendingUp,
      title: "Average Deal",
      value: formatINR(averageDealValue),
      color: "#FEF3C7",
      iconColor: "#D97706",
    },
    {
      icon: Trophy,
      title: "Highest Deal",
      value: formatINR(highestDealAmount),
      color: "#F3E8FF",
      iconColor: "#7C3AED",
    },
    {
      icon: Star,
      title: "Top Brand",
      value: topPayingBrand?.brand_name || "—",
      color: "#FCE7F3",
      iconColor: "#DB2777",
    },
  ].map((item, index) => (
    <div
      key={item.title}
      className="dpx-row"
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "14px 10px",
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
    flexShrink: 0,
  }}
>
  <item.icon
    size={20}
    strokeWidth={2.2}
    color={item.iconColor}
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
          fontWeight: 800,
          color: item.iconColor,
          textAlign: "right",
          maxWidth: "45%",
        }}
      >
        {item.value}
      </div>
    </div>
  ))}

</div>
</div>
      {hasChartData && (
        <div className="dp-card dpx-card" style={{ padding: "16px 8px 8px", marginBottom: 16 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              paddingLeft: 10,
            }}
          >
            <div className="dp-label" style={{ marginBottom: 0 }}>
              Earnings received — last 8 weeks
            </div>
            <span
              className="dpx-live-dot"
              style={{
                width: 6,
                height: 6,
                borderRadius: 999,
                background: "#16A34A",
                display: "inline-block",
              }}
            />
          </div>
          <div style={{ height: 110 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 8, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="dpxBarGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7C3AED" />
                    <stop offset="100%" stopColor="#EC4899" />
                  </linearGradient>
                </defs>
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: "var(--slate)" }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(v) => formatINR(v)} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {chartData.map((_, i) => <Cell key={i} fill="url(#dpxBarGradient)" />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
      )}
<div className="dp-card dpx-card" style={{ padding: 16, marginBottom: 16 }}>
  <div
    style={{
      width: 34,
      height: 34,
      borderRadius: 10,
      background: "#DCFCE7",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 8,
    }}
  >
    <Receipt size={16} color="#16a34a" strokeWidth={2.4} />
  </div>

  <div
    className="dp-display"
    style={{
      fontSize: 22,
      fontWeight: 800,
      color: "#16A34A",
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