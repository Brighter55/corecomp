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

// Columns are coloured on a diverging ramp: red below the moving average, green
// above it, deepening with distance from it. The scale is the fixed value axis
// above rather than the data on screen, so a -10% dip keeps the same colour no
// matter which tickers are on the watchlist.
//
// The anchors live here rather than as custom properties in index.css because
// the colour is interpolated per column, and a custom property cannot be read
// back out of CSS without getComputedStyle. Fixed steps -- five to an arm, or
// any number -- put neighbouring columns in the same band and hand them the same
// tone, which on a watchlist clustered near the top of the axis is most of them.
//
// Each arm holds one hue, borrowed from the app's own --main-brick (OKLCH H 22)
// and --main-fern (H 144). Anchor 1 sits next to the zero line, anchor 5 at the
// axis extreme. The dark set climbs in lightness towards the loud end, away from
// the card; the light set runs darker instead, because on a near-white surface
// contrast comes from depth rather than brightness. Every anchor clears 2:1 on
// its own card.
const RAMP_ANCHORS = {
  dark: {
    neg: ["#936461", "#ae6462", "#c86361", "#e36061", "#fe5b5f"],
    pos: ["#5f7b5c", "#588e54", "#4da148", "#3ab536", "#00c807"],
  },
  light: {
    neg: ["#ce9c9a", "#ca8481", "#c46c69", "#bd5252", "#b4343a"],
    pos: ["#95b594", "#7aa379", "#5f925e", "#438144", "#246f27"],
  },
};

const [DIP_FLOOR, DIP_CEILING] = VARIANCE_DOMAIN;

export const DEFAULT_THEME_MODE = "dark";

function hexToRgb(hex) {
  const value = parseInt(hex.slice(1), 16);

  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

function mix(from, to, ratio) {
  const channels = hexToRgb(from).map((channel, index) => {
    const target = hexToRgb(to)[index];

    return Math.round(channel + (target - channel) * ratio);
  });

  return `#${channels.map((c) => c.toString(16).padStart(2, "0")).join("")}`;
}

// Straight sRGB between neighbouring anchors. They sit ~0.04 apart in OKLCH
// lightness, close enough that interpolating in a perceptual space would not
// move any rendered channel by a visible amount.
function rampColor(arm, t, mode) {
  const anchors = (RAMP_ANCHORS[mode] ?? RAMP_ANCHORS[DEFAULT_THEME_MODE])[arm];
  const span = (anchors.length - 1) * Math.min(1, Math.max(0, t));
  const index = Math.min(anchors.length - 2, Math.floor(span));

  return mix(anchors[index], anchors[index + 1], span - index);
}

export function barColorFor(variance, mode = DEFAULT_THEME_MODE) {
  if (!Number.isFinite(variance)) {
    return rampColor("pos", 0, mode);
  }

  // DIP_FLOOR is negative, so the quotient is already positive below the average.
  // rampColor clamps it, which keeps a variance past the axis -- a -42% crash --
  // on the deepest step instead of running off the end of the anchors.
  if (variance < 0) {
    return rampColor("neg", variance / DIP_FLOOR, mode);
  }

  return rampColor("pos", variance / DIP_CEILING, mode);
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
