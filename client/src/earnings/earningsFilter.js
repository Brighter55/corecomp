// The five single-select filters, in one table. Each entry owns its label and
// its predicate, so the toolbar reads its options from here and the page reads
// the rule from here, with exactly one place deciding what a tile matches.
//
// `popular` is the server's call and is never recomputed: the definition lives
// in one place, that place is the backend, and a second copy here would let the
// two drift.

const CAP_100B = 100_000_000_000;
const CAP_10B = 10_000_000_000;
const CAP_1B = 1_000_000_000;

// A null market cap is unknown, not zero, so it fails every threshold: an
// unknown size is not a size above a threshold.
function meetsCap(marketCap, threshold) {
    return typeof marketCap === "number" && marketCap >= threshold;
}

export const FILTERS = [
    { key: "all", label: "All stocks", matches: () => true },
    { key: "popular", label: "Popular stocks", matches: (tile) => tile.popular === true },
    { key: "cap100b", label: "Market cap 100B+", matches: (tile) => meetsCap(tile.marketCap, CAP_100B) },
    { key: "cap10b", label: "Market cap 10B+", matches: (tile) => meetsCap(tile.marketCap, CAP_10B) },
    { key: "cap1b", label: "Market cap 1B+", matches: (tile) => meetsCap(tile.marketCap, CAP_1B) },
];

function filterFor(key) {
    return FILTERS.find((entry) => entry.key === key) ?? FILTERS[0];
}

// Applies a filter to the days the response already carries. A session group
// left with no tiles is dropped and a day left with no groups is dropped, which
// mirrors the server's own rule that only non-empty groups are sent. That is
// what makes the weekly board's emptied groups disappear and the monthly grid's
// per-cell cap and overflow count both describe what the filter actually left.
export function applyFilter(days, key) {
    const filter = filterFor(key);

    if (filter.key === "all") {
        return days ?? [];
    }

    return (days ?? [])
        .map((day) => ({
            ...day,
            sessions: (day.sessions ?? [])
                .map((session) => ({
                    ...session,
                    tiles: (session.tiles ?? []).filter(filter.matches),
                }))
                .filter((session) => session.tiles.length > 0),
        }))
        .filter((day) => day.sessions.length > 0);
}
