import { DELIVERABLES } from "../constants/deliverables";
import { Minus } from "lucide-react";
function DeliverablesSelector({ value = [], onChange }) {
  return (
    <div
      style={{
        display: "flex",
        gap: 10,
        flexWrap: "wrap",
      }}
    >
      {[...DELIVERABLES]
        .sort((a, b) => {
          const aSelected = value.some((d) => d.id === a.id);
          const bSelected = value.some((d) => d.id === b.id);

          if (aSelected === bSelected) return 0;
          return aSelected ? -1 : 1;
        })
        .map((item) => {
          const selected = value.find((d) => d.id === item.id);

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                const existing = value.find((d) => d.id === item.id);

                if (existing) {
                  onChange(
                    value.map((d) =>
                      d.id === item.id
                        ? { ...d, qty: d.qty + 1 }
                        : d
                    )
                  );
                } else {
                  onChange([
                    ...value,
                    {
                      id: item.id,
                      type: item.label,
                      qty: 1,
                    },
                  ]);
                }
              }}
              style={{
                padding: "9px 14px",
                borderRadius: 999,
                border: selected
                  ? "1px solid var(--signal)"
                  : "1px solid var(--line)",
                background: selected
                  ? "rgba(236,72,153,.12)"
                  : "#fff",
                color: selected
                  ? "var(--signal)"
                  : "var(--ink)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 13,
                fontWeight: 600,
                transition: "all .2s ease",
                userSelect: "none",
              }}
            >
              <item.icon
                size={16}
                color={selected ? "var(--signal)" : "currentColor"}
              />

              <span>{item.label}</span>

              {selected && (
                <>
                  <span
                    style={{
                      background: "var(--signal)",
                      color: "#fff",
                      minWidth: 22,
                      height: 22,
                      borderRadius: 999,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "0 7px",
                      fontSize: 11,
                      fontWeight: 700,
                    }}
                  >
                    {selected.qty}
                  </span>

                  <span
                  onClick={(e) => {
  e.stopPropagation();

  const existing = value.find((d) => d.id === item.id);

  if (existing.qty > 1) {
    onChange(
      value.map((d) =>
        d.id === item.id
          ? { ...d, qty: d.qty - 1 }
          : d
      )
    );
  } else {
    onChange(
      value.filter((d) => d.id !== item.id)
    );
  }
}}
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: "50%",
                      background: "rgba(236,72,153,.12)",
                      color: "var(--signal)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: "pointer",
                      transition: "all .15s ease",
                    }}
                  >
                    <Minus size={12} strokeWidth={3} />
                  </span>
                </>
              )}
            </button>
          );
        })}
    </div>
  );
}

export default DeliverablesSelector;