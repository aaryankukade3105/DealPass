import { CheckCircle2, Circle } from "lucide-react";

function RadioList({
  title,
  options,
  value,
  onChange,
}) {
  return (
    <div style={{ marginBottom: 28 }}>
      <div
        style={{
          fontWeight: 700,
          marginBottom: 14,
          fontSize: 14,
        }}
      >
        {title}
      </div>

      {options.map((option) => {
        const active = value === option;

        return (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "12px 0",
              border: "none",
              borderBottom: "1px solid var(--line)",
              background: "transparent",
              cursor: "pointer",
              fontSize: 14,
              color: "var(--ink)",
            }}
          >
            <span>{option}</span>

            {active ? (
              <CheckCircle2
                size={19}
                color="#6C5CE7"
              />
            ) : (
              <Circle
                size={18}
                color="#C5C7D0"
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

export default RadioList;