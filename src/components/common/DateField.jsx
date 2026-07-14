import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const quickOptions = [
  { label: "Today", days: 0 },
  { label: "Tomorrow", days: 1 },
  { label: "+3 Days", days: 3 },
  { label: "+1 Week", days: 7 },
];

export default function DateField({
  value,
  onChange,
  placeholder = "Select date",
  showQuickButtons = true,
}) {
  const selected = value ? new Date(value) : null;

  const setOffset = (days) => {
    const d = new Date();
    d.setHours(12, 0, 0, 0);
    d.setDate(d.getDate() + days);

    onChange(d.toISOString().slice(0, 10));
  };

  return (
    <>
      <DatePicker
        selected={selected}
        onChange={(date) =>
          onChange(date ? date.toISOString().slice(0, 10) : "")
        }
        dateFormat="dd MMM yyyy"
        placeholderText={placeholder}
        className="dp-input"
        showPopperArrow={false}
        calendarStartDay={1}
      />

      {showQuickButtons && (
        <div
          style={{
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
            marginTop: 10,
          }}
        >
          {quickOptions.map((item) => (
            <button
              key={item.label}
              type="button"
              className="dp-chip"
              onClick={() => setOffset(item.days)}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </>
  );
}
