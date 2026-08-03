import { useState } from "react";
import { X } from "lucide-react";

function DeliverableDetailPopup({ config, onConfirm, onCancel }) {
  const [value, setValue] = useState(null);
  const [customValue, setCustomValue] = useState("");

  const isOther = value === "__other__";
  const canConfirm = value && (!isOther || customValue.trim().length > 0);

const handleConfirm = () => {
  if (!canConfirm) return;

  const rawValue = isOther
    ? customValue.trim()
    : value;

  onConfirm(rawValue);
};
  return (
    <>
      <div className="dp-sheet-backdrop" onClick={onCancel} />

      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 1000,
          width: "min(340px, 90vw)",
          background: "#fff",
          borderRadius: 16,
          boxShadow: "0 20px 60px rgba(0,0,0,.25)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "16px 18px",
            borderBottom: "1px solid var(--line)",
          }}
        >
          <div className="dp-display" style={{ fontWeight: 700 }}>
            {config.title}
          </div>
          <button
            type="button"
            onClick={onCancel}
            style={{ background: "none", border: "none", cursor: "pointer" }}
          >
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: 18 }}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "var(--ink)",
              marginBottom: 10,
            }}
          >
            {config.prompt}
          </div>

          <div
            style={{
              display: "flex",
              gap: 8,
              flexWrap: "wrap",
              marginBottom: isOther ? 12 : 0,
            }}
          >
            
            {config.options.map((opt) => {
              const selected = value === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setValue(opt.value)}
                  style={{
                    padding: "8px 14px",
                    borderRadius: 999,
                    border: selected
                      ? "1px solid var(--signal)"
                      : "1px solid var(--line)",
                    background: selected
                      ? "rgba(236,72,153,.12)"
                      : "#fff",
                    color: selected ? "var(--signal)" : "var(--ink)",
                    cursor: "pointer",
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>

          {isOther && (
            <input
              className="dp-input"
              type={config.otherInputType || "text"}
              autoFocus
              placeholder={config.otherPlaceholder || "Enter value"}
              value={customValue}
              onChange={(e) => setCustomValue(e.target.value)}
              style={{ marginTop: 4 }}
            />
          )}
        </div>

        <div style={{ display: "flex", gap: 10, padding: "0 18px 18px" }}>
          <button
            type="button"
            onClick={onCancel}
            style={{
              flex: 1,
              padding: "10px 0",
              borderRadius: 10,
              border: "1px solid var(--line)",
              background: "#fff",
              cursor: "pointer",
              fontWeight: 600,
              color: "var(--ink)",
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!canConfirm}
            className="dp-btn-signal"
            style={{ flex: 1, opacity: canConfirm ? 1 : 0.5 }}
          >
            Add
          </button>
        </div>
      </div>
    </>
  );
}

export default DeliverableDetailPopup;