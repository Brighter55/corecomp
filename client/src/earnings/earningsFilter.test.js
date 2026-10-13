import { describe, expect, test } from "vitest";
import { applyFilter } from "./earningsFilter.js";

function tile(symbol, extra = {}) {
    return { symbol, name: `${symbol} Inc`, estimate: 1.1, ...extra };
}

function day(date, sessions) {
    return { date, sessions };
}

function visibleSymbols(days) {
    return days.flatMap((d) => d.sessions.flatMap((s) => s.tiles.map((t) => t.symbol)));
}

const DAYS = [
    day("2026-10-12", [
        {
            session: "before_open",
            tiles: [
                tile("BIG", { marketCap: 200_000_000_000, popular: true }),
                tile("TINY", { marketCap: 2_000_000_000, popular: false }),
            ],
        },
        { session: "after_close", tiles: [tile("UNK", { marketCap: null, popular: true })] },
    ]),
    day("2026-10-13", [
        {
            session: "before_open",
            tiles: [
                tile("MID", { marketCap: 20_000_000_000, popular: false }),
                tile("SMALL", { marketCap: 500_000_000, popular: false }),
            ],
        },
    ]),
];

describe("applyFilter", () => {
    test("all shows every tile", () => {
        expect(visibleSymbols(applyFilter(DAYS, "all"))).toEqual(["BIG", "TINY", "UNK", "MID", "SMALL"]);
    });

    test("popular keeps only the tiles the server flagged", () => {
        expect(visibleSymbols(applyFilter(DAYS, "popular"))).toEqual(["BIG", "UNK"]);
    });

    test("a threshold keeps the tiles at or above it", () => {
        expect(visibleSymbols(applyFilter(DAYS, "cap100b"))).toEqual(["BIG"]);
        expect(visibleSymbols(applyFilter(DAYS, "cap10b"))).toEqual(["BIG", "MID"]);
        expect(visibleSymbols(applyFilter(DAYS, "cap1b"))).toEqual(["BIG", "TINY", "MID"]);
    });

    test("an unknown market cap fails every threshold", () => {
        // UNK is null, an unknown size, so no threshold admits it.
        for (const key of ["cap100b", "cap10b", "cap1b"]) {
            expect(visibleSymbols(applyFilter(DAYS, key))).not.toContain("UNK");
        }
    });

    test("a market cap exactly at the threshold passes and just under does not", () => {
        const days = [
            day("2026-10-12", [
                {
                    session: "before_open",
                    tiles: [
                        tile("EXACT100", { marketCap: 100_000_000_000 }),
                        tile("UNDER100", { marketCap: 99_999_999_999 }),
                        tile("EXACT1B", { marketCap: 1_000_000_000 }),
                        tile("UNDER1B", { marketCap: 999_999_999 }),
                    ],
                },
            ]),
        ];

        expect(visibleSymbols(applyFilter(days, "cap100b"))).toEqual(["EXACT100"]);
        // At 1B: the exact one stays, both larger stay, the one just under goes.
        expect(visibleSymbols(applyFilter(days, "cap1b"))).toEqual(["EXACT100", "UNDER100", "EXACT1B"]);
    });

    test("emptied groups and days disappear", () => {
        const filtered = applyFilter(DAYS, "cap100b");

        // Oct 13 holds only MID and SMALL, neither above 100B, so the day goes.
        expect(filtered.map((d) => d.date)).toEqual(["2026-10-12"]);
        // Oct 12's after_close held only the unknown UNK, so the group goes.
        expect(filtered[0].sessions.map((s) => s.session)).toEqual(["before_open"]);
        expect(filtered[0].sessions[0].tiles.map((t) => t.symbol)).toEqual(["BIG"]);
    });

    test("an unknown key behaves as all", () => {
        expect(visibleSymbols(applyFilter(DAYS, "nonsense"))).toEqual(["BIG", "TINY", "UNK", "MID", "SMALL"]);
    });
});
