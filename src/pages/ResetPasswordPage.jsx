import { useState } from "react";

export default function ResetPasswordPage({
  onSave,
  busy,
}) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    onSave({
      password,
      confirm,
    });
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          width: "100%",
          maxWidth: 420,
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <h2>Create New Password</h2>

        <input
          className="dp-input"
          type="password"
          placeholder="New Password"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
        />

        <input
          className="dp-input"
          type="password"
          placeholder="Confirm Password"
          value={confirm}
          onChange={(e) =>
            setConfirm(e.target.value)
          }
        />

        <button
          className="dp-btn-signal"
          disabled={busy}
        >
          {busy
            ? "Updating..."
            : "Update Password"}
        </button>
      </form>
    </div>
  );
}