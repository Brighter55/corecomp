// Shared constants and pure helpers for the Dip Finder page.
// Kept free of React so they can be unit-tested directly.

export const SMA_WINDOWS = [
  { key: "50", label: "50 DAY SMA" },
  { key: "200", label: "200 DAY SMA" },
];

export const DEFAULT_SMA_WINDOW = "200";

// The design's value axis is fixed, not derived from the data: +15% at the top
// down to -30% at the bottom, in 5% steps. Keeping it fixed means the gridlines
// still read 15% … -30% when the 50-day view is selected.
export const VARIANCE_DOMAIN = [-30, 15];
export const VARIANCE_TICKS = [15, 10, 5, 0, -5, -10, -15, -20, -25, -30];

// The design colours columns in three bands rather than the app's usual
// positive/negative pair: the deepest dips shout in red, moderate dips sit in a
// muted sage, and anything at or above the average reads as light cream.
export const DEEP_DIP_THRESHOLD = -20;

export const BAR_COLORS = {
  deepDip: "#9E2F31",
  dip: "#8A9489",
  neutral: "#E4E9E0",
};

export function barColorFor(variance) {
  if (variance <= DEEP_DIP_THRESHOLD) {
    return BAR_COLORS.deepDip;
  }

  if (variance < 0) {
    return BAR_COLORS.dip;
  }

  return BAR_COLORS.neutral;
}

// The design renders values bare -- "-27%", "0%", "12%" -- with no leading plus.
export function formatVariance(value) {
  if (!Number.isFinite(value)) {
    return "--";
  }

  return `${Math.round(value)}%`;
}

// Worst-to-best, so the deepest dip is the leftmost column. Array.prototype.sort
// is stable, so equal values keep the order they appear in the fixture.
export function buildDipRows(varianceBySymbol) {
  if (!varianceBySymbol) {
    return [];
  }

  return Object.entries(varianceBySymbol)
    .map(([symbol, variance]) => ({ symbol, variance }))
    .sort((left, right) => left.variance - right.variance);
}

export function findSymbolEntry(symbols, query) {
  const needle = String(query ?? "").trim().toUpperCase();

  if (!needle) {
    return null;
  }

  return symbols.find((entry) => entry.symbol === needle) ?? null;
}

export function filterSymbols(symbols, query, exclude = []) {
  const needle = String(query ?? "").trim().toLowerCase();

  if (!needle) {
    return [];
  }

  const excluded = new Set(exclude);

  return symbols.filter((entry) => {
    if (excluded.has(entry.symbol)) {
      return false;
    }

    return (
      entry.symbol.toLowerCase().includes(needle) ||
      entry.name.toLowerCase().includes(needle)
    );
  });
}
