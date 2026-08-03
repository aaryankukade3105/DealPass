import { useState } from "react";
import { X } from "lucide-react";

const INK = "#12172B";
const VIOLET = "#6C5CE7";
const SLATE = "#5B6472";

/**
 * Generic popup for capturing a deliverable's extra detail (e.g. reel
 * type, story count, usage-rights duration). Driven entirely by a
 * DELIVERABLE_DETAIL_CONFIG entry — no per-deliverable branching here.
 *
 * Props:
 *   config     — the DELIVERABLE_DETAIL_CONFIG entry for this deliverable
 *   onConfirm  — (rawValue: string) => void, called with the raw selected
 *                or typed value; caller applies resolveDeliverableDetail()
 *   onCancel   — () => void
 */
export default function DeliverableDetailModal({ config, onConfirm, onCancel }) {
  const [selected, setSelected] = useState("");
  const [customValue, setCustomValue] = useState("");

  if (!config) return null;

  const isOther = selected === "__other__";
  const canConfirm = isOther ? customValue.trim().length > 0 : Boolean(selected);

  const handleConfirm = () => {
    if (!canConfirm) return;
    const rawValue = isOther ? customValue.trim() : selected;
    onConfirm(rawValue);
  };

  return (
    <>
      <div
        onClick={onCancel}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(18,23,43,.55)",
          zIndex: 60,
          backdropFilter: "blur(2px)",
        }}
      />
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 61,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 20,
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 380,
            background: "#fff",
            borderRadius: 18,
            boxShadow: "0 30px 80px rgba(0,0,0,.35)",
            overflow: "hidden",
            fontFamily: "'Manrope', -apple-system, sans-serif",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "16px 20px",
              borderBottom: "1px solid #EEF0F8",
            }}
          >
            <div style={{ fontWeight: 700, fontSize: 16, color: INK }}>
              {config.title}
            </div>
            <button
              onClick={onCancel}
              style={{
                background: "#F1F2F8",
                border: "none",
                cursor: "pointer",
                padding: 6,
                borderRadius: 8,
                display: "flex",
              }}
            >
              <X size={16} color={SLATE} />
            </button>
          </div>

          <div style={{ padding: 20 }}>
            <div style={{ fontSize: 13.5, color: SLATE, marginBottom: 14, fontWeight: 600 }}>
              {config.prompt}
            </div>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 8,
                marginBottom: 16,
              }}
            >
              {config.options.map((opt) => {
                const isSelected = selected === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => setSelected(opt.value)}
                    style={{
                      padding: "9px 14px",
                      borderRadius: 10,
                      border: `1.5px solid ${isSelected ? VIOLET : "#E2E5EE"}`,
                      background: isSelected ? `${VIOLET}14` : "#fff",
                      color: isSelected ? VIOLET : INK,
                      fontWeight: 600,
                      fontSize: 13,
                      cursor: "pointer",
                      transition: "all .15s ease",
                    }}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>

            {isOther && (
              <input
                type={config.otherInputType || "text"}
                placeholder={config.otherPlaceholder || "Enter value"}
                value={customValue}
                onChange={(e) => setCustomValue(e.target.value)}
                autoFocus
                style={{
                  width: "100%",
                  padding: "11px 14px",
                  borderRadius: 10,
                  border: "1.5px solid #E2E5EE",
                  fontSize: 14,
                  marginBottom: 4,
                  fontFamily: "inherit",
                }}
              />
            )}
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 10,
              padding: "14px 20px",
              borderTop: "1px solid #EEF0F8",
            }}
          >
            <button
              onClick={onCancel}
              style={{
                padding: "10px 18px",
                borderRadius: 10,
                border: "1.5px solid #E2E5EE",
                background: "#fff",
                color: INK,
                fontWeight: 700,
                fontSize: 13.5,
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={!canConfirm}
              style={{
                padding: "10px 18px",
                borderRadius: 10,
                border: "none",
                background: canConfirm ? VIOLET : "#D9DCE8",
                color: "#fff",
                fontWeight: 700,
                fontSize: 13.5,
                cursor: canConfirm ? "pointer" : "not-allowed",
              }}
            >
              Add
            </button>
          </div>
        </div>
      </div>
    </>
  );
}