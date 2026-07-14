import { Sparkles } from "lucide-react";

function EmptyState({ text, actionLabel, onAction }) {
  return (
    <div className="dp-card" style={{ padding: 26, textAlign: "center" }}>
      <Sparkles size={22} color="var(--signal)" style={{ marginBottom: 10 }} />
      <div style={{ fontSize: 13.5, color: "var(--slate)", marginBottom: onAction ? 14 : 0, lineHeight: 1.5 }}>
        {text}
      </div>
      {onAction && (
        <button className="dp-btn-signal" onClick={onAction} style={{ width: "auto", padding: "10px 18px" }}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}
export default EmptyState;