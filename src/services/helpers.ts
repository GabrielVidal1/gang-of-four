export const wait = async (seconds: number) =>
  new Promise((resolve) => setTimeout(resolve, seconds));

export const roundToNearest = (n: number, nearest: number) =>
  Math.round(n / nearest) * nearest;
