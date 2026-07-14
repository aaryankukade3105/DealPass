import {
  LayoutDashboard,
  Briefcase,
  User,
  LogOut,
} from "lucide-react";

function Drawer({ open, onClose, page, setPage, onLogout, account }) {
  if (!open) return null;
  const items = [
    { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { key: "deals", label: "Your deals", icon: Briefcase },
    { key: "profile", label: "Profile", icon: User },
  ];
  return (
    <>
      <div className="dp-drawer-backdrop" onClick={onClose} />
      <div className="dp-drawer">
        <div style={{ padding: "22px 20px 18px", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
          <div className="dp-display" style={{ fontSize: 19, fontWeight: 700 }}>DealPass</div>
          <div style={{ fontSize: 12.5, opacity: 0.6, marginTop: 2 }}>{account?.name}</div>
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