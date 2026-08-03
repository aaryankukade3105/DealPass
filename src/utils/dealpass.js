// src/utils/dealpass.js

export function getDealPassId(userId) {
  return `DP-${userId.replace(/-/g, "").slice(0, 6).toUpperCase()}`;
}