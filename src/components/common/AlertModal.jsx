import { AlertTriangle, CheckCircle2, Info, XCircle, HelpCircle } from "lucide-react";

export default function AlertModal({
  open,
  type = "warning",
  title,
  message,
  onClose,
  onConfirm,
  onCancel,
  confirmLabel = "Yes",
  cancelLabel = "No",
}) {
  if (!open) return null;

  const config = {
    success: {
      icon: <CheckCircle2 size={44} />,
      color: "#16A34A",
      bg: "#ECFDF3",
    },
    warning: {
      icon: <AlertTriangle size={44} />,
      color: "#D97706",
      bg: "#FFF7ED",
    },
    error: {
      icon: <XCircle size={44} />,
      color: "#DC2626",
      bg: "#FEF2F2",
    },
    info: {
      icon: <Info size={44} />,
      color: "#2563EB",
      bg: "#EFF6FF",
    },
    confirm: {
      icon: <HelpCircle size={44} />,
      color: "#2563EB",
      bg: "#EFF6FF",
    },
  };

  const current = config[type] || config.warning;
  const isConfirm = type === "confirm";

  // For a confirm dialog, clicking outside (backdrop) is treated as "No" /
  // dismiss rather than "OK", since there's no neutral close action here —
  // the user needs to make an explicit choice.
  const handleBackdropClick = () => {
    if (isConfirm) {
      onCancel ? onCancel() : onClose?.();
    } else {
      onClose?.();
    }
  };

  return (
    <>
      <div
        onClick={handleBackdropClick}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,.35)",
          backdropFilter: "blur(8px)",
          zIndex: 9998,
          animation: "fadeBackdrop .2s ease",
        }}
      />

      <div
        style={{
          position: "fixed",
          left: "50%",
          top: "50%",
          transform: "translate(-50%,-50%)",
          width: 340,
          maxWidth: "90%",
          background: "#fff",
          borderRadius: 24,
          padding: "28px 24px",
          zIndex: 9999,
          textAlign: "center",
          boxShadow: "0 30px 70px rgba(0,0,0,.22)",
          animation: "dealZoom .22s ease",
        }}
      >
        <div
          style={{
            width: 72,
            height: 72,
            margin: "0 auto 18px",
            borderRadius: "50%",
            background: current.bg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: current.color,
          }}
        >
          {current.icon}
        </div>

        <div
          className="dp-display"
          style={{
            fontSize: 22,
            fontWeight: 700,
            marginBottom: 10,
          }}
        >
          {title}
        </div>

        <div
          style={{
            color: "var(--slate)",
            lineHeight: 1.55,
            fontSize: 14,
            marginBottom: 24,
          }}
        >
          {message}
        </div>

        {isConfirm ? (
          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={onCancel}
              style={{
                flex: 1,
                padding: "12px 16px",
                borderRadius: 12,
                border: "1px solid var(--line)",
                background: "#fff",
                color: "var(--slate)",
                fontWeight: 700,
                fontSize: 14,
                cursor: "pointer",
              }}
            >
              {cancelLabel}
            </button>
            <button
              onClick={onConfirm}
              className="dp-btn-signal"
              style={{
                flex: 1,
              }}
            >
              {confirmLabel}
            </button>
          </div>
        ) : (
          <button
            onClick={onClose}
            className="dp-btn-signal"
            style={{
              width: "100%",
            }}
          >
            OK
          </button>
        )}
      </div>
    </>
  );
}