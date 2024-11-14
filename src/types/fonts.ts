export const FONTS = ["Slideyouran", "arial", "Times"] as const;

export type Font = (typeof FONTS)[number];
