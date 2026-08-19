import React from "react";
import {
  User,
  Calendar,
  Wallet,
  Briefcase,
  Clock,
  CheckCircle2,
  Award,
  Building2,
  TrendingUp,
  BadgeIndianRupee,
  Download,
  CloudDownload,
  Upload,
  Bug,
  Lightbulb,
  Mail,
  ChevronRight,
  ArrowRight,
  Moon,
  Sun,
  ReceiptText,
  ShieldCheck,
} from "lucide-react";

import { formatDate, formatINR } from "../utils/formatters";
import { KeyRound, LogOut, Trash2 } from "lucide-react";

/* One accent per section — a visual wayfinding cue, not a status signal.
   Danger stays red regardless of section, and the billing CTA keeps its
   own urgent treatment only while it's actually incomplete. */
const COLORS = {
  billing: "#4F46E5", // indigo — matches the payout profile's own accent
  stats: "#2563EB", // blue
  insights: "#7C3AED", // violet
  security: "#E11D48", // rose
  data: "#0D9488", // teal
  preferences: "#D97706", // amber
  support: "#16A34A", // green
};

function hexToRgba(hex, alpha) {
  const h = hex.replace("#", "");
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function ProfilePage({
  account,
  deals,
  stats,
  onChangePassword,
  onLogout,
  onDeleteAccount,
  onExportCSV,
  onExportExcel,
  onDownloadBackup,
  onImportBackup,
  onReportBug,
  onSuggestFeature,
  onContactUs,
  darkMode,
  setDarkMode,
  onOpenBillingProfile,
}) {
  const highestDeal =
    deals.length > 0
      ? deals.reduce((a, b) =>
          Number(a.commercials) > Number(b.commercials) ? a : b
        )
      : null;

  const brandsWorked = new Set(deals.map((d) => d.brand_name)).size;

  const averageDeal =
    deals.length > 0
      ? deals.reduce((sum, d) => sum + Number(d.commercials || 0), 0) /
        deals.length
      : 0;
  // Billing profile completeness — every field the payout profile now
  // requires: phone, account holder, bank name, account number, IFSC, UPI.
  // Swap in account.billing_complete if that's computed server-side instead.
 const billingComplete = Boolean(
  account?.phone &&
    account?.account_holder &&
    account?.bank_name &&
    account?.account_number &&
    account?.ifsc &&
    account?.upi_id
);

  const StatCard = ({ icon, label, value }) => (
    <div className="dp-card" style={{ padding: 16, textAlign: "center" }}>
      <div
        style={{
          color: COLORS.stats,
          marginBottom: 10,
          display: "flex",
          justifyContent: "center",
        }}
      >
        {icon}
      </div>
      <div className="dp-display" style={{ fontWeight: 700, fontSize: 22 }}>
        {value}
      </div>
      <div style={{ marginTop: 4, fontSize: 12, color: "var(--slate)" }}>
        {label}
      </div>
    </div>
  );

  const InfoRow = ({ icon, title, value, onClick, color = "var(--signal)", danger = false, trailing }) => (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        padding: "16px 18px",
        background: "transparent",
        border: "none",
        borderBottom: "1px solid var(--line)",
        cursor: onClick ? "pointer" : "default",
        textAlign: "left",
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 12,
          background: danger ? "rgba(214,40,40,.08)" : hexToRgba(color === "var(--signal)" ? "#FF3B5C" : color, 0.1),
          color: danger ? "#D62828" : color,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {icon}
      </div>

      <div style={{ flex: 1, marginLeft: 14 }}>
        <div
          style={{
            fontSize: 15,
            fontWeight: 600,
            color: danger ? "#D62828" : "var(--ink)",
          }}
        >
          {title}
        </div>
        <div style={{ marginTop: 4, fontSize: 13, color: "var(--slate)" }}>
          {value}
        </div>
      </div>

      {trailing}
      {onClick && !trailing && <ChevronRight size={18} color="#B8B8B8" />}
    </button>
  );

  const SectionCard = ({ color, title, children }) => (
    <div className="dp-card" style={{ marginTop: 22, overflow: "hidden" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "16px 18px 12px",
        }}
      >
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: color,
            flexShrink: 0,
          }}
        />
        <span className="dp-display" style={{ fontSize: 13, letterSpacing: 0.3 }}>
          {title}
        </span>
      </div>
      {children}
    </div>
  );

  return (
    <div className="dp-page">
      {/* PROFILE HEADER */}
      <div
        className="dp-card"
        style={{ textAlign: "center", padding: 28, marginBottom: 18 }}
      >
        <div
          style={{
            width: 88,
            height: 88,
            margin: "0 auto",
            borderRadius: "50%",
            overflow: "hidden",
            background: "var(--signal)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {account?.avatar_url ? (
            <img
              src={account.avatar_url}
              alt={account?.full_name}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <span style={{ color: "#fff", fontSize: 32, fontWeight: 700 }}>
              {(account?.full_name || "Creator")
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)}
            </span>
          )}
        </div>

        <div
          className="dp-display"
          style={{ marginTop: 18, fontSize: 28, fontWeight: 700 }}
        >
          {account?.full_name}
        </div>

        <div
          style={{
            color: "var(--slate)",
            marginTop: 8,
            marginBottom: 4,
            fontSize: 14,
          }}
        >
          {account?.email}
        </div>
      </div>

      {/* BILLING — only demands attention while it's actually incomplete.
          Once every required field is filled, there's nothing to act on,
          so it drops straight into the ordinary section list below. */}
      {!billingComplete && (
        <button
          type="button"
          onClick={onOpenBillingProfile}
          style={{
            width: "100%",
            display: "block",
            marginBottom: 18,
            padding: 0,
            border: "none",
            cursor: "pointer",
            textAlign: "left",
          }}
        >
          <div
            style={{
              position: "relative",
              overflow: "hidden",
              borderRadius: 18,
              padding: "24px 22px",
              background: `linear-gradient(135deg, ${COLORS.billing} 0%, #7C3AED 100%)`,
              boxShadow: `0 10px 24px -8px ${hexToRgba(COLORS.billing, 0.45)}`,
            }}
          >
            <ReceiptText
              size={120}
              style={{
                position: "absolute",
                right: -18,
                bottom: -24,
                opacity: 0.14,
                color: "#fff",
                transform: "rotate(-8deg)",
              }}
            />

            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "5px 10px",
                borderRadius: 999,
                background: "rgba(255,255,255,.18)",
                color: "#fff",
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: 0.4,
                textTransform: "uppercase",
              }}
            >
              Action needed
            </div>

            <div
              style={{
                marginTop: 12,
                fontSize: 21,
                fontWeight: 800,
                color: "#fff",
                lineHeight: 1.25,
                maxWidth: 260,
              }}
            >
              Complete your billing profile
            </div>

            <div
              style={{
                marginTop: 6,
                fontSize: 13.5,
                color: "rgba(255,255,255,.88)",
                lineHeight: 1.5,
                maxWidth: 280,
              }}
            >
              Fill it up to start generating invoices for your brand deals.
            </div>

            <div
              style={{
                marginTop: 18,
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 16px",
                borderRadius: 12,
                background: "#fff",
                color: COLORS.billing,
                fontSize: 14,
                fontWeight: 700,
              }}
            >
              Complete now
              <ArrowRight size={16} />
            </div>
          </div>
        </button>
      )}

      {/* DEALPASS ID */}
      <div className="dp-card" style={{ padding: 22, marginBottom: 18 }}>
        <div className="dp-display">DealPass ID</div>
        <div
          style={{ marginTop: 16, fontSize: 28, fontWeight: 700, letterSpacing: 2 }}
        >
          DP-
          {account?.id?.replace(/-/g, "").substring(0, 6).toUpperCase()}
        </div>
        <div style={{ marginTop: 6, color: "var(--slate)" }}>
          Member since {formatDate(account?.created_at)}
        </div>
      </div>

      {/* STATISTICS */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: COLORS.stats }} />
        <span className="dp-display" style={{ fontSize: 13, letterSpacing: 0.3 }}>
          Your Statistics
        </span>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 14,
          marginBottom: 24,
        }}
      >
        <StatCard
          icon={<Wallet />}
          label="Lifetime Earnings"
          value={formatINR(stats.totalEarnings)}
        />
        <StatCard
          icon={<Briefcase />}
          label="Deals"
          value={stats.dealCounts.total}
        />
        <StatCard
          icon={<Clock />}
          label="Pending Payments"
          value={stats.pendingPayments}
        />
        <StatCard
          icon={<CheckCircle2 />}
          label="Completed Deals"
          value={deals.filter((d) => d.deal_status === "Completed").length}
        />
      </div>

      {/* CREATOR INSIGHTS */}
      <SectionCard color={COLORS.insights} title="Creator Insights">
        <InfoRow
          icon={<Award size={18} />}
          title="Highest Paying Brand"
          color={COLORS.insights}
          value={
            highestDeal
              ? `${highestDeal.brand_name} • ${formatINR(highestDeal.commercials)}`
              : "—"
          }
        />

        <InfoRow
          icon={<TrendingUp size={18} />}
          title="Average Deal Value"
          color={COLORS.insights}
          value={formatINR(Math.round(averageDeal))}
        />
        <InfoRow
          icon={<BadgeIndianRupee size={18} />}
          title="Brands Worked With"
          color={COLORS.insights}
          value={brandsWorked}
        />
      </SectionCard>

      {/* BILLING & INVOICING — appears here, as a normal section, once
          there's nothing left to act on. */}
      {billingComplete && (
        <SectionCard color={COLORS.billing} title="Billing & Invoicing">
          <InfoRow
            icon={<Wallet size={18} />}
            title="Billing Information"
            color={COLORS.billing}
            value="Bank details, PAN, GST and invoice information"
            onClick={onOpenBillingProfile}
            trailing={
              <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                <CheckCircle2 size={16} color="#16A34A" />
                <ChevronRight size={18} color="#B8B8B8" />
              </div>
            }
          />
        </SectionCard>
      )}

      {/* SECURITY */}
      <SectionCard color={COLORS.security} title="Security">
        <InfoRow
          icon={<KeyRound size={18} />}
          title="Change Password"
          color={COLORS.security}
          value="Update your account password"
          onClick={onChangePassword}
        />
        <InfoRow
          icon={<LogOut size={18} />}
          title="Sign Out"
          color={COLORS.security}
          value="Log out from this device"
          onClick={onLogout}
        />
        <InfoRow
          icon={<Trash2 size={18} />}
          title="Request Account Deletion"
          value="Submit a request to permanently delete your account"
          danger
          onClick={onDeleteAccount}
        />
      </SectionCard>

      {/* DATA */}
      <SectionCard color={COLORS.data} title="Data">
        <InfoRow
          icon={<Download size={18} />}
          title="Export CSV"
          color={COLORS.data}
          value="Download all your deals as a CSV file"
          onClick={onExportCSV}
        />
        <InfoRow
          icon={<Briefcase size={18} />}
          title="Export Excel"
          color={COLORS.data}
          value="Download all your deals as an Excel workbook"
          onClick={onExportExcel}
        />
        <InfoRow
          icon={<CloudDownload size={18} />}
          title="Download Backup"
          color={COLORS.data}
          value="Save a complete backup of your account"
          onClick={onDownloadBackup}
        />
        <InfoRow
          icon={<Upload size={18} />}
          title="Import Backup"
          color={COLORS.data}
          value="Restore a DealPass backup"
          onClick={onImportBackup}
        />
      </SectionCard>

      {/* PREFERENCES */}
      <SectionCard color={COLORS.preferences} title="Preferences">
        <InfoRow
          icon={<BadgeIndianRupee size={18} />}
          title="Currency"
          color={COLORS.preferences}
          value="INR"
        />
        <InfoRow
          icon={<Clock size={18} />}
          title="Notifications"
          color={COLORS.preferences}
          value="Coming Soon"
        />
        <InfoRow
          icon={darkMode ? <Sun size={18} /> : <Moon size={18} />}
          title={darkMode ? "Light Mode" : "Dark Mode"}
          color={COLORS.preferences}
          value="Tap to switch appearance"
          onClick={() => setDarkMode((prev) => !prev)}
        />
      </SectionCard>

      {/* SUPPORT */}
      <SectionCard color={COLORS.support} title="Support">
        <InfoRow
          icon={<Bug size={18} />}
          title="Report a Bug"
          color={COLORS.support}
          value="Found something that's not working?"
          onClick={onReportBug}
        />
        <InfoRow
          icon={<Lightbulb size={18} />}
          title="Suggest a Feature"
          color={COLORS.support}
          value="Help us improve DealPass"
          onClick={onSuggestFeature}
        />
        <InfoRow
          icon={<Mail size={18} />}
          title="Contact Us"
          color={COLORS.support}
          value="Get in touch with the DealPass team"
          onClick={onContactUs}
        />
      </SectionCard>

      {/* ABOUT */}
      <div
        className="dp-card"
        style={{
          marginTop: 22,
          marginBottom: 40,
          textAlign: "center",
          padding: 28,
        }}
      >
    <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: -0.5 }}>
  DealPass
</div>

<div
  style={{
    marginTop: 8,
    color: "var(--slate)",
    fontSize: 15,
  }}
>
  Creator Collaboration Manager
</div>

<div
  style={{
    marginTop: 24,
    paddingTop: 20,
    borderTop: "1px solid var(--line)",
    color: "var(--slate)",
    fontSize: 13,
    lineHeight: 1.6,
  }}
>
  Built to help creators keep their collaborations,
  deliverables, payments, and invoices organized in one place.
</div>
        <div
  style={{
    marginTop: 20,
    paddingTop: 18,
    borderTop: "1px solid var(--line)",
    color: "var(--slate)",
    fontSize: 12,
  }}
>
  DealPass · Version 1.0.3
</div>
      </div>
    </div>
  );
}

export default ProfilePage;