import {
  Clapperboard,
  Image,
  Camera,
  Play,
  Mic,
  FileText,
  Megaphone,
  ShieldCheck,
  Calendar,
  Gift,
  Star,
  Plus,
} from "lucide-react";

export const DELIVERABLES = [
  // Instagram
  { id: "reel", label: "Instagram Reel", icon: Clapperboard },
  { id: "story", label: "Instagram Story", icon: Image },
  { id: "carousel", label: "Instagram Carousel", icon: Image },
  { id: "post", label: "Instagram Post", icon: Image },
  { id: "collab_post", label: "Collab Post", icon: Image },
  { id: "instagram_live", label: "Instagram Live", icon: Camera },

  // YouTube
  { id: "youtube_video", label: "YouTube Video", icon: Play },
  { id: "youtube_short", label: "YouTube Short", icon: Play },

  // UGC
  { id: "ugc_video", label: "UGC Video", icon: Camera },
  { id: "ugc_photos", label: "UGC Photos", icon: Camera },
  { id: "product_demo", label: "Product Demo", icon: Camera },
  { id: "testimonial", label: "Testimonial Video", icon: Camera },
  { id: "unboxing", label: "Unboxing Video", icon: Camera },
  { id: "lifestyle_shoot", label: "Lifestyle Shoot", icon: Camera },

  // Reviews
  { id: "google_review", label: "Google Review", icon: Star },
  { id: "zomato_review", label: "Zomato Review", icon: Star },
  { id: "swiggy_review", label: "Swiggy Review", icon: Star },
  { id: "tripadvisor_review", label: "Tripadvisor Review", icon: Star },
  { id: "website_review", label: "Website Review", icon: Star },

  // Assets
  { id: "raw_photos", label: "Raw Photos", icon: Camera },
  { id: "raw_videos", label: "Raw Videos", icon: Camera },
  { id: "edited_video", label: "Edited Video", icon: Camera },

  // Creative
  { id: "script", label: "Script Writing", icon: FileText },
  { id: "voice_over", label: "Voice Over", icon: Mic },
  { id: "revision", label: "Revision", icon: FileText },

  // Rights
  { id: "ad_rights", label: "Ad Usage Rights", icon: Megaphone },
  { id: "whitelisting", label: "Whitelisting", icon: ShieldCheck },
  { id: "exclusivity", label: "Exclusivity", icon: ShieldCheck },

  // Offline
  { id: "event_visit", label: "Event Visit", icon: Calendar },
  { id: "appearance", label: "Appearance", icon: Calendar },
  { id: "hosting", label: "Hosting", icon: Calendar },

  // Campaign
  { id: "giveaway", label: "Giveaway", icon: Gift },

  // Other
  { id: "other", label: "Other", icon: Plus },
];

/* =====================================================================
   DELIVERABLE_DETAIL_CONFIG
   -----------------------------------------------------------------------
   Single source of truth for which deliverables prompt for an extra detail
   before being added, and what that prompt looks like.

   Shape of each entry:
   {
     title:            string                     — modal header
     prompt:           string                     — question shown to user
     options: [{ label: string, value: string }]  — predefined choices.
       A value of "__other__" is reserved and always renders a free-text
       input (using otherInputType/otherPlaceholder) instead of being
       used directly as the stored detail.
     formatDetail?:    (rawValue: string) => string
       Transforms the selected/typed value into the string that gets
       stored on the deliverable (`deliverable.detail`) and therefore
       shown in parentheses. Defaults to the identity function.
     otherPlaceholder?: string   — placeholder for the "Others" input
     otherInputType?:   "text" | "number"  (default "text")
   }

   To add a new configurable deliverable in the future: add an entry here
   keyed by the deliverable's `id`. No other file needs to change — the
   popup, storage, and every label renderer all read from this config.
   ===================================================================== */
