// Config for deliverables that need an extra detail captured before being added.
// Keyed by the deliverable's `id` from constants/deliverables.js
export const DELIVERABLE_DETAIL_CONFIG = {
  ad_rights: {
    title: "Ad Usage Rights",
    prompt: "How many days?",
    options: [
      { label: "15 days", value: "15" },
      { label: "30 days", value: "30" },
      { label: "60 days", value: "60" },
      { label: "90 days", value: "90" },
      { label: "Others", value: "__other__" },
    ],
    // Turns the chosen/custom value into the string saved on the deliverable
    formatDetail: (value) => `${value} days`,
    otherPlaceholder: "Enter number of days",
    otherInputType: "number",
  },
  reel: {
    title: "Instagram Reel",
    prompt: "What type of reel?",
    options: [
      { label: "Collab Reel", value: "Collab" },
      { label: "Non-Collab Reel", value: "Non-Collab" },
    ],
    formatDetail: (value) => value,
  },
};