function ChipSelect({
  options,
  value,
  onChange,
  multi,
  labels,
  disabled = false,
}) {
  return (
    <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
      {options.map((opt) => {
        const active = multi ? value.includes(opt) : value === opt;

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