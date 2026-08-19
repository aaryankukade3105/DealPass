import { useState, useRef, useEffect } from "react";
import logo from "../../assets/logo.svg";
import { Menu, User, LogOut } from "lucide-react";

function Header({ onMenu, title, account, onOpenProfile, onLogout }) {
  const displayName = account?.full_name || account?.name || "Creator";

  const initials = displayName
    .trim()
    .split(/\s+/)
    .map((word) => word[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const [menuOpen, setMenuOpen] = useState(false);
  const avatarRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (
        avatarRef.current && !avatarRef.current.contains(e.target) &&
        menuRef.current && !menuRef.current.contains(e.target)
      ) {
        setMenuOpen(false);
      }
    }
    function handleEscape(e) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [menuOpen]);

  return (
    <div
      style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "14px 18px", borderBottom: "1px solid var(--line)", background: "var(--paper)",
        position: "relative",
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

      <div style={{ position: "relative" }}>
        <button
          ref={avatarRef}
          type="button"
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-haspopup="true"
          aria-expanded={menuOpen}
          aria-label="Account menu"
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            overflow: "hidden",
            background: "var(--surface)",
            border: menuOpen ? "1.5px solid var(--signal)" : "1px solid var(--line)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            cursor: "pointer",
            padding: 0,
            transition: "border-color 120ms ease",
          }}
        >
          {account?.avatar_url ? (
            <img
              src={account.avatar_url}
              alt={displayName}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          ) : (
            <span
              style={{
                color: "var(--ink)",
                fontSize: 13,
                fontWeight: 700,
              }}
            >
              {initials || "U"}
            </span>
          )}
        </button>

        {menuOpen && (
          <div
            ref={menuRef}
            role="menu"
            style={{
              position: "absolute",
              top: "calc(100% + 8px)",
              right: 0,
              minWidth: 200,
              background: "#fff",
              border: "1px solid var(--line)",
              borderRadius: 14,
              boxShadow: "0 12px 28px rgba(21,24,35,.14)",
              overflow: "hidden",
              zIndex: 60,
              animation: "dpHeaderMenuIn 140ms ease-out",
            }}
          >
            <div
              style={{
                padding: "12px 14px 10px",
                borderBottom: "1px solid var(--line)",
              }}
            >
              <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--ink)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {displayName}
              </div>
              {account?.email && (
                <div style={{ fontSize: 11.5, color: "var(--slate)", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {account.email}
                </div>
              )}
            </div>

            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setMenuOpen(false);
                onOpenProfile?.();
              }}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "12px 14px",
                background: "none",
                border: "none",
                cursor: "pointer",
                textAlign: "left",
                fontSize: 14,
                fontWeight: 600,
                color: "var(--ink)",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#F7F8FC")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
            >
              <User size={16} color="var(--slate)" />
              Profile
            </button>

            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setMenuOpen(false);
                onLogout?.();
              }}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "12px 14px",
                background: "none",
                border: "none",
                borderTop: "1px solid var(--line)",
                cursor: "pointer",
                textAlign: "left",
                fontSize: 14,
                fontWeight: 600,
                color: "#D62828",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(214,40,40,.06)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
            >
              <LogOut size={16} color="#D62828" />
              Log out
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes dpHeaderMenuIn {
          from { opacity: 0; transform: translateY(-4px) scale(.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}

export default Header;