import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function DateField({
  value,
  onChange,
  placeholder = "Select date",
  minDate,
  maxDate,
  disabled = false,
}) {
  const selected = value ? new Date(value) : null;


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
  minDate={minDate ? new Date(minDate) : undefined}
  maxDate={maxDate ? new Date(maxDate) : undefined}
  disabled={disabled}
/>
    </>
  );
}