export const DELIVERABLE_DETAIL_CONFIG = {
  reel: {
    title: "Instagram Reel",
    prompt: "What type of reel?",
    options: [
      { label: "Collab Reel", value: "Collab" },
      { label: "Non-Collab Reel", value: "Non-Collab" },
    ],
  },

  story: {
    title: "Instagram Story",
    prompt: "How many stories?",
    options: [
      { label: "1 Story", value: "1 Story" },
      { label: "2 Stories", value: "2 Stories" },
      { label: "3 Stories", value: "3 Stories" },
      { label: "Others", value: "__other__" },
    ],
    otherPlaceholder: "e.g. 5 Stories",
    otherInputType: "text",
  },

  ugc_video: {
    title: "UGC Video",
    prompt: "Video duration?",
    options: [
      { label: "15 sec", value: "15 sec" },
      { label: "30 sec", value: "30 sec" },
      { label: "60 sec", value: "60 sec" },
      { label: "Others", value: "__other__" },
    ],
    formatDetail: (value) => (/^\d+$/.test(value) ? `${value} sec` : value),
    otherPlaceholder: "Enter duration (sec)",
    otherInputType: "number",
  },

  ad_rights: {
    title: "Ad Usage Rights",
    prompt: "How long are the usage rights?",
    options: [
      { label: "15 Days", value: "15 Days" },
      { label: "30 Days", value: "30 Days" },
      { label: "60 Days", value: "60 Days" },
      { label: "90 Days", value: "90 Days" },
      { label: "180 Days", value: "180 Days" },
      { label: "1 Year", value: "1 Year" },
      { label: "Perpetual", value: "Perpetual" },
      { label: "Others", value: "__other__" },
    ],
    formatDetail: (value) => (/^\d+$/.test(value) ? `${value} Days` : value),
    otherPlaceholder: "Enter number of days",
    otherInputType: "number",
  },

  whitelisting: {
    title: "Whitelisting",
    prompt: "How long is whitelisting?",
    options: [
      { label: "15 Days", value: "15 Days" },
      { label: "30 Days", value: "30 Days" },
      { label: "60 Days", value: "60 Days" },
      { label: "90 Days", value: "90 Days" },
      { label: "180 Days", value: "180 Days" },
      { label: "1 Year", value: "1 Year" },
      { label: "Perpetual", value: "Perpetual" },
      { label: "Others", value: "__other__" },
    ],
    formatDetail: (value) => (/^\d+$/.test(value) ? `${value} Days` : value),
    otherPlaceholder: "Enter number of days",
    otherInputType: "number",
  },

  exclusivity: {
    title: "Exclusivity",
    prompt: "How long is the exclusivity period?",
    options: [
      { label: "15 Days", value: "15 Days" },
      { label: "30 Days", value: "30 Days" },
      { label: "60 Days", value: "60 Days" },
      { label: "90 Days", value: "90 Days" },
      { label: "180 Days", value: "180 Days" },
      { label: "1 Year", value: "1 Year" },
      { label: "Others", value: "__other__" },
    ],
    formatDetail: (value) => (/^\d+$/.test(value) ? `${value} Days` : value),
    otherPlaceholder: "Enter number of days",
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
    otherPlaceholder: "e.g. 3 Hours",
    otherInputType: "text",
  },
};

/* =====================================================================
   formatDeliverableLabel
   -----------------------------------------------------------------------
   The single place that turns a deliverable object into its display
   string. Every component (selector, deal card, deal details sheet,
   invoice preview, invoice PDF, future exports) must call this instead
   of manually concatenating label/detail/qty.

   Accepted deliverable shapes:
     { label, type, detail, qty }
   `label` is preferred; falls back to `type` (line items sourced from a
   deal store the deliverable name under `type`).

   Output examples:
     { label: "Instagram Reel", detail: "Collab", qty: 1 }
       -> "Instagram Reel (Collab) ×1"
     { label: "Ad Usage Rights", detail: "90 Days" }         (no qty)
       -> "Ad Usage Rights (90 Days)"
     { label: "Instagram Carousel", qty: 1 }                 (no detail)
       -> "Instagram Carousel ×1"

   `includeQty` defaults to true; pass false for contexts (e.g. a table
   that already has its own Qty column) that never want the "×N" suffix.
   ===================================================================== */
export function formatDeliverableLabel(deliverable, { includeQty = true } = {}) {
  if (!deliverable) return "";

  const label = deliverable.label || deliverable.type || "";
  const detail = deliverable.detail;
  const qty = deliverable.qty;

  let result = label;
  if (detail) {
    result += ` (${detail})`;
  }
  if (includeQty && qty !== undefined && qty !== null && qty !== "") {
    result += ` ×${qty}`;
  }
  return result;
}