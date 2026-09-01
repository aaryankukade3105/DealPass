import { useState, useEffect, useRef } from "react";
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
  // Excludes other iOS browser shells (Chrome, Firefox, Edge, Opera, the
  // Google app's in-app browser, and other engines that borrow "Safari"
  // in their UA string) plus generic in-app webviews, none of which
  // support "Add to Home Screen" the same way.
  const isSafari =
    /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS|OPiOS|mercury|GSA|FBAN|FBAV|Instagram|Line\//.test(ua);
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

// The thing that permanently silences this banner is the visitor
// confirming they actually added it. A plain "Maybe later" only snoozes
// it — see SNOOZE_KEY below — it isn't a forever-dismiss.
const INSTALLED_KEY = "dp_ios_added_to_home_screen";

// "Maybe later" writes a timestamp here instead of just hiding for the
// current page view. Re-prompting on literally every single visit trains
// people to reflexively dismiss it without reading; waiting a few days
// gives it a real second chance without being naggy.
const SNOOZE_KEY = "dp_ios_install_snoozed_at";
const SNOOZE_DAYS = 7;

function safeGet(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null; // localStorage unavailable (private mode etc.)
  }
}

function safeSet(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* ignore */
  }
}

function alreadyConfirmedInstalled() {
  return safeGet(INSTALLED_KEY) === "true";
}

function isSnoozed() {
  const snoozedAt = Number(safeGet(SNOOZE_KEY));
  if (!snoozedAt) return false;
  const daysSince = (Date.now() - snoozedAt) / (1000 * 60 * 60 * 24);
  return daysSince < SNOOZE_DAYS;
}

function markConfirmedInstalled() {
  safeSet(INSTALLED_KEY, "true");
}

function markSnoozed() {
  safeSet(SNOOZE_KEY, String(Date.now()));
}

/* ------------------------------------------------------------------ */
/*  Banner — sits above the auth card, matches the frosted-glass look   */
/* ------------------------------------------------------------------ */
export default function IOSInstallPrompt() {
  // Three-phase visibility so we can animate out before unmounting,
  // instead of the banner just vanishing instantly on dismiss.
  const [phase, setPhase] = useState("hidden"); // "hidden" | "visible" | "leaving"
  const leaveTimeoutRef = useRef(null);

  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    // Show it on iOS Safari, unless: it's already running as an installed
    // home-screen app, the visitor previously confirmed "Yes, I added
    // it", or they snoozed it recently.
    if (isIosSafari() && !isStandalone() && !alreadyConfirmedInstalled() && !isSnoozed()) {
      // small delay so it doesn't compete with the page's own entrance animation
      const t = setTimeout(() => setPhase("visible"), 500);
      return () => clearTimeout(t);
    }
  }, []);

  useEffect(() => () => clearTimeout(leaveTimeoutRef.current), []);

  if (phase === "hidden") return null;

  const leave = (onDone) => {
    if (prefersReducedMotion) {
      onDone();
      setPhase("hidden");
      return;
    }
    setPhase("leaving");
    leaveTimeoutRef.current = setTimeout(() => {
      onDone();
      setPhase("hidden");
    }, 220);
  };

  // Snooze — hides it and holds off re-showing for SNOOZE_DAYS, rather
  // than reappearing on the visitor's very next page load.
  const dismiss = () => leave(markSnoozed);

  // Visitor confirms they went through the steps — silence it for good.
  const confirmInstalled = () => leave(markConfirmedInstalled);

  return (
    <div
      role="dialog"
      aria-label="Install DealPass to your home screen"
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
        animation: prefersReducedMotion
          ? "none"
          : phase === "leaving"
          ? "dp-ios-out 200ms ease-in forwards"
          : "dp-ios-in 320ms ease-out",
      }}
    >
      <style>{`
        @keyframes dp-ios-in {
          from { opacity: 0; transform: translateY(-8px) scale(.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes dp-ios-out {
          from { opacity: 1; transform: translateY(0) scale(1); max-height: 260px; }
          to { opacity: 0; transform: translateY(-6px) scale(.98); max-height: 0; }
        }
        @keyframes dp-ios-bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        @keyframes dp-ios-glow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(255,59,92,0.35); }
          50% { box-shadow: 0 0 0 6px rgba(255,59,92,0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .dp-ios-glow, .dp-ios-bounce { animation: none !important; }
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
          className="dp-ios-glow"
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
            animation: prefersReducedMotion ? "none" : "dp-ios-glow 2.2s ease-in-out infinite",
          }}
        >
          <Sparkles size={14} color="#fff" aria-hidden="true" />
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
          aria-label="Dismiss and remind me later"
          style={{
            width: 22, height: 22, borderRadius: "50%", border: "none",
            background: "rgba(20,20,30,0.06)", color: "var(--slate)",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", flexShrink: 0,
          }}
        >
          <X size={11} aria-hidden="true" />
        </button>
      </div>

      {/* Steps — shown immediately, nothing to click through to find them */}
      <div style={{ padding: "0 12px 12px" }}>
        <div style={{ height: 1, background: "rgba(20,20,30,0.08)", marginBottom: 10 }} />

        <ol style={{ margin: 0, padding: 0, listStyle: "none" }}>
          <Step
            number={1}
            text={
              <>
                Tap the <strong>Share</strong> icon in Safari's toolbar
              </>
            }
            icon={<Share size={13} strokeWidth={2.4} aria-hidden="true" />}
            reducedMotion={prefersReducedMotion}
          />
          <Step
            number={2}
            text={
              <>
                Scroll down, tap <strong>Add to Home Screen</strong>
              </>
            }
            icon={<SquarePlus size={13} strokeWidth={2.4} aria-hidden="true" />}
            reducedMotion={prefersReducedMotion}
          />
          <Step number={3} text={<>Tap <strong>Add</strong> — that's it 🎉</>} last />
        </ol>

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

function Step({ number, text, icon, last, reducedMotion }) {
  return (
    <li style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: last ? 0 : 7 }}>
      <div
        style={{
          width: 18, height: 18, borderRadius: "50%", flexShrink: 0,
          background: "rgba(255,59,92,.12)", color: "var(--signal)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 10, fontWeight: 800, marginTop: 1,
        }}
        aria-hidden="true"
      >
        {number}
      </div>
      <div style={{ fontSize: 12, color: "var(--ink)", lineHeight: 1.4, display: "flex", alignItems: "center", gap: 5, flexWrap: "wrap" }}>
        {text}
        {icon && (
          <span
            className="dp-ios-bounce"
            style={{
              display: "inline-flex",
              color: "var(--slate)",
              animation: reducedMotion ? "none" : "dp-ios-bounce 1.6s ease-in-out infinite",
            }}
          >
            {icon}
          </span>
        )}
      </div>
    </li>
  );
}