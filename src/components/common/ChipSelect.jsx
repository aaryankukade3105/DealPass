function ChipSelect({ options, value, onChange, multi, labels }) {
  return (
    <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
      {options.map((opt) => {
        const active = multi ? value.includes(opt) : value === opt;
        return (
          <button type="button" key={opt} className={`dp-chip ${active ? "active" : ""}`} onClick={() => onChange(opt)}>
            {(labels && labels[opt]) || opt}
          </button>
        );
      })}
    </div>
  );
}
export default ChipSelect;