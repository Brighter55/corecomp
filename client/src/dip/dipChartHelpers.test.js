import { describe, expect, test } from "vitest";
import {
    barColorFor,
    buildDipRows,
    buildSymbolEntries,
    buildVarianceByWindow,
    filterSymbols,
    findSymbolEntry,
    formatVariance,
    formatVarianceTick,
} from "./dipChartHelpers.js";

describe("buildDipRows", () => {
    test("orders worst dip first", () => {
        const rows = buildDipRows({ AAPL: 12, TROW: -27, MSFT: 0 });

        expect(rows.map((row) => row.symbol)).toEqual(["TROW", "MSFT", "AAPL"]);
    });

    test("keeps the source order for equal values so the design's ties hold", () => {
        const rows = buildDipRows({ TGT: -11, DIS: -11, MSFT: 0, HD: 0 });

        expect(rows.map((row) => row.symbol)).toEqual(["TGT", "DIS", "MSFT", "HD"]);
    });

    test("returns an empty list when there is no series", () => {
        expect(buildDipRows(undefined)).toEqual([]);
    });
});

describe("barColorFor", () => {
    const redChannel = (hex) => parseInt(hex.slice(1, 3), 16);
    const greenChannel = (hex) => parseInt(hex.slice(3, 5), 16);

    test("starts both arms at their quietest tone on the zero line", () => {
        expect(barColorFor(0)).toBe("#5f7b5c");
        expect(barColorFor(0, "light")).toBe("#95b594");
    });

    test("reaches the arm's full-strength colour only at the axis extreme", () => {
        expect(barColorFor(-30)).toBe("#fe5b5f");
        expect(barColorFor(15)).toBe("#00c807");
        expect(barColorFor(-30, "light")).toBe("#b4343a");
        expect(barColorFor(15, "light")).toBe("#246f27");
    });

    // The bug this replaced: five fixed steps put neighbouring columns in the
    // same band, so the best performer and the next one down came out identical.
    test("gives every distinct variance its own tone, with no banding", () => {
        const greens = [0, 1, 3, 6, 9, 12, 15].map((v) => greenChannel(barColorFor(v)));
        const reds = [-1, -5, -10, -15, -20, -25, -30].map((v) => redChannel(barColorFor(v)));

        expect(new Set(greens).size).toBe(greens.length);
        expect(new Set(reds).size).toBe(reds.length);
    });

    test("deepens in one direction along each arm", () => {
        const greens = [0, 1, 3, 6, 9, 12, 15].map((v) => greenChannel(barColorFor(v)));
        const reds = [-1, -5, -10, -15, -20, -25, -30].map((v) => redChannel(barColorFor(v)));

        expect(greens).toEqual([...greens].sort((a, b) => a - b));
        expect(reds).toEqual([...reds].sort((a, b) => a - b));
    });

    test("keeps the two themes on their own sets of tones", () => {
        expect(barColorFor(7.5, "light")).not.toBe(barColorFor(7.5, "dark"));
    });

    test("clamps a variance past the fixed axis to the deepest tone", () => {
        expect(barColorFor(-42)).toBe("#fe5b5f");
        expect(barColorFor(90)).toBe("#00c807");
    });

    test("falls back to the quietest tone for a missing value", () => {
        expect(barColorFor(Number.NaN)).toBe("#5f7b5c");
        expect(barColorFor(undefined)).toBe("#5f7b5c");
    });
});

describe("formatVariance", () => {
    test("renders bare values with no leading plus, as the design does", () => {
        expect(formatVariance(-27)).toBe("-27.00%");
        expect(formatVariance(0)).toBe("0.00%");
        expect(formatVariance(12)).toBe("12.00%");
    });

    test("keeps the hundredths the API actually reports", () => {
        expect(formatVariance(-11.4)).toBe("-11.40%");
        expect(formatVariance(12.71)).toBe("12.71%");
    });

    test("does not sign a value that rounds away to zero", () => {
        expect(formatVariance(-0.001)).toBe("0.00%");
        expect(formatVariance(-0.004)).toBe("0.00%");
    });

    test("falls back for missing data", () => {
        expect(formatVariance(undefined)).toBe("--");
        expect(formatVariance(Number.NaN)).toBe("--");
    });
});

