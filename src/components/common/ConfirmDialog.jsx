function ConfirmDialog({
  title = "Confirm",
  message = "Are you sure?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  danger = false,
  onConfirm,
  onCancel,
}) {
  return (
    <>
      <div
        className="dp-sheet-backdrop"
        onClick={onCancel}
      />

      <div
        className="dp-card"
        style={{
          position: "fixed",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          width: "90%",
          maxWidth: 360,
          padding: 24,
          zIndex: 100,
          animation: "dealZoom .25s ease",
          boxShadow: "0 25px 60px rgba(0,0,0,.25)",
        }}
      >
        <div
          className="dp-display"
          style={{
            fontSize: 22,
            fontWeight: 700,
            marginBottom: 10,
            textAlign: "center",
          }}
        >
          {title}
        </div>

        <div
          style={{
            textAlign: "center",
            color: "var(--slate)",
            lineHeight: 1.6,
            marginBottom: 24,
            whiteSpace: "pre-line",
          }}
        >
          {message}
        </div>

        <div
          style={{
            display: "flex",
            gap: 12,
          }}
        >
          <button
            type="button"
            className="dp-btn-outline"
            onClick={onCancel}
          >
            {cancelText}
          </button>

          <button
            type="button"
            className="dp-btn-signal"
            style={{
              background: danger ? "#d62828" : "var(--signal)",
            }}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </>
  );
}

export default ConfirmDialog;