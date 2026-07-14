import { useState } from "react";
import { X, LockKeyhole, Eye, EyeOff } from "lucide-react";

export default function ChangePasswordSheet({
  onClose,
  onSave,
}) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <>
      <div
        className="dp-sheet-backdrop"
        onClick={onClose}
      />

      <div className="dp-sheet">

        {/* Header */}

        <div
          style={{
            padding: "22px 22px 18px",
            borderBottom: "1px solid var(--line)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>

            <div
              className="dp-display"
              style={{
                fontSize: 24,
                fontWeight: 700,
              }}
            >
              Change Password
            </div>

            <div
              style={{
                color: "var(--slate)",
                fontSize: 13,
                marginTop: 4,
              }}
            >
              Update your password to keep your
              account secure.
            </div>

          </div>

          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
            }}
          >
            <X />
          </button>
        </div>

        {/* Body */}

        <div
          style={{
            padding: 22,
            overflowY: "auto",
            flex: 1,
          }}
        >

          {/* Current Password */}

          <div style={{ marginBottom: 18 }}>

            <label className="dp-label">
              Current Password
            </label>

            <div style={{ position: "relative" }}>

              <input
                className="dp-input"
                type={showCurrent ? "text" : "password"}
                value={currentPassword}
                onChange={(e) =>
                  setCurrentPassword(e.target.value)
                }
                placeholder="••••••••"
                style={{ paddingRight: 44 }}
              />

              <button
                type="button"
                onClick={() =>
                  setShowCurrent(!showCurrent)
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
                {showCurrent ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>

            </div>

          </div>

          {/* New Password */}

          <div style={{ marginBottom: 18 }}>

            <label className="dp-label">
              New Password
            </label>

            <div style={{ position: "relative" }}>

              <input
                className="dp-input"
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={(e) =>
                  setNewPassword(e.target.value)
                }
                placeholder="••••••••"
                style={{ paddingRight: 44 }}
              />

              <button
                type="button"
                onClick={() =>
                  setShowNew(!showNew)
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
                {showNew ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>

            </div>

          </div>

          {/* Confirm */}

          <div>

            <label className="dp-label">
              Confirm Password
            </label>

            <div style={{ position: "relative" }}>

              <input
                className="dp-input"
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(e.target.value)
                }
                placeholder="••••••••"
                style={{ paddingRight: 44 }}
              />

              <button
                type="button"
                onClick={() =>
                  setShowConfirm(!showConfirm)
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
                {showConfirm ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>

            </div>

          </div>

          {/* Requirements */}

          <div
            className="dp-card"
            style={{
              marginTop: 24,
              padding: 16,
              background: "#fafafa",
            }}
          >
            <div
              style={{
                display: "flex",
                gap: 10,
                alignItems: "center",
                marginBottom: 8,
                fontWeight: 600,
              }}
            >
              <LockKeyhole size={18} />
              Password Requirements
            </div>

            <div
              style={{
                fontSize: 13,
                color: "var(--slate)",
                lineHeight: 1.8,
              }}
            >
              • Minimum 8 characters
              <br />
              • At least one uppercase letter
              <br />
              • At least one number
              <br />
              • At least one special character
            </div>

          </div>

        </div>

        {/* Footer */}

        <div
          style={{
            padding: 22,
            borderTop: "1px solid var(--line)",
          }}
        >
          <button
            className="dp-btn-signal"
            onClick={() =>
              onSave({
                currentPassword,
                newPassword,
                confirmPassword,
              })
            }
          >
            Update Password
          </button>
        </div>

      </div>
    </>
  );
}