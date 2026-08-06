export const COLLABORATION_TYPES = [
  "Paid",
  "Barter",
  "Affiliate",
  "PR",
  "Event",
  "Other",
];

export const CONFIRMATION_MODES = [
  "Email",
  "WhatsApp",
  "Instagram",
  "Call",
  "Other",
];

export const DELIVERABLE_OPTIONS = [
  "Reel",
  "Story",
  "Carousel",
  "Static Post",
  "Review",
  "UGC",
  "YouTube",
  "Other",
];

export const PAYMENT_MODES = [
  "UPI",
  "Bank Transfer",
  "Cash",
  "Cheque",
  "PayPal",
  "Other",
];

export const PAYMENT_STATUS = [
  "Pending",
  "Partially Paid",
  "Paid",
  "Overdue",
];

export const DEAL_STATUS = [
  "Negotiation",
  "Confirmed",
  "Content Shot",
  "Editing",
  "Submitted for Approval",
  "Approved",
  "Posted",
  "Completed",
  "Cancelled",
];

export const CURRENCIES = [
  "INR",
  "USD",
  "AED",
  "EUR",
  "GBP",
  "Other",
];
export const PAYMENT_STATUS_COLORS = {
  Pending: { bg: "#FEF3C7", text: "#92400E", border: "#F4D27A" },          // amber
  "Partially Paid": { bg: "#DBEAFE", text: "#1E40AF", border: "#93C5FD" }, // blue
  Paid: { bg: "#DCFCE7", text: "#166534", border: "#86EFAC" },             // green
  Overdue: { bg: "#FEE2E2", text: "#991B1B", border: "#FCA5A5" },          // red
};

export const DEAL_STATUS_COLORS = {
  Negotiation: { bg: "#F1F2F8", text: "#374151", border: "#D1D5DB" },
  Confirmed: { bg: "#DBEAFE", text: "#1E40AF", border: "#93C5FD" },
  "Content Shot": { bg: "#EDE9FE", text: "#5B21B6", border: "#C4B5FD" },
  Editing: { bg: "#FEF3C7", text: "#92400E", border: "#F4D27A" },
  "Submitted for Approval": { bg: "#FFEDD5", text: "#9A3412", border: "#FDBA74" },
  Approved: { bg: "#D1FAE5", text: "#065F46", border: "#6EE7B7" },
  Posted: { bg: "#E0E7FF", text: "#3730A3", border: "#A5B4FC" },
  Completed: { bg: "#DCFCE7", text: "#166534", border: "#86EFAC" },
  Cancelled: { bg: "#FEE2E2", text: "#991B1B", border: "#FCA5A5" },
};

export const COLLABORATION_TYPE_COLORS = {
  Paid: { bg: "#DCFCE7", text: "#166534", border: "#86EFAC" },
  Barter: { bg: "#FEF3C7", text: "#92400E", border: "#F4D27A" },
  Affiliate: { bg: "#DBEAFE", text: "#1E40AF", border: "#93C5FD" },
  PR: { bg: "#FCE7F3", text: "#9D174D", border: "#F9A8D4" },
  Event: { bg: "#EDE9FE", text: "#5B21B6", border: "#C4B5FD" },
  Other: { bg: "#F1F2F8", text: "#374151", border: "#D1D5DB" },
};