import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react";

export default function AlertModal({
  open,
  type = "warning",
  title,
  message,
  onClose,
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
  };

  const current = config[type] || config.warning;

  return (
    <>
      <div
        onClick={onClose}
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

        <button
          onClick={onClose}
          className="dp-btn-signal"
          style={{
            width: "100%",
          }}
        >
          OK
        </button>
      </div>
    </>
  );
}