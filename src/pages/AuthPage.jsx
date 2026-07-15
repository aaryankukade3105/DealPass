import React, { useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function AuthPage({
  mode,
  setMode,
  onSignup,
  onLogin,
  error,
  busy,
  showAlert,
}) {
  const [name, setName] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
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
      return showAlert(
        "warning",
        "Full Name Required",
        "Please enter your full name."
      );
    }

    if (!identifier.trim()) {
      return showAlert(
        "warning",
        "Email Required",
        "Please enter your email address."
      );
    }

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(identifier.trim())) {
      return showAlert(
        "warning",
        "Invalid Email",
        "Please enter a valid email address."
      );
    }

    if (!password.trim()) {
      return showAlert(
        "warning",
        "Password Required",
        "Please enter your password."
      );
    }

    if (password.length < 8) {
      return showAlert(
        "warning",
        "Weak Password",
        "Password must be at least 8 characters."
      );
    }

    if (!confirm.trim()) {
      return showAlert(
        "warning",
        "Confirm Password",
        "Please confirm your password."
      );
    }

    if (password !== confirm) {
      return showAlert(
        "warning",
        "Passwords Don't Match",
        "Password and Confirm Password must match."
      );
    }

    return onSignup({
      name,
      identifier,
      password,
      confirm,
    });
  }

  // Login

  if (!identifier.trim()) {
    return showAlert(
      "warning",
      "Email Required",
      "Please enter your email address."
    );
  }

  const emailRegex =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(identifier.trim())) {
    return showAlert(
      "warning",
      "Invalid Email",
      "Please enter a valid email address."
    );
  }

  if (!password.trim()) {
    return showAlert(
      "warning",
      "Password Required",
      "Please enter your password."
    );
  }

  onLogin({
    identifier,
    password,
  });
};
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "40px 26px",
        overflowY: "auto",
      }}
    >
      <div style={{ marginBottom: 28 }}>
        <div
          className="dp-display"
          style={{
            fontSize: 30,
            fontWeight: 700,
            letterSpacing: "-0.02em",
          }}
        >
          DealPass
        </div>

        <div
          style={{
            color: "var(--slate)",
            fontSize: 14,
            marginTop: 6,
          }}
        >
          Every brand collaboration,
          <br />
          tracked like a boarding pass.
        </div>
      </div>

      <div
        style={{
          display: "flex",
          gap: 10,
          marginBottom: 24,
        }}
      >
        <button
          type="button"
          onClick={() => setMode("signup")}
          className={`dp-chip ${
            mode === "signup" ? "active" : ""
          }`}
        >
          Sign Up
        </button>

        <button
          type="button"
          onClick={() => setMode("login")}
          className={`dp-chip ${
            mode === "login" ? "active" : ""
          }`}
        >
          Log In
        </button>
      </div>

      <form
  noValidate
  onSubmit={handleSubmit}
  style={{
    display: "flex",
    flexDirection: "column",
    gap: 16,
  }}
>
        {mode === "signup" && (
          <div>
            <label className="dp-label">
              Full Name
            </label>

            <input
              className="dp-input"
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
              placeholder="John Doe"
            />
          </div>
        )}

        <div>
          <label className="dp-label">
            Email
          </label>

          <input
            className="dp-input"
            type="email"
            value={identifier}
            onChange={(e) =>
              setIdentifier(e.target.value)
            }
            placeholder="you@example.com"
            required
          />
        </div>

        <div>
          <label className="dp-label">
            Password
          </label>

          <div
            style={{
              position: "relative",
            }}
          >
            <input
              className="dp-input"
              type={showPw ? "text" : "password"}
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              placeholder="••••••••"
              style={{
                paddingRight: 45,
              }}
            />

            <button
              type="button"
              onClick={() =>
                setShowPw(!showPw)
              }
              style={{
                position: "absolute",
                right: 12,
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--slate)",
              }}
            >
              {showPw ? (
                <EyeOff size={18} />
              ) : (
                <Eye size={18} />
              )}
            </button>
          </div>
        </div>

        {mode === "signup" && (
          <div>
            <label className="dp-label">
              Confirm Password
            </label>

            <input
              className="dp-input"
              type={showPw ? "text" : "password"}
              value={confirm}
              onChange={(e) =>
                setConfirm(e.target.value)
              }
              placeholder="••••••••"
            />
          </div>
        )}


        <button
          type="submit"
          className="dp-btn-signal"
          disabled={busy}
        >
          {busy
            ? "Please wait..."
            : mode === "signup"
            ? "Create Account"
            : "Log In"}
        </button>
      </form>
    </div>
  );
}