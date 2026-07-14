import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function AuthPage({
  mode,
  setMode,
  onSignup,
  onLogin,
  error,
  busy,
}) {
  const [name, setName] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (mode === "signup") {
      onSignup({
        name,
        identifier,
        password,
        confirm,
      });
    } else {
      onLogin({
        identifier,
        password,
      });
    }
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
              required
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
              required
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
              required
            />
          </div>
        )}

        {error && (
          <div
            style={{
              color: "#D62828",
              fontWeight: 600,
              fontSize: 13,
            }}
          >
            {error}
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