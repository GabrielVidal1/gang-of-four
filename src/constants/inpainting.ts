export const MODELS = [
  "flux-dev-inpainting",
  "stable-diffusion-inpainting",
] as const;

export type Model = (typeof MODELS)[number];
