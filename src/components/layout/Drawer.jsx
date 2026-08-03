import {
  LayoutDashboard,
  Briefcase,
  User,
  LogOut,
  FileText,
} from "lucide-react";  

function Drawer({ open, onClose, page, setPage, onLogout, account }) {
  if (!open) return null;
 const items = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "deals", label: "Your deals", icon: Briefcase },
  { key: "invoices", label: "Invoices", icon: FileText },
  { key: "profile", label: "Profile", icon: User },
];
  return (
    <>
      <div className="dp-drawer-backdrop" onClick={onClose} />
      <div className="dp-drawer">
    <div
  style={{
    padding: "22px 20px 18px",
    borderBottom: "1px solid rgba(255,255,255,0.1)",
    display: "flex",
    alignItems: "center",
    gap: 14,
  }}
>
  <div
    style={{
      width: 52,
      height: 52,
      borderRadius: "50%",
      overflow: "hidden",
      background: "rgba(255,255,255,0.08)",
      border: "1px solid rgba(255,255,255,0.15)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    }}
  >
    {account?.avatar_url ? (
      <img
        src={account.avatar_url}
        alt={account?.full_name}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      />
    ) : (
      <span
        style={{
          fontWeight: 700,
          fontSize: 18,
          color: "var(--paper)",
        }}
      >
        {(account?.full_name || "Creator")
          .split(" ")
          .map((w) => w[0])
          .slice(0, 2)
          .join("")
          .toUpperCase()}
      </span>
    )}
  </div>

  {/* min-width: 0 lets this flex child shrink below its content size,
      which is what allows the ellipsis truncation below to actually
      kick in instead of pushing the box wider than the drawer. */}
  <div style={{ minWidth: 0, flex: 1 }}>
    <div
      className="dp-display"
      style={{
        fontSize: 18,
        fontWeight: 700,
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
      }}
      title={account?.full_name || "Creator"}
    >
      {account?.full_name || "Creator"}
    </div>

    <div
      style={{
        fontSize: 12.5,
        opacity: 0.65,
        marginTop: 3,
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
      }}
      title={account?.email}
    >
      {account?.email}
    </div>
  </div>
</div>
        <div style={{ flex: 1, padding: 10 }}>
          {items.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => { setPage(key); onClose(); }}
              style={{
                display: "flex", alignItems: "center", gap: 12, width: "100%", textAlign: "left",
                padding: "12px 12px", borderRadius: 12, border: "none", cursor: "pointer", marginBottom: 4,
                background: page === key ? "rgba(255,59,92,0.18)" : "transparent",
                color: page === key ? "#FF6E87" : "var(--paper)",
                fontWeight: page === key ? 700 : 500, fontSize: 14.5,
              }}
            >
              <Icon size={18} /> {label}
            </button>
          ))}
        </div>
        <div style={{ padding: 14, borderTop: "1px solid rgba(255,255,255,0.1)" }}>
     <button
    onClick={() => {
        onClose();
        onLogout();
    }}
    style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        width: "100%",
        background: "none",
        border: "none",
        color: "var(--paper)",
        opacity: 0.75,
        cursor: "pointer",
        padding: "10px 12px",
        fontSize: 14,
    }}
>
    <LogOut size={17} />
    Log out
</button>
        </div>
      </div>
    </>
  );
}
export default Drawer;