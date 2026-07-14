import { Menu } from "lucide-react";
function Header({ onMenu, title, account }) {
  const initials = (account?.name || "?").trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  return (
    <div
      style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "14px 18px", borderBottom: "1px solid var(--line)", background: "var(--paper)",
      }}
    >
      <button onClick={onMenu} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--ink)", padding: 0 }} aria-label="Open menu">
        <Menu size={22} />
      </button>
      <div className="dp-display" style={{ fontWeight: 700, fontSize: 16 }}>{title}</div>
      <div
        style={{
          width: 32, height: 32, borderRadius: "50%", background: "var(--ink)", color: "var(--paper)",
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700,
        }}
      >
        {initials || "U"}
      </div>
    </div>
  );
}
export default Header;