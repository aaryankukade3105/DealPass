export const DELIVERABLE_DETAIL_CONFIG = {
  reel: {
    title: "Instagram Reel",
    prompt: "What type of reel?",
    options: [
      { label: "Collab Reel", value: "Collab" },
      { label: "Non-Collab Reel", value: "Non-Collab" },
    ],
    formatDetail: (value) => value,
  },

  story: {
    title: "Instagram Story",
    prompt: "How many stories?",
    options: [
      { label: "1 Story", value: "1" },
      { label: "2 Stories", value: "2" },
      { label: "3 Stories", value: "3" },
      { label: "5 Stories", value: "5" },
      { label: "Others", value: "__other__" },
    ],
    formatDetail: (value) =>
      `${value} ${Number(value) === 1 ? "Story" : "Stories"}`,
    otherPlaceholder: "Enter number of stories",
    otherInputType: "number",
  },

  youtube_video: {
    title: "YouTube Video",
    prompt: "Video type?",
    options: [
      { label: "Dedicated", value: "Dedicated" },
      { label: "Integrated", value: "Integrated" },
      { label: "Mention", value: "Mention" },
      { label: "Others", value: "__other__" },
    ],
    formatDetail: (value) => value,
    otherPlaceholder: "Enter type",
  },

  youtube_short: {
    title: "YouTube Short",
    prompt: "Short type?",
    options: [
      { label: "Dedicated", value: "Dedicated" },
      { label: "Integrated", value: "Integrated" },
      { label: "Others", value: "__other__" },
    ],
    formatDetail: (value) => value,
    otherPlaceholder: "Enter type",
  },

  ugc_video: {
    title: "UGC Video",
    prompt: "Video duration?",
    options: [
      { label: "15 sec", value: "15" },
      { label: "30 sec", value: "30" },
      { label: "45 sec", value: "45" },
      { label: "60 sec", value: "60" },
      { label: "90 sec", value: "90" },
      { label: "Others", value: "__other__" },
    ],
    formatDetail: (value) => `${value} sec`,
    otherPlaceholder: "Enter duration",
    otherInputType: "number",
  },

  ugc_photos: {
    title: "UGC Photos",
    prompt: "How many photos?",
    options: [
      { label: "5 Photos", value: "5" },
      { label: "10 Photos", value: "10" },
      { label: "15 Photos", value: "15" },
      { label: "20 Photos", value: "20" },
      { label: "Others", value: "__other__" },
    ],
    formatDetail: (value) =>
      `${value} ${Number(value) === 1 ? "Photo" : "Photos"}`,
    otherPlaceholder: "Enter number of photos",
    otherInputType: "number",
  },

  raw_photos: {
    title: "Raw Photos",
    prompt: "How many photos?",
    options: [
      { label: "10", value: "10" },
      { label: "20", value: "20" },
      { label: "50", value: "50" },
      { label: "Others", value: "__other__" },
    ],
    formatDetail: (value) => `${value} Photos`,
    otherPlaceholder: "Enter quantity",
    otherInputType: "number",
  },

  raw_videos: {
    title: "Raw Videos",
    prompt: "Delivery type?",
    options: [
      { label: "Selected Clips", value: "Selected Clips" },
      { label: "All Footage", value: "All Footage" },
      { label: "Others", value: "__other__" },
    ],
    formatDetail: (value) => value,
    otherPlaceholder: "Enter delivery type",
  },

  ad_rights: {
    title: "Ad Usage Rights",
    prompt: "Usage duration?",
    options: [
      { label: "30 Days", value: "30" },
      { label: "90 Days", value: "90" },
      { label: "6 Months", value: "180" },
      { label: "1 Year", value: "365" },
      { label: "Perpetual", value: "Perpetual" },
      { label: "Others", value: "__other__" },
    ],
    formatDetail: (value) =>
      value === "Perpetual" ? value : `${value} Days`,
    otherPlaceholder: "Enter days",
    otherInputType: "number",
  },

  whitelisting: {
    title: "Whitelisting",
    prompt: "Whitelisting duration?",
    options: [
      { label: "30 Days", value: "30" },
      { label: "90 Days", value: "90" },
      { label: "6 Months", value: "180" },
      { label: "1 Year", value: "365" },
      { label: "Others", value: "__other__" },
    ],
    formatDetail: (value) => `${value} Days`,
    otherPlaceholder: "Enter days",
    otherInputType: "number",
  },

  exclusivity: {
    title: "Exclusivity",
    prompt: "Exclusivity duration?",
    options: [
      { label: "30 Days", value: "30" },
      { label: "60 Days", value: "60" },
      { label: "90 Days", value: "90" },
      { label: "6 Months", value: "180" },
      { label: "1 Year", value: "365" },
      { label: "Others", value: "__other__" },
    ],
    formatDetail: (value) => `${value} Days`,
    otherPlaceholder: "Enter days",
    otherInputType: "number",
  },

  appearance: {
    title: "Appearance",
    prompt: "Appearance duration?",
    options: [
      { label: "1 Hour", value: "1 Hour" },
      { label: "2 Hours", value: "2 Hours" },
      { label: "Half Day", value: "Half Day" },
      { label: "Full Day", value: "Full Day" },
      { label: "Others", value: "__other__" },
    ],
    formatDetail: (value) => value,
    otherPlaceholder: "e.g. 3 Hours",
  },

  hosting: {
    title: "Hosting",
    prompt: "Hosting duration?",
    options: [
      { label: "1 Hour", value: "1 Hour" },
      { label: "2 Hours", value: "2 Hours" },
      { label: "Half Day", value: "Half Day" },
      { label: "Full Day", value: "Full Day" },
      { label: "Others", value: "__other__" },
    ],
    formatDetail: (value) => value,
    otherPlaceholder: "e.g. 3 Hours",
  },
};

export function resolveDeliverableDetail(config, rawValue) {
  if (!config || rawValue == null || rawValue === "") {
    return "";
  }

  return config.formatDetail
    ? config.formatDetail(rawValue)
    : rawValue;
}