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