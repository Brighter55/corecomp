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

// The design renders values bare -- "-27.40%", "0.00%", "12.71%" -- with no leading
// plus. Hundredths, because whole percents hide the separation this page exists to show.
export function formatVariance(value) {
  if (!Number.isFinite(value)) {
    return "--";
  }

  const rounded = value.toFixed(2);

  // A value that rounds to zero must not keep the sign: -0.004 would read "-0.00%".
  return `${rounded === "-0.00" ? "0.00" : rounded}%`;
}

// The value axis keeps whole percentages: its ticks are fixed at 5% steps, so
// hundredths on the gridlines would be noise rather than information.
export function formatVarianceTick(value) {
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

// Guests start with nothing. The old fixture shipped 6 symbols against a
// 5-symbol anonymous quota, so a seeded default would 403 a first-time visitor
// on their very first page load -- and would spend those units before they ever
// opened /overview. An empty list teaches the free-tier mechanic instead.
export const DEFAULT_WATCHLIST = [];

// Reshape the /pages/dip response back into the fixture's shapes, so that
// buildDipRows, DipColumnChart and the whole render path stay untouched.
export function buildVarianceByWindow(results, window) {
  const varianceBySymbol = {};

  for (const result of results ?? []) {
    const variance = result?.variance?.[window];

    // A symbol whose moving average is missing is dropped rather than plotted
    // as a zero: buildDipRows sorts numerically, and null would coerce to 0 and
    // drop the row into the middle of the chart.
    if (!Number.isFinite(variance)) {
      continue;
    }

    varianceBySymbol[result.symbol] = variance;
  }

  return varianceBySymbol;
}

export function buildSymbolEntries(results) {
  return (results ?? []).map((result) => ({
    symbol: result.symbol,
    // Always a string: filterSymbols and WatchlistSidebar both dereference
    // .name, and "unknown" rows carry a null one.
    name: String(result.name ?? result.symbol),
  }));
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
      String(entry.symbol ?? "").toLowerCase().includes(needle) ||
      String(entry.name ?? "").toLowerCase().includes(needle)
    );
  });
}
