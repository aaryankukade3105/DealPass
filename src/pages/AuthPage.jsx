import React, { useState, useEffect } from "react";
import {
  Eye,
  EyeOff,
  CheckCircle2,
  Circle,
} from "lucide-react";
import logo from "../assets/logo.svg";
   import IOSInstallPrompt from "../components/common/IOSInstallPrompt";

const PageStyle = () => (
  <style>{`
    .dp-auth-wrap {
      position: relative;
      min-height: 100%;
      overflow: hidden;
    }
    .dp-auth-blob {
      position: absolute;
      border-radius: 50%;
      filter: blur(60px);
      z-index: 0;
      opacity: 0.55;
    }
    .dp-auth-blob.a {
      width: 260px; height: 260px;
      top: -80px; left: -60px;
      background: radial-gradient(circle, rgba(255,59,92,0.35), transparent 70%);
    }
    .dp-auth-blob.b {
      width: 300px; height: 300px;
      bottom: -100px; right: -80px;
      background: radial-gradient(circle, rgba(108,92,231,0.30), transparent 70%);
    }
    .dp-auth-content { position: relative; z-index: 1; }

    .dp-auth-card {
      background: rgba(255,255,255,0.45);
      backdrop-filter: blur(24px) saturate(180%);
      -webkit-backdrop-filter: blur(24px) saturate(180%);
      border: 1px solid rgba(255,255,255,0.55);
      border-radius: 24px;
      box-shadow: 0 8px 32px rgba(31,38,135,0.10);
      padding: 26px 22px;
    }

    .dp-auth-tab {
      flex: 1;
      padding: 11px 0;
      border-radius: 12px;
      border: 1px solid rgba(20,20,30,0.10);
      background: rgba(255,255,255,0.4);
      backdrop-filter: blur(6px);
      -webkit-backdrop-filter: blur(6px);
      color: rgba(20,20,30,0.7);
      font-weight: 700;
      font-size: 14px;
      cursor: pointer;
      transition: all .15s ease;
      text-align: center;
    }
    .dp-auth-tab.active {
      background: linear-gradient(135deg, rgba(255,59,92,0.95), rgba(255,90,120,0.85));
      border-color: rgba(255,59,92,0.5);
      color: #fff;
      box-shadow: 0 6px 18px rgba(255,59,92,0.32);
    }

    .dp-auth-google {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      padding: 12px 0;
      border-radius: 14px;
      border: 1px solid rgba(20,20,30,0.12);
      background: rgba(255,255,255,0.5);
      backdrop-filter: blur(6px);
      -webkit-backdrop-filter: blur(6px);
      font-weight: 600;
      font-size: 14px;
      cursor: pointer;
      color: var(--ink);
      transition: all .15s ease;
    }
    .dp-auth-google:hover {
      background: rgba(255,255,255,0.7);
    }

    .dp-auth-input {
      width: 100%;
      padding: 12px 14px;
      border-radius: 13px;
      border: 1.5px solid rgba(20,20,30,0.10);
      background: rgba(255,255,255,0.5);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      font-size: 14.5px;
      color: var(--ink);
      outline: none;
      transition: border-color .15s ease, box-shadow .15s ease, background .15s ease;
    }
    .dp-auth-input:focus {
      border-color: #6C5CE7;
      background: rgba(255,255,255,0.7);
      box-shadow: 0 0 0 4px rgba(108,92,231,0.12);
    }

    .dp-auth-submit {
      width: 100%;
      padding: 14px 0;
      border-radius: 14px;
      border: none;
      background: linear-gradient(135deg, #FF3B5C, #FF6B85);
      color: #fff;
      font-weight: 700;
      font-size: 15px;
      cursor: pointer;
      box-shadow: 0 8px 22px rgba(255,59,92,0.35);
      transition: transform .15s ease, box-shadow .15s ease;
    }
    .dp-auth-submit:disabled {
      opacity: 0.65;
      cursor: default;
      box-shadow: none;
    }
    .dp-auth-submit:not(:disabled):active {
      transform: scale(0.98);
    }
  `}</style>
);
function Requirement({ ok, children }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        color: ok ? "#16A34A" : "var(--slate)",
        fontSize: 13,
        fontWeight: 500,
        transition: "all .25s ease",
      }}
    >
      {ok ? (
        <CheckCircle2
          size={18}
          color="#16A34A"
          strokeWidth={2.4}
        />
      ) : (
        <Circle
          size={18}
          color="#CBD5E1"
          strokeWidth={2}
        />
      )}

      <span>{children}</span>
    </div>
  );
}
export default function AuthPage({
  mode,
  setMode,
  onSignup,
  onLogin,
  onGoogleLogin,
  error,
  busy,
  showAlert,
  onForgotPassword,
}) {
  const [name, setName] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
const hasLength = password.length >= 8;
const hasUppercase = /[A-Z]/.test(password);
const hasNumber = /\d/.test(password);
const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  useEffect(() => {
    setName("");
    setIdentifier("");
    setPassword("");
    setConfirm("");
    setShowPw(false);
  }, [mode]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (mode === "signup") {
      if (!name.trim()) {
        return showAlert("warning", "Full Name Required", "Please enter your full name.");
      }

      if (!identifier.trim()) {
        return showAlert("warning", "Email Required", "Please enter your email address.");
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(identifier.trim())) {
        return showAlert("warning", "Invalid Email", "Please enter a valid email address.");
      }

      if (!password.trim()) {
        return showAlert("warning", "Password Required", "Please enter your password.");
      }

      if (password.length < 8) {
        return showAlert("warning", "Weak Password", "Password must be at least 8 characters.");
      }
const hasUppercase = /[A-Z]/.test(password);
const hasNumber = /\d/.test(password);
const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

if (!hasUppercase) {
  return showAlert(
    "warning",
    "Weak Password",
    "Password must contain at least one uppercase letter."
  );
}

if (!hasNumber) {
  return showAlert(
    "warning",
    "Weak Password",
    "Password must contain at least one number."
  );
}

if (!hasSpecial) {
  return showAlert(
    "warning",
    "Weak Password",
    "Password must contain at least one special character."
  );
}
      if (!confirm.trim()) {
        return showAlert("warning", "Confirm Password", "Please confirm your password.");
      }

      if (password !== confirm) {
        return showAlert("warning", "Passwords Don't Match", "Password and Confirm Password must match.");
      }

      return onSignup({ name, identifier, password, confirm });
    }

    // Login
    if (!identifier.trim()) {
      return showAlert("warning", "Email Required", "Please enter your email address.");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(identifier.trim())) {
      return showAlert("warning", "Invalid Email", "Please enter a valid email address.");
    }

    if (!password.trim()) {
      return showAlert("warning", "Password Required", "Please enter your password.");
    }

    onLogin({ identifier, password });
  };

  return (
    <div className="dp-auth-wrap">
      <PageStyle />
      <div className="dp-auth-blob a" />
      <div className="dp-auth-blob b" />

      <div
        className="dp-auth-content"
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
          padding: "40px 20px",
          overflowY: "auto",
        }}
      >
        <div
          style={{
            marginBottom: 28,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <img src={logo} alt="DealPass" width={44} height={44} draggable={false} />
            <div
              className="dp-display"
              style={{ fontSize: 34, fontWeight: 700, letterSpacing: "-0.04em" }}
            >
              DealPass
            </div>
          </div>

          <div
            style={{
              color: "var(--slate)",
              fontSize: 14,
              marginTop: 10,
              textAlign: "center",
              lineHeight: 1.6,
              maxWidth: 280,
            }}
          >
            Built for creators with
            <br />
            too many brand deals to remember.
          </div>
        </div>
<IOSInstallPrompt />
        <div className="dp-auth-card">
          <div style={{ display: "flex", gap: 10, marginBottom: 22 }}>
            <button
              type="button"
              onClick={() => setMode("signup")}
              className={`dp-auth-tab ${mode === "signup" ? "active" : ""}`}
            >
              Sign Up
            </button>

            <button
              type="button"
              onClick={() => setMode("login")}
              className={`dp-auth-tab ${mode === "login" ? "active" : ""}`}
            >
              Log In
            </button>
          </div>

          <button type="button" className="dp-auth-google" onClick={onGoogleLogin} style={{ marginBottom: 20 }}>
            <img
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              alt="Google"
              width={18}
              height={18}
            />
            Continue with Google
          </button>

          <div style={{ display: "flex", alignItems: "center", marginBottom: 20 }}>
            <div style={{ flex: 1, height: 1, background: "rgba(20,20,30,0.12)" }} />
            <span style={{ padding: "0 12px", fontSize: 13, color: "var(--slate)" }}>OR</span>
            <div style={{ flex: 1, height: 1, background: "rgba(20,20,30,0.12)" }} />
          </div>

          <form noValidate onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {mode === "signup" && (
              <div>
                <label className="dp-label">Full Name</label>
                <input
                  className="dp-auth-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                />
              </div>
            )}

            <div>
              <label className="dp-label">Email</label>
              <input
                className="dp-auth-input"
                type="email"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label className="dp-label">Password</label>

              <div style={{ position: "relative" }}>
                <input
                  className="dp-auth-input"
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{ paddingRight: 45 }}
                />

                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  style={{
                    position: "absolute",
                    right: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--slate)",
                    display: "flex",
                  }}
                >
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {mode === "login" && (
                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
                  <button
                    type="button"
                    onClick={() => onForgotPassword(identifier)}
                    style={{
                      background: "transparent",
                      border: "none",
                      padding: 0,
                      color: "var(--signal)",
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      marginLeft: "auto",
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateX(3px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateX(0)";
                    }}
                  >
                    Forgot password
                    <span style={{ fontSize: 14 }}>→</span>
                  </button>
                </div>
              )}
            </div>

           {mode === "signup" && (
  <>
    <div
      style={{
        marginTop: 18,
        marginBottom: 20,
        padding: 16,
        borderRadius: 16,
        background: "rgba(108,92,231,.05)",
        border: "1px solid rgba(108,92,231,.12)",
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      <div
        style={{
          fontWeight: 700,
          fontSize: 13,
          color: "var(--ink)",
        }}
      >
        Password Requirements
      </div>

      <Requirement ok={hasLength}>
        Minimum 8 characters
      </Requirement>

      <Requirement ok={hasUppercase}>
        One uppercase letter
      </Requirement>

      <Requirement ok={hasNumber}>
        One number
      </Requirement>

      <Requirement ok={hasSpecial}>
        One special character
      </Requirement>
    </div>

    <div>
      <label className="dp-label">
        Confirm Password
      </label>

      <input
        className="dp-auth-input"
        type={showPw ? "text" : "password"}
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        placeholder="••••••••"
      />
    </div>
  </>
)}

            <button type="submit" className="dp-auth-submit" disabled={busy}>
              {busy ? "Please wait..." : mode === "signup" ? "Create Account" : "Log In"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}