describe("formatVarianceTick", () => {
    test("keeps the gridlines at whole percents", () => {
        expect(formatVarianceTick(15)).toBe("15%");
        expect(formatVarianceTick(0)).toBe("0%");
        expect(formatVarianceTick(-5)).toBe("-5%");
        expect(formatVarianceTick(-30)).toBe("-30%");
    });
});

describe("findSymbolEntry", () => {
    const symbols = [{ symbol: "AAPL", name: "Apple Inc" }];

    test("matches regardless of case and surrounding space", () => {
        expect(findSymbolEntry(symbols, "  aapl ")).toEqual(symbols[0]);
    });

    test("returns null for anything not in the fixture", () => {
        expect(findSymbolEntry(symbols, "ZZZZ")).toBeNull();
        expect(findSymbolEntry(symbols, "")).toBeNull();
    });
});

describe("buildVarianceByWindow", () => {
    const results = [
        { symbol: "AAPL", variance: { "50": 7.08, "200": 12.71 } },
        { symbol: "TROW", variance: { "50": -21.2, "200": -27.1 } },
        { symbol: "SBUX", variance: { "50": -13, "200": null } },
    ];

    test("extracts the requested window and feeds buildDipRows unchanged", () => {
        const variance = buildVarianceByWindow(results, "200");

        expect(variance).toEqual({ AAPL: 12.71, TROW: -27.1 });
        expect(buildDipRows(variance).map((row) => row.symbol)).toEqual(["TROW", "AAPL"]);
    });

    test("drops symbols with no average rather than plotting them as zero", () => {
        // A null would coerce to 0 in buildDipRows' numeric sort and land the
        // row in the middle of the chart, which reads as "flat", not "unknown".
        expect(buildVarianceByWindow(results, "200")).not.toHaveProperty("SBUX");
    });

    test("survives an empty or missing response", () => {
        expect(buildVarianceByWindow([], "200")).toEqual({});
        expect(buildVarianceByWindow(undefined, "200")).toEqual({});
    });
});

describe("buildSymbolEntries", () => {
    test("maps the response rows to symbol/name entries", () => {
        expect(
            buildSymbolEntries([{ symbol: "AAPL", name: "Apple Inc", price: 231.4 }]),
        ).toEqual([{ symbol: "AAPL", name: "Apple Inc" }]);
    });

    test("falls back to the ticker when there is no name", () => {
        // Guards filterSymbols, which calls .toLowerCase() on the name.
        expect(buildSymbolEntries([{ symbol: "ZZZZ", name: null }])).toEqual([
            { symbol: "ZZZZ", name: "ZZZZ" },
        ]);
    });

    test("survives a missing response", () => {
        expect(buildSymbolEntries(undefined)).toEqual([]);
    });
});

describe("filterSymbols", () => {
    const symbols = [
        { symbol: "COST", name: "Costco Wholesale Corp" },
        { symbol: "AAPL", name: "Apple Inc" },
        { symbol: "DIS", name: "Walt Disney Co" },
    ];

    test("matches on symbol and on company name", () => {
        expect(filterSymbols(symbols, "cos").map((entry) => entry.symbol)).toEqual(["COST"]);
        expect(filterSymbols(symbols, "disney").map((entry) => entry.symbol)).toEqual(["DIS"]);
    });

    test("never offers something already on the watchlist", () => {
        expect(filterSymbols(symbols, "cos", ["COST"])).toEqual([]);
    });

    test("offers nothing for an empty query", () => {
        expect(filterSymbols(symbols, "   ")).toEqual([]);
    });

    test("does not throw on an entry with no name", () => {
        expect(filterSymbols([{ symbol: "ZZZZ", name: null }], "zzz")).toEqual([
            { symbol: "ZZZZ", name: null },
        ]);
    });
});
