function ChipSelect({
  options,
  value,
  onChange,
  multi,
  labels,
  colors,
  disabled = false,
}) {
  return (
    <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
      {options.map((opt) => {
        const active = multi ? value.includes(opt) : value === opt;
        const c = colors?.[opt]; // { bg, text, border } or undefined

        return (
          <button
            type="button"
            key={opt}
            className={`dp-chip ${active ? "active" : ""}`}
            disabled={disabled}
            onClick={() => {
              if (!disabled) onChange(opt);
            }}
            style={{
              opacity: disabled ? 0.5 : 1,
              cursor: disabled ? "not-allowed" : "pointer",
              ...(active && c
                ? {
                    background: c.bg,
                    color: c.text,
                    borderColor: c.border || c.bg,
                  }
                : {}),
            }}
          >
            {(labels && labels[opt]) || opt}
          </button>
        );
      })}
    </div>
  );
}

export default ChipSelect;