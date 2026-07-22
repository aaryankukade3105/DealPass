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
  Moon, 
  Sun,
} from "lucide-react";

import { formatDate, formatINR } from "../utils/formatters";
import {
  KeyRound,
  LogOut,
  Trash2,
} from "lucide-react";

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
}) {
  const highestDeal =
    deals.length > 0
      ? deals.reduce((a, b) =>
          Number(a.commercials) > Number(b.commercials) ? a : b
        )
      : null;

  const brandsWorked = new Set(
    deals.map((d) => d.brand_name)
  ).size;

  const averageDeal =
    deals.length > 0
      ? deals.reduce(
          (sum, d) => sum + Number(d.commercials || 0),
          0
        ) / deals.length
      : 0;

  const brandFrequency = {};

  deals.forEach((d) => {
    brandFrequency[d.brand_name] =
      (brandFrequency[d.brand_name] || 0) + 1;
  });

  const mostWorkedBrand =
    Object.keys(brandFrequency).length > 0
      ? Object.keys(brandFrequency).reduce((a, b) =>
          brandFrequency[a] > brandFrequency[b] ? a : b
        )
      : "—";

  const StatCard = ({ icon, label, value }) => (
    <div
      className="dp-card"
      style={{
        padding: 16,
        textAlign: "center",
      }}
    >
      <div
        style={{
          color: "var(--signal)",
          marginBottom: 10,
          display: "flex",
          justifyContent: "center",
        }}
      >
        {icon}
      </div>

      <div
        className="dp-display"
        style={{
          fontWeight: 700,
          fontSize: 22,
        }}
      >
        {value}
      </div>

      <div
        style={{
          marginTop: 4,
          fontSize: 12,
          color: "var(--slate)",
        }}
      >
        {label}
      </div>
    </div>
  );

const InfoRow = ({
  icon,
  title,
  value,
  onClick,
  danger = false,
}) => (
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
        background: danger
          ? "rgba(214,40,40,.08)"
          : "rgba(255,59,92,.08)",
        color: danger ? "#D62828" : "var(--signal)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      {icon}
    </div>

    <div
      style={{
        flex: 1,
        marginLeft: 14,
      }}
    >
      <div
        style={{
          fontSize: 15,
          fontWeight: 600,
          color: danger ? "#D62828" : "var(--ink)",
        }}
      >
        {title}
      </div>

      <div
        style={{
          marginTop: 4,
          fontSize: 13,
          color: "var(--slate)",
        }}
      >
        {value}
      </div>
    </div>

    {onClick && (
      <ChevronRight
        size={18}
        color="#B8B8B8"
      />
    )}
  </button>
);
  return (
    <div className="dp-page">

      {/* PROFILE HEADER */}

      <div
        className="dp-card"
        style={{
          textAlign: "center",
          padding: 28,
          marginBottom: 18,
        }}
      >
        <div
          style={{
            width: 88,
            height: 88,
            margin: "0 auto",
            borderRadius: "50%",
            background: "var(--signal)",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 32,
            fontWeight: 700,
          }}
        >
          {account?.full_name
            ?.split(" ")
            .map((n) => n[0])
            .join("")
            .slice(0, 2)}
        </div>

        <div
          className="dp-display"
          style={{
            marginTop: 18,
            fontSize: 28,
            fontWeight: 700,
          }}
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

      {/* DEALPASS ID */}

      <div
  className="dp-card"
  style={{
    padding: 22,
    marginBottom: 18,
  }}
>
        <div className="dp-display">
          DealPass ID
        </div>

        <div
          style={{
            marginTop: 16,
            fontSize: 28,
            fontWeight: 700,
            letterSpacing: 2,
          }}
        >
          DP-
          {account?.id
            ?.replace(/-/g, "")
            .substring(0, 6)
            .toUpperCase()}
        </div>

        <div
          style={{
            marginTop: 6,
            color: "var(--slate)",
          }}
        >
          Member since {formatDate(account?.created_at)}
        </div>
      </div>

      {/* STATISTICS */}

      <div
        className="dp-display"
        style={{
          marginBottom: 12,
        }}
      >
        Your Statistics
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
          value={
            deals.filter(
              (d) => d.deal_status === "Completed"
            ).length
          }
        />
      </div>

      {/* CREATOR INSIGHTS */}

      <div className="dp-card">

        <div
          className="dp-display"
          style={{
            marginBottom: 14,
          }}
        >
          Creator Insights
        </div>

        <InfoRow
          icon={<Award size={18} />}
          title="Highest Paying Brand"
          value={
            highestDeal
              ? `${highestDeal.brand_name} • ${formatINR(
                  highestDeal.commercials
                )}`
              : "—"
          }
        />

        <InfoRow
          icon={<Building2 size={18} />}
          title="Most Worked With"
          value={mostWorkedBrand}
        />

        <InfoRow
          icon={<TrendingUp size={18} />}
          title="Average Deal Value"
          value={formatINR(Math.round(averageDeal))}
        />

        <InfoRow
          icon={<BadgeIndianRupee size={18} />}
          title="Brands Worked With"
          value={brandsWorked}
        />
      </div>
            {/* SECURITY */}

      <div
        className="dp-card"
        style={{
          marginTop: 22,
        }}
      >
        <div
          className="dp-display"
          style={{ marginBottom: 14 }}
        >
          Security
        </div>

       <InfoRow
  icon={<KeyRound size={18} />}
  title="Change Password"
  value="Update your account password"
  onClick={onChangePassword}
/>

<InfoRow
  icon={<LogOut size={18} />}
  title="Sign Out"
  value="Log out from this device"
  onClick={onLogout}
/>

<InfoRow
  icon={<Trash2 size={18} />}
  title="Request Account Deletion"
  value="Submt a request to permanently delete your account"
  danger
  onClick={onDeleteAccount}
/>
      </div>

      {/* DATA */}

      <div
        className="dp-card"
        style={{
          marginTop: 22,
        }}
      >
        <div
          className="dp-display"
          style={{ marginBottom: 14 }}
        >
          Data
        </div>

      <InfoRow
  icon={<Download size={18} />}
  title="Export CSV"
  value="Download all your deals as a CSV file"
  onClick={onExportCSV}
/>

       <InfoRow
  icon={<Briefcase size={18} />}
  title="Export Excel"
  value="Download all your deals as an Excel workbook"
  onClick={onExportExcel}
/>

        <InfoRow
    icon={<CloudDownload size={18} />}
    title="Download Backup"
    value="Save a complete backup of your account"
    onClick={onDownloadBackup}
/>
        <InfoRow
    icon={<Upload size={18} />}
    title="Import Backup"
    value="Restore a DealPass backup"
    onClick={onImportBackup}
/>
      </div>

      {/* PREFERENCES */}

      <div
        className="dp-card"
        style={{
          marginTop: 22,
        }}
      >
        <div
          className="dp-display"
          style={{ marginBottom: 14 }}
        >
          Preferences
        </div>

        <InfoRow
          icon={<BadgeIndianRupee size={18} />}
          title="Currency"
          value="INR"
        />

        <InfoRow
          icon={<Clock size={18} />}
          title="Notifications"
          value="Coming Soon"
        />

       <InfoRow
  icon={
    darkMode ? (
      <Sun size={18} />
    ) : (
      <Moon size={18} />
    )
  }
  title={darkMode ? "Light Mode" : "Dark Mode"}
  value="Tap to switch appearance"
  onClick={() => setDarkMode((prev) => !prev)}
/>
      </div>

      {/* SUPPORT */}

      <div
        className="dp-card"
        style={{
          marginTop: 22,
        }}
      >
        <div
          className="dp-display"
          style={{ marginBottom: 14 }}
        >
          Support
        </div>

       <InfoRow
  icon={<Bug size={18} />}
  title="Report a Bug"
  value="Found something that's not working?"
  onClick={onReportBug}
/>

<InfoRow
  icon={<Lightbulb size={18} />}
  title="Suggest a Feature"
  value="Help us improve DealPass"
  onClick={onSuggestFeature}
/>

<InfoRow
  icon={<Mail size={18} />}
  title="Contact Us"
  value="Get in touch with the DealPass team"
  onClick={onContactUs}
/>
      </div>

      {/* ABOUT */}

      <div
        className="dp-card"
        style={{
          marginTop: 22,
          marginBottom: 40,
          textAlign: "center",
        }}
      >
        <div
          className="dp-display"
          style={{ marginBottom: 20 }}
        >
          About DealPass
        </div>

        <div
          style={{
            fontSize: 22,
            fontWeight: 700,
          }}
        >
          DealPass
        </div>

        <div
          style={{
            color: "var(--slate)",
            marginTop: 6,
          }}
        >
          Creator Collaboration Manager
        </div>

        <div
          style={{
            marginTop: 18,
            color: "var(--slate)",
          }}
        >
          Version 1.0.0
        </div>

        <div
  style={{
    marginTop: 18,
    paddingTop: 16,
    borderTop: "1px dashed var(--line)",
  }}
>
  <div
    style={{
      fontSize: 12,
      fontWeight: 700,
      letterSpacing: 1,
      color: "var(--slate)",
      marginBottom: 8,
    }}
  >
    FUN FACT
  </div>

  <div
    style={{
      fontSize: 13,
      color: "var(--slate)",
      lineHeight: 1.6,
    }}
  >
    Your next brand deal shouldn't be
    <br />
    found in a 3-month-old chat. 😉
  </div>
</div>
      </div>

    </div>
  );
}

export default ProfilePage;