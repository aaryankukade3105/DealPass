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
  FileText,
  FileCheck2,
  FileClock,
  FileX2,
  Send,
  CalendarClock,
  CalendarDays,
  CalendarCheck2,
  Plus,
  Activity,
  Gift,
  CheckCircle2,
  XCircle,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";

import { formatINR } from "../utils/formatters";
import { computeStats, buildChartData } from "../utils/dashboard";

/* ============================================================================
   NOTE ON ASSUMPTIONS (please adjust the constants below if your enum strings
   differ from these — nothing here changes the data model, it only reads it):
   - deal.deal_status is one of DEAL_STATUSES
   - deal.payment_status is one of "Pending" | "Partially Paid" | "Paid" | "Overdue"
   - deal.collaboration_type is "Paid" | "Barter"
   - deal.invoice_number (truthy) => invoice has been created for the deal
   - deal.invoice_sent (bool) => invoice has been sent
   - deal.payment_deadline => ISO date string used for payment due tracking
   - deal.content_due_date (optional, may not exist yet) => used for "content
     due" tracking. If this field doesn't exist in your data yet, those rows
     simply won't appear (rows are hidden when their value is 0), so nothing
     breaks — add the field later and the card will start populating itself.
   ========================================================================== */

const DEAL_STATUSES = [
  { key: "Negotiation", color: "#64748B", bg: "rgba(100,116,139,0.14)" },
  { key: "Confirmed", color: "#2563EB", bg: "rgba(37,99,235,0.14)" },
  { key: "Content Shot", color: "#7C3AED", bg: "rgba(124,58,237,0.14)" },
  { key: "Content Submitted", color: "#4F46E5", bg: "rgba(79,70,229,0.14)" },
  { key: "Posted", color: "#0D9488", bg: "rgba(13,148,136,0.14)" },
  { key: "Completed", color: "#16A34A", bg: "rgba(22,163,74,0.14)" },
  { key: "Cancelled", color: "#DC2626", bg: "rgba(220,38,38,0.14)" },
];

const PAYMENT_STATUS_COLORS = {
  Paid: "#16A34A",
  Pending: "#D97706",
  "Partially Paid": "#2563EB",
  Overdue: "#DC2626",
  Barter: "#7C3AED",
};

/* ---------- shared glass primitives (unchanged design language) ---------- */

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

/* ============================================================================
   Reusable row primitive — replaces the old ActionRow / AnalyticsRow with one
   shared component so nothing is duplicated across sections.
   ========================================================================== */

const Row = ({ icon, iconBg, title, subtitle, value, valueColor, last, onClick }) => (
  <div
    onClick={onClick}
    className={onClick ? "dp-row-hover" : undefined}
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "14px 4px",
      borderBottom: last ? "none" : "1px solid rgba(20,20,30,0.07)",
      cursor: onClick ? "pointer" : "default",
      borderRadius: 12,
    }}
  >
    <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
      <div style={iconTile(iconBg)}>{icon}</div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: 14.5 }}>{title}</div>
        {subtitle && (
          <div style={{ fontSize: 12, color: "var(--slate)", marginTop: 1 }}>{subtitle}</div>
        )}
      </div>
    </div>
    <div
      className="dp-display"
      style={{ fontSize: 18, fontWeight: 800, color: valueColor, flexShrink: 0, marginLeft: 10 }}
    >
      {value}
    </div>
  </div>
);

/* Section wrapper so every card gets a consistent header treatment */
const SectionCard = ({ icon, iconBg, title, subtitle, right, children, style }) => (
  <div style={{ ...glassCard, ...style }}>
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 6,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {icon && <div style={iconTile(iconBg)}>{icon}</div>}
        <div>
          <div className="dp-display" style={{ fontSize: 16.5, fontWeight: 800 }}>
            {title}
          </div>
          {subtitle && (
            <div style={{ fontSize: 12, color: "var(--slate)", marginTop: 1 }}>{subtitle}</div>
          )}
        </div>
      </div>
      {right}
    </div>
    {children}
  </div>
);

/* Small stat pill used inside the Brand Deals card */
const MiniStat = ({ label, value, color }) => (
  <div
    style={{
      flex: 1,
      textAlign: "center",
      padding: "10px 6px",
      borderRadius: 14,
      background: "rgba(255,255,255,0.4)",
      border: "1px solid rgba(20,20,30,0.07)",
    }}
  >
    <div className="dp-display" style={{ fontSize: 18, fontWeight: 800, color: color || "var(--ink)" }}>
      {value}
    </div>
    <div style={{ fontSize: 11, color: "var(--slate)", fontWeight: 600, marginTop: 2 }}>{label}</div>
  </div>
);

/* Horizontal proportional segment bar + legend, reused for payment health & pipeline */
const SegmentBreakdown = ({ segments }) => {
  const visible = segments.filter((s) => s.value > 0);
  const total = visible.reduce((sum, s) => sum + s.value, 0);

  if (total === 0) return null;

  return (
    <div>
      <div
        style={{
          display: "flex",
          width: "100%",
          height: 10,
          borderRadius: 999,
          overflow: "hidden",
          marginBottom: 14,
          background: "rgba(20,20,30,0.06)",
        }}
      >
        {visible.map((s) => (
          <div
            key={s.label}
            title={`${s.label}: ${s.value}`}
            style={{
              width: `${(s.value / total) * 100}%`,
              background: s.color,
              transition: "width .3s ease",
            }}
          />
        ))}
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
        {visible.map((s) => (
          <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5 }}>
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: 999,
                background: s.color,
                display: "inline-block",
              }}
            />
            <span style={{ fontWeight: 700, color: "var(--ink)" }}>{s.value}</span>
            <span style={{ color: "var(--slate)", fontWeight: 500 }}>{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const QuickActionButton = ({ icon, label, onClick, accent }) => (
  <button className="dp-quick-action" onClick={onClick} style={{ "--accent": accent }}>
    <div className="dp-quick-action-icon">{icon}</div>
    <span>{label}</span>
    <ArrowUpRight size={14} className="dp-quick-action-arrow" />
  </button>
);

/* ---------------------------------- date helpers ---------------------------------- */

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function daysFromNow(n) {
  const d = startOfToday();
  d.setDate(d.getDate() + n);
  return d;
}

function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function parseDate(val) {
  if (!val) return null;
  const d = new Date(val);
  return isNaN(d.getTime()) ? null : d;
}

/* ============================================================================
   Main component
   ========================================================================== */

function DashboardPage({
  deals,
  account,
  onAddDeal,
  onOpenDeal,
  onCreateInvoice,
  onViewPendingPayments,
  onViewInvoices,
}) {
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

  /* ---------- Brand Deals breakdown (Paid / Barter / Total) ---------- */
  const dealTypeCounts = useMemo(() => {
    const total = deals.length;
    const paid = deals.filter((d) => d.collaboration_type === "Paid").length;
    const barter = deals.filter((d) => d.collaboration_type === "Barter").length;
    return { total, paid, barter };
  }, [deals]);

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

  /* ---------- Invoice summary ---------- */
  const invoiceSummary = useMemo(() => {
    const created = deals.filter((d) => d.invoice_number && String(d.invoice_number).trim() !== "");
    const sent = created.filter((d) => d.invoice_sent);
    return {
      total: created.length,
      created: created.length,
      notCreated: deals.length - created.length,
      sent: sent.length,
    };
  }, [deals]);

  /* ---------- Deadlines (content + payments) ---------- */
  const deadlines = useMemo(() => {
    const today = startOfToday();
    const weekEnd = daysFromNow(7);

    let contentDueToday = 0;
    let contentDueThisWeek = 0;
    let paymentsDueThisWeek = 0;
    let overduePayments = 0;

    deals.forEach((d) => {
      const contentDue = parseDate(d.content_due_date);
      if (contentDue) {
        if (isSameDay(contentDue, today)) contentDueToday += 1;
        if (contentDue >= today && contentDue <= weekEnd) contentDueThisWeek += 1;
      }

      const payDue = parseDate(d.payment_deadline);
      const isPaid = d.payment_status === "Paid";
      if (payDue && !isPaid) {
        if (payDue >= today && payDue <= weekEnd) paymentsDueThisWeek += 1;
        if (payDue < today) overduePayments += 1;
      }
    });

    return { contentDueToday, contentDueThisWeek, paymentsDueThisWeek, overduePayments };
  }, [deals]);

  /* ---------- Action Center (dynamic, zero-value rows hidden) ---------- */
  const actionCenterItems = useMemo(() => {
    const invoiceNotCreated = invoiceSummary.notCreated;
    const invoiceCreatedNotSent = invoiceSummary.created - invoiceSummary.sent;

    return [
      {
        key: "pendingRevenue",
        icon: <Banknote size={19} strokeWidth={2.2} color="#D97706" />,
        iconBg: "rgba(217,119,6,0.14)",
        title: "Pending Revenue",
        subtitle: "Awaiting payment",
        rawValue: stats.pendingRevenue[pendingRevenuePeriod],
        value: formatINR(stats.pendingRevenue[pendingRevenuePeriod]),
        valueColor: "#D97706",
        onClick: onViewPendingPayments,
      },
      {
        key: "overdueRevenue",
        icon: <AlertTriangle size={19} strokeWidth={2.2} color="#DC2626" />,
        iconBg: "rgba(220,38,38,0.12)",
        title: "Overdue Revenue",
        subtitle: "Requires follow-up",
        rawValue: stats.overdueRevenue,
        value: formatINR(stats.overdueRevenue),
        valueColor: "#DC2626",
        onClick: onViewPendingPayments,
      },
      {
        key: "pendingPayments",
        icon: <CreditCard size={19} strokeWidth={2.2} color="#2563EB" />,
        iconBg: "rgba(37,99,235,0.12)",
        title: "Pending Payments",
        subtitle: "Brands yet to pay",
        rawValue: stats.pendingPayments,
        value: stats.pendingPayments,
        valueColor: "#2563EB",
        onClick: onViewPendingPayments,
      },
      {
        key: "pendingContent",
        icon: <Clapperboard size={19} strokeWidth={2.2} color="#7C3AED" />,
        iconBg: "rgba(124,58,237,0.12)",
        title: "Pending Content",
        subtitle: "Content yet to post",
        rawValue: stats.pendingCollabs,
        value: stats.pendingCollabs,
        valueColor: "#7C3AED",
      },
      {
        key: "invoiceNotCreated",
        icon: <FileX2 size={19} strokeWidth={2.2} color="#DC2626" />,
        iconBg: "rgba(220,38,38,0.12)",
        title: "Invoice Not Created",
        subtitle: "No invoice generated yet",
        rawValue: invoiceNotCreated,
        value: invoiceNotCreated,
        valueColor: "#DC2626",
        onClick: onCreateInvoice,
      },
      {
        key: "invoiceNotSent",
        icon: <FileClock size={19} strokeWidth={2.2} color="#D97706" />,
        iconBg: "rgba(217,119,6,0.14)",
        title: "Invoice Not Sent",
        subtitle: "Created but pending delivery",
        rawValue: invoiceCreatedNotSent,
        value: invoiceCreatedNotSent,
        valueColor: "#D97706",
        onClick: onViewInvoices,
      },
      {
        key: "contentDueToday",
        icon: <CalendarCheck2 size={19} strokeWidth={2.2} color="#0D9488" />,
        iconBg: "rgba(13,148,136,0.14)",
        title: "Content Due Today",
        subtitle: "Ship it today",
        rawValue: deadlines.contentDueToday,
        value: deadlines.contentDueToday,
        valueColor: "#0D9488",
      },
      {
        key: "paymentsDueThisWeek",
        icon: <CalendarClock size={19} strokeWidth={2.2} color="#2563EB" />,
        iconBg: "rgba(37,99,235,0.12)",
        title: "Payments Due This Week",
        subtitle: "Follow up before they're overdue",
        rawValue: deadlines.paymentsDueThisWeek,
        value: deadlines.paymentsDueThisWeek,
        valueColor: "#2563EB",
        onClick: onViewPendingPayments,
      },
    ].filter((item) => item.rawValue > 0);
  }, [stats, pendingRevenuePeriod, invoiceSummary, deadlines, onViewPendingPayments, onCreateInvoice, onViewInvoices]);

  /* ---------- Payment health ---------- */
  const paymentHealth = useMemo(() => {
    const paid = deals.filter((d) => d.payment_status === "Paid").length;
    const pending = deals.filter((d) => d.payment_status === "Pending").length;
    const partial = deals.filter((d) => d.payment_status === "Partially Paid").length;
    const overdue = deals.filter((d) => d.payment_status === "Overdue").length;
    const barter = deals.filter((d) => d.collaboration_type === "Barter").length;

    return { paid, pending, partial, overdue, barter };
  }, [deals]);

  const paymentHealthSegments = [
    { label: "Paid", value: paymentHealth.paid, color: PAYMENT_STATUS_COLORS.Paid },
    { label: "Pending", value: paymentHealth.pending, color: PAYMENT_STATUS_COLORS.Pending },
    { label: "Partially Paid", value: paymentHealth.partial, color: PAYMENT_STATUS_COLORS["Partially Paid"] },
    { label: "Overdue", value: paymentHealth.overdue, color: PAYMENT_STATUS_COLORS.Overdue },
    { label: "Barter", value: paymentHealth.barter, color: PAYMENT_STATUS_COLORS.Barter },
  ];

  /* ---------- Deal pipeline ---------- */
  const pipelineCounts = useMemo(() => {
    return DEAL_STATUSES.map((status) => ({
      ...status,
      value: deals.filter((d) => d.deal_status === status.key).length,
    }));
  }, [deals]);

  const pipelineSegments = pipelineCounts.map((s) => ({
    label: s.key,
    value: s.value,
    color: s.color,
  }));

  /* ---------- Upcoming deadlines list (hidden if all zero) ---------- */
  const deadlineRows = useMemo(
    () =>
      [
        {
          key: "contentToday",
          icon: <CalendarCheck2 size={19} strokeWidth={2.2} color="#0D9488" />,
          iconBg: "rgba(13,148,136,0.14)",
          title: "Content Due Today",
          value: deadlines.contentDueToday,
          valueColor: "#0D9488",
        },
        {
          key: "contentWeek",
          icon: <CalendarDays size={19} strokeWidth={2.2} color="#7C3AED" />,
          iconBg: "rgba(124,58,237,0.12)",
          title: "Content Due This Week",
          value: deadlines.contentDueThisWeek,
          valueColor: "#7C3AED",
        },
        {
          key: "paymentsWeek",
          icon: <CalendarClock size={19} strokeWidth={2.2} color="#2563EB" />,
          iconBg: "rgba(37,99,235,0.12)",
          title: "Payments Due This Week",
          value: deadlines.paymentsDueThisWeek,
          valueColor: "#2563EB",
        },
        {
          key: "paymentsOverdue",
          icon: <AlertTriangle size={19} strokeWidth={2.2} color="#DC2626" />,
          iconBg: "rgba(220,38,38,0.12)",
          title: "Overdue Payments",
          value: deadlines.overduePayments,
          valueColor: "#DC2626",
        },
      ].filter((row) => row.value > 0),
    [deadlines]
  );

  /* ---------- Recent activity (latest deals, newest first) ---------- */
  const recentActivity = useMemo(() => {
    const withDate = deals.map((d) => {
      const ts =
        parseDate(d.updated_at) ||
        parseDate(d.created_at) ||
        parseDate(d.confirmation_date) ||
        null;
      return { deal: d, ts };
    });

    withDate.sort((a, b) => {
      if (a.ts && b.ts) return b.ts - a.ts;
      if (a.ts) return -1;
      if (b.ts) return 1;
      return 0;
    });

    return withDate.slice(0, 5).map((x) => x.deal);
  }, [deals]);

  /* ---------- Hero overview line ---------- */
  const overviewLine = useMemo(() => {
    const bits = [];
    if (stats.pendingPayments > 0) bits.push(`${stats.pendingPayments} pending payment${stats.pendingPayments > 1 ? "s" : ""}`);
    if (stats.pendingCollabs > 0) bits.push(`${stats.pendingCollabs} deal${stats.pendingCollabs > 1 ? "s" : ""} in progress`);
    if (deadlineRows.some((r) => r.key === "paymentsOverdue")) bits.push("overdue follow-ups");

    if (bits.length === 0) return "You're all caught up. Nothing urgent today.";
    return `You have ${bits.join(", ")}.`;
  }, [stats, deadlineRows]);

  return (
    <div
      className="dp-scroll"
      style={{
        flex: 1,
        overflowY: "auto",
        padding: "18px 18px 90px",
      }}
    >
      {/* ---------- inline hover styles for new interactive elements ---------- */}
      <style>{`
        .dp-row-hover { transition: background .15s ease, transform .15s ease; }
        .dp-row-hover:hover { background: rgba(108,92,231,0.06); transform: translateX(2px); }

        .dp-quick-action {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          padding: 14px 14px;
          border-radius: 16px;
          border: 1px solid rgba(20,20,30,0.08);
          background: rgba(255,255,255,0.5);
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
          cursor: pointer;
          font-weight: 700;
          font-size: 13.5px;
          color: var(--ink);
          text-align: left;
          transition: transform .15s ease, box-shadow .15s ease, border-color .15s ease;
        }
        .dp-quick-action:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 24px rgba(31,38,135,0.14);
          border-color: rgba(108,92,231,0.35);
        }
        .dp-quick-action-icon {
          width: 34px;
          height: 34px;
          border-radius: 10px;
          background: color-mix(in srgb, var(--accent) 16%, white);
          color: var(--accent);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .dp-quick-action span { flex: 1; }
        .dp-quick-action-arrow { opacity: 0.4; transition: opacity .15s ease, transform .15s ease; }
        .dp-quick-action:hover .dp-quick-action-arrow { opacity: 1; transform: translate(2px,-2px); }

        .dp-card-hover { transition: transform .15s ease, box-shadow .15s ease; }
        .dp-card-hover:hover { transform: translateY(-2px); box-shadow: 0 12px 30px rgba(31,38,135,0.14); }
      `}</style>

      {/* ---------- 1. Hero ---------- */}
      <div style={{ marginBottom: 22 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 14,
              background: "linear-gradient(135deg, rgba(255,59,92,0.16), rgba(255,59,92,0.06))",
              backdropFilter: "blur(4px)",
              color: "var(--signal)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 14px rgba(255,59,92,0.15)",
              flexShrink: 0,
            }}
          >
            <User size={22} strokeWidth={2.2} />
          </div>

          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 13, color: "var(--slate)", fontWeight: 500 }}>Welcome back,</div>
            <div className="dp-display" style={{ fontSize: 23, fontWeight: 800, marginTop: 1 }}>
              {(account?.full_name || account?.name || "Creator").split(" ")[0]}
            </div>
          </div>
        </div>

        <div
          style={{
            marginTop: 12,
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 13,
            color: "var(--slate)",
            fontWeight: 600,
          }}
        >
          <Sparkles size={14} color="#6C5CE7" />
          {overviewLine}
        </div>
      </div>

      {/* ---------- 12. Quick actions ---------- */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 10,
          marginBottom: 18,
        }}
      >
        <QuickActionButton
          icon={<Plus size={17} strokeWidth={2.4} />}
          label="Add Deal"
          accent="#6C5CE7"
          onClick={onAddDeal}
        />
        <QuickActionButton
          icon={<Receipt size={17} strokeWidth={2.4} />}
          label="Create Invoice"
          accent="#2563EB"
          onClick={onCreateInvoice}
        />
        <QuickActionButton
          icon={<Banknote size={17} strokeWidth={2.4} />}
          label="Pending Payments"
          accent="#D97706"
          onClick={onViewPendingPayments}
        />
        <QuickActionButton
          icon={<FileText size={17} strokeWidth={2.4} />}
          label="View Invoices"
          accent="#16A34A"
          onClick={onViewInvoices}
        />
      </div>

      {/* ---------- 2. Earnings Overview ---------- */}
      <div style={{ ...glassCard, padding: 24 }} className="dp-card-hover">
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

      {/* ---------- 3. Brand Deals Made ---------- */}
      <div style={glassCard} className="dp-card-hover">
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
          style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 14 }}
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

        <div style={{ display: "flex", gap: 8 }}>
          <MiniStat label="Paid" value={dealTypeCounts.paid} color="#16A34A" />
          <MiniStat label="Barter" value={dealTypeCounts.barter} color="#7C3AED" />
          <MiniStat label="Total" value={dealTypeCounts.total} color="var(--ink)" />
        </div>
      </div>

      {/* ---------- 4. Action Center ---------- */}
      {actionCenterItems.length > 0 && (
        <SectionCard
          icon={<HandCoins size={19} strokeWidth={2.2} color="#DC2626" />}
          iconBg="rgba(220,38,38,0.12)"
          title="Action Center"
          subtitle="Things that need your attention"
        >
          <div style={{ marginTop: 8 }}>
            {actionCenterItems.map((item, i) => (
              <Row
                key={item.key}
                icon={item.icon}
                iconBg={item.iconBg}
                title={item.title}
                subtitle={item.subtitle}
                value={item.value}
                valueColor={item.valueColor}
                onClick={item.onClick}
                last={i === actionCenterItems.length - 1}
              />
            ))}
          </div>
        </SectionCard>
      )}

      {/* ---------- 5. Monthly Analytics ---------- */}
      <div style={glassCard} className="dp-card-hover">
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
          <Row icon={<Wallet size={19} strokeWidth={2.2} color="#111827" />} iconBg="rgba(22,163,74,0.14)" title="Revenue" subtitle="This month" value={formatINR(monthlyRevenue)} />
          <Row icon={<Handshake size={19} strokeWidth={2.2} color="#111827" />} iconBg="rgba(37,99,235,0.14)" title="Deals" subtitle="This month" value={analyticsDeals.length} />
          <Row
            icon={<TrendingUp size={19} strokeWidth={2.2} color="#111827" />}
            iconBg="rgba(217,119,6,0.14)"
            title="Average Deal"
            subtitle="This month"
            value={formatINR(averageDealValue)}
          />
          <Row
            icon={<Trophy size={19} strokeWidth={2.2} color="#111827" />}
            iconBg="rgba(124,58,237,0.14)"
            title="Highest Deal"
            subtitle="This month"
            value={formatINR(highestDealAmount)}
          />
          <Row
            icon={<Star size={19} strokeWidth={2.2} color="#111827" />}
            iconBg="rgba(219,39,119,0.14)"
            title="Top Brand"
            subtitle="This month"
            value={topPayingBrand?.brand_name || "—"}
            last
          />
        </div>
      </div>

      {/* ---------- 6. Chart ---------- */}
      {hasChartData && (
        <div style={{ ...glassCard, padding: "20px 12px 14px" }} className="dp-card-hover">
          <div className="dp-label" style={{ paddingLeft: 8, marginBottom: 8 }}>
            Earnings received — last 8 weeks
          </div>
          <div style={{ height: 130 }}>
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

      {/* ---------- 7. Payment Health ---------- */}
      {deals.length > 0 && (
        <SectionCard
          icon={<Receipt size={19} strokeWidth={2.2} color="#16a34a" />}
          iconBg="rgba(22,163,74,0.14)"
          title="Payment Health"
          subtitle="Where every deal's money stands"
          right={
            <div style={{ textAlign: "right" }}>
              <div className="dp-display" style={{ fontSize: 22, fontWeight: 800, color: "#16A34A" }}>
                {stats.collectionRate}%
              </div>
              <div style={{ fontSize: 11, color: "var(--slate)", fontWeight: 600 }}>Collection Rate</div>
            </div>
          }
        >
          <div style={{ marginTop: 10 }}>
            <SegmentBreakdown segments={paymentHealthSegments} />
          </div>
        </SectionCard>
      )}

      {/* ---------- 8. Deal Pipeline ---------- */}
      {deals.length > 0 && (
        <SectionCard
          icon={<Activity size={19} strokeWidth={2.2} color="#6C5CE7" />}
          iconBg="rgba(108,92,231,0.14)"
          title="Deal Pipeline"
          subtitle="Every deal, by current stage"
        >
          <div style={{ marginTop: 10 }}>
            <SegmentBreakdown segments={pipelineSegments} />
          </div>
        </SectionCard>
      )}

      {/* ---------- 9. Upcoming Deadlines ---------- */}
      {deadlineRows.length > 0 && (
        <SectionCard
          icon={<CalendarClock size={19} strokeWidth={2.2} color="#2563EB" />}
          iconBg="rgba(37,99,235,0.12)"
          title="Upcoming Deadlines"
          subtitle="Content and payments to keep an eye on"
        >
          <div style={{ marginTop: 8 }}>
            {deadlineRows.map((row, i) => (
              <Row
                key={row.key}
                icon={row.icon}
                iconBg={row.iconBg}
                title={row.title}
                value={row.value}
                valueColor={row.valueColor}
                last={i === deadlineRows.length - 1}
              />
            ))}
          </div>
        </SectionCard>
      )}

      {/* ---------- 10. Invoice Summary ---------- */}
      {invoiceSummary.total > 0 && (
        <SectionCard
          icon={<FileCheck2 size={19} strokeWidth={2.2} color="#2563EB" />}
          iconBg="rgba(37,99,235,0.12)"
          title="Invoice Summary"
        >
          <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
            <MiniStat label="Total" value={invoiceSummary.total} color="var(--ink)" />
            <MiniStat label="Created" value={invoiceSummary.created} color="#2563EB" />
            <MiniStat label="Not Created" value={invoiceSummary.notCreated} color="#DC2626" />
            <MiniStat label="Sent" value={invoiceSummary.sent} color="#16A34A" />
          </div>
        </SectionCard>
      )}

      {/* ---------- 11. Recent Activity ---------- */}
      <div className="dp-label" style={{ marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
        <Activity size={14} />
        Recent activity
      </div>

      {recentActivity.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {recentActivity.map((deal) => (
            <DealCard key={deal.id} deal={deal} onClick={() => onOpenDeal(deal)} compact />
          ))}
        </div>
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