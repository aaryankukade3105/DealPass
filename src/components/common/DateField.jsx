import { MobileDatePicker } from "@mui/x-date-pickers/MobileDatePicker";
import { CalendarDays } from "lucide-react";
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
      slots={{
        openPickerIcon: () => (
          <CalendarDays size={17} color="var(--signal, #FF3B5C)" strokeWidth={2.2} />
        ),
      }}
      slotProps={{
        textField: {
          placeholder,
          fullWidth: true,
          variant: "outlined",
          size: "small",
          InputProps: {
            sx: {
              borderRadius: "12px",
              fontFamily: "inherit",
              fontSize: "14.5px",
              fontWeight: 600,
              color: "var(--ink, #14151A)",
              background: disabled
                ? "var(--surface-muted, #F7F8FC)"
                : "var(--surface, #fff)",
              transition: "border-color 120ms ease, box-shadow 120ms ease",

              "& fieldset": {
                borderColor: "var(--line, #E6E7EF)",
                borderWidth: "1px",
              },
              "&:hover fieldset": {
                borderColor: disabled
                  ? "var(--line, #E6E7EF)"
                  : "var(--signal, #FF3B5C)",
              },
              "&.Mui-focused fieldset": {
                borderColor: "var(--signal, #FF3B5C)",
                borderWidth: "1.5px",
              },
              "&.Mui-focused": {
                boxShadow: "0 0 0 4px rgba(255,59,92,.10)",
              },
            },
          },
          sx: {
            "& .MuiInputBase-input": {
              padding: "10.5px 12px",
              "&::placeholder": {
                color: "var(--slate, #8A8D98)",
                opacity: 1,
                fontWeight: 500,
              },
            },
            "& .MuiInputBase-input.Mui-disabled": {
              WebkitTextFillColor: "var(--slate, #8A8D98)",
            },
          },
        },
        // Bottom-sheet styling on mobile
        mobilePaper: {
          sx: {
            borderRadius: "20px 20px 0 0",
          },
        },
        // Calendar body styling
        layout: {
          sx: {
            "& .MuiPickersDay-root": {
              fontWeight: 600,
              borderRadius: "10px",
            },
            "& .MuiPickersDay-root.Mui-selected": {
              background: "var(--signal, #FF3B5C)",
              "&:hover, &:focus": {
                background: "var(--signal, #FF3B5C)",
              },
            },
            "& .MuiPickersDay-today": {
              borderColor: "var(--signal, #FF3B5C)",
            },
            "& .MuiDialogActions-root .MuiButton-root": {
              fontWeight: 700,
              color: "var(--signal, #FF3B5C)",
              textTransform: "none",
              borderRadius: "10px",
            },
            "& .MuiPickersToolbar-root": {
              background: "linear-gradient(135deg, #7C3AED 0%, #DB2777 100%)",
              color: "#fff",
            },
            "& .MuiPickersToolbar-root .MuiTypography-root": {
              color: "#fff",
            },
          },
        },
      }}
    />
  );
}