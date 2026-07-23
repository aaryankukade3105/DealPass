import { MobileDatePicker } from "@mui/x-date-pickers/MobileDatePicker";
import dayjs from "dayjs";

export default function DateField({
  value,
  onChange,
  placeholder = "Select date",
  minDate,
  maxDate,
  disabled = false,
}) {
  return (
    <MobileDatePicker
      value={value ? dayjs(value) : null}
      onChange={(newValue) => {
        onChange(newValue ? newValue.format("YYYY-MM-DD") : "");
      }}
      minDate={minDate ? dayjs(minDate) : undefined}
      maxDate={maxDate ? dayjs(maxDate) : undefined}
      disabled={disabled}
      format="DD MMM YYYY"
   slotProps={{
  textField: {
    placeholder,
    fullWidth: true,
    variant: "outlined",
    size: "small",
  },
}}
    />
  );
}