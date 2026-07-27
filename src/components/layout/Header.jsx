import logo from "../../assets/logo.svg";
import { Menu } from "lucide-react";
function Header({ onMenu, title, account }) {
const displayName =
  account?.full_name ||
  account?.name ||
  "Creator";

const initials = displayName
  .trim()
  .split(/\s+/)
  .map((word) => word[0])
  .slice(0, 2)
  .join("")
  .toUpperCase();
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
    <div
  style={{
    display: "flex",
    alignItems: "center",
    gap: 8,
    userSelect: "none",
  }}
>
  <img
    src={logo}
    alt="DealPass"
    width={32}
    height={32}
    draggable={false}
  />

  <div
    className="dp-display"
    style={{
      fontSize: 20,
      fontWeight: 700,
      letterSpacing: "-0.04em",
      color: "var(--ink)",
    }}
  >
    DealPass
  </div>
</div>
  <div
  style={{
    width: 36,
    height: 36,
    borderRadius: "50%",
    background: "var(--surface)",
    border: "1px solid var(--line)",
    color: "var(--ink)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 13,
    fontWeight: 700,
    flexShrink: 0,
  }}
>
  {initials || "U"}
</div>
    </div>
  );
}
export default Header;