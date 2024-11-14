export const COLORS = [
  "red",
  // "blue",
  "green",
  "blue",
] as const;

export type Color = (typeof COLORS)[number];
