import { useState, useEffect } from "react";
import { X, Share, SquarePlus, Sparkles } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Detection                                                          */
/* ------------------------------------------------------------------ */

// True on iPhone/iPad Safari specifically — excludes Chrome/Firefox/etc
// on iOS (they can't install PWAs this way) and excludes iOS apps that
// embed Safari's engine via a webview (those have their own "share").
function isIosSafari() {
  if (typeof window === "undefined") return false;
  const ua = window.navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(ua) && !window.MSStream;
  // iPadOS 13+ reports as "Macintosh" but has touch support — catch that too.
  const isIpadOS13 = navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
  const isSafari = /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS|OPiOS|mercury/.test(ua);
  return (isIOS || isIpadOS13) && isSafari;
}

// True if the site is already running as an installed home-screen app
// (standalone mode) — no point telling someone to install it twice.
function isStandalone() {
  if (typeof window === "undefined") return false;
  return (
    window.navigator.standalone === true ||
    window.matchMedia?.("(display-mode: standalone)").matches
  );
}

// The ONLY thing that permanently silences this banner is the visitor
// confirming they actually added it. A plain "X" dismiss is just a
// this-view close — it comes back next time they land on the page.
const INSTALLED_KEY = "dp_ios_added_to_home_screen";

function alreadyConfirmedInstalled() {
  try {
    return localStorage.getItem(INSTALLED_KEY) === "true";
  } catch {
    return false; // localStorage unavailable (private mode etc) — just show it
  }
}

function markConfirmedInstalled() {
  try {
    localStorage.setItem(INSTALLED_KEY, "true");
  } catch {
    /* ignore */
  }
}

/* ------------------------------------------------------------------ */
/*  Banner — sits above the auth card, matches the frosted-glass look   */
/* ------------------------------------------------------------------ */
export default function IOSInstallPrompt() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Show it every time on iOS Safari, unless: it's already running as an
    // installed home-screen app, OR the visitor previously confirmed
    // "Yes, I added it" (see the button below).
    if (isIosSafari() && !isStandalone() && !alreadyConfirmedInstalled()) {
      // small delay so it doesn't compete with the page's own entrance animation
      const t = setTimeout(() => setVisible(true), 500);
      return () => clearTimeout(t);
    }
  }, []);

  if (!visible) return null;

  // Plain close — just hides it for this page view. It'll be back next
  // time they land here, since they haven't confirmed installing yet.
  const dismiss = () => setVisible(false);

  // Visitor confirms they went through the steps — silence it for good.
  const confirmInstalled = () => {
    markConfirmedInstalled();
    setVisible(false);
  };

  return (
    <div
      style={{
        position: "relative",
        zIndex: 2,
        margin: "0 0 16px",
        borderRadius: 18,
        background: "rgba(255,255,255,0.6)",
        backdropFilter: "blur(20px) saturate(180%)",
        WebkitBackdropFilter: "blur(20px) saturate(180%)",
        border: "1.5px solid rgba(255,59,92,0.35)",
        boxShadow: "0 10px 30px rgba(255,59,92,0.18)",
        overflow: "hidden",
        animation: "dp-ios-in 320ms ease-out",
      }}
    >
      <style>{`
        @keyframes dp-ios-in {
          from { opacity: 0; transform: translateY(-8px) scale(.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes dp-ios-bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        @keyframes dp-ios-glow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(255,59,92,0.35); }
          50% { box-shadow: 0 0 0 6px rgba(255,59,92,0); }
        }
      `}</style>

      {/* Header — always-visible headline, no click-to-expand gate */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "11px 12px 8px",
        }}
      >
        <div
          style={{
            width: 30,
            height: 30,
            borderRadius: 9,
            flexShrink: 0,
            background: "linear-gradient(135deg, #FF3B5C, #FF7A59)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 3px 10px rgba(255,59,92,.35)",
            animation: "dp-ios-glow 2.2s ease-in-out infinite",
          }}
        >
          <Sparkles size={14} color="#fff" />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 800, fontSize: 13, color: "var(--ink)" }}>
            📲 Install DealPass — 2 taps
          </div>
          <div style={{ fontSize: 11, color: "var(--slate)", marginTop: 0 }}>
            Faster access, full-screen, no browser bar
          </div>
        </div>

        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss"
          style={{
            width: 22, height: 22, borderRadius: "50%", border: "none",
            background: "rgba(20,20,30,0.06)", color: "var(--slate)",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", flexShrink: 0,
          }}
        >
          <X size={11} />
        </button>
      </div>

      {/* Steps — shown immediately, nothing to click through to find them */}
      <div style={{ padding: "0 12px 12px" }}>
        <div style={{ height: 1, background: "rgba(20,20,30,0.08)", marginBottom: 10 }} />

        <Step
          number={1}
          text={
            <>
              Tap the <strong>Share</strong> icon in Safari's toolbar
            </>
          }
          icon={<Share size={13} strokeWidth={2.4} />}
        />
        <Step
          number={2}
          text={
            <>
              Scroll down, tap <strong>Add to Home Screen</strong>
            </>
          }
          icon={<SquarePlus size={13} strokeWidth={2.4} />}
        />
        <Step number={3} text={<>Tap <strong>Add</strong> — that's it 🎉</>} last />

        <div
          style={{
            marginTop: 10,
            marginBottom: 10,
            padding: "7px 10px",
            borderRadius: 9,
            background: "rgba(37,99,235,.07)",
            color: "#1E40AF",
            fontSize: 10.5,
            lineHeight: 1.4,
          }}
        >
          The Share icon usually sits in the bottom toolbar (or top-right on iPad).
        </div>

        <div style={{ display: "flex", gap: 7 }}>
          <button
            type="button"
            onClick={dismiss}
            style={{
              flex: 1, padding: "8px 0", borderRadius: 10, border: "1px solid rgba(20,20,30,0.12)",
              background: "rgba(255,255,255,0.5)", color: "var(--slate)", fontSize: 11.5, fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Maybe later
          </button>
          <button
            type="button"
            onClick={confirmInstalled}
            style={{
              flex: 1, padding: "8px 0", borderRadius: 10, border: "none",
              background: "linear-gradient(135deg, #FF3B5C, #FF7A59)", color: "#fff",
              fontSize: 11.5, fontWeight: 700, cursor: "pointer",
              boxShadow: "0 3px 10px rgba(255,59,92,.28)",
            }}
          >
            Yes, added it ✓
          </button>
        </div>
      </div>
    </div>
  );
}

function Step({ number, text, icon, last }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: last ? 0 : 7 }}>
      <div
        style={{
          width: 18, height: 18, borderRadius: "50%", flexShrink: 0,
          background: "rgba(255,59,92,.12)", color: "var(--signal)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 10, fontWeight: 800, marginTop: 1,
        }}
      >
        {number}
      </div>
      <div style={{ fontSize: 12, color: "var(--ink)", lineHeight: 1.4, display: "flex", alignItems: "center", gap: 5, flexWrap: "wrap" }}>
        {text}
        {icon && (
          <span style={{ display: "inline-flex", color: "var(--slate)", animation: "dp-ios-bounce 1.6s ease-in-out infinite" }}>
            {icon}
          </span>
        )}
      </div>
    </div>
  );
}