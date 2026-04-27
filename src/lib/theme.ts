// Matrix phosphor color palette — applied by index, overriding stored DB colors
export const MATRIX_PALETTE = [
  "#00ff41", // classic matrix green
  "#39ff14", // neon green
  "#00ffcc", // mint
  "#7fff00", // chartreuse
  "#ffffff", // white (for contrast in stack)
  "#ccff00", // yellow-green
  "#00ff80", // spring green
  "#adff2f", // green-yellow
];

export function matrixColor(index: number): string {
  return MATRIX_PALETTE[index % MATRIX_PALETTE.length];
}

// Inject matrix colors into a categories array (replaces stored colors)
export function applyMatrixColors<T extends { color: string }>(
  categories: T[]
): T[] {
  return categories.map((c, i) => ({ ...c, color: matrixColor(i) }));
}
