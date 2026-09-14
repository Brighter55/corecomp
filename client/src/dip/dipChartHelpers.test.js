import { describe, expect, test } from "vitest";
import {
    BAR_COLORS,
    barColorFor,
    buildDipRows,
    filterSymbols,
    findSymbolEntry,
    formatVariance,
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
    test("gives the deepest dips the alert colour", () => {
        expect(barColorFor(-27)).toBe(BAR_COLORS.deepDip);
        expect(barColorFor(-20)).toBe(BAR_COLORS.deepDip);
    });

    test("shows moderate dips in the muted tone", () => {
        expect(barColorFor(-19)).toBe(BAR_COLORS.dip);
        expect(barColorFor(-1)).toBe(BAR_COLORS.dip);
    });

    test("treats flat and positive the same", () => {
        expect(barColorFor(0)).toBe(BAR_COLORS.neutral);
        expect(barColorFor(12)).toBe(BAR_COLORS.neutral);
    });
});

describe("formatVariance", () => {
    test("renders bare values with no leading plus, as the design does", () => {
        expect(formatVariance(-27)).toBe("-27%");
        expect(formatVariance(0)).toBe("0%");
        expect(formatVariance(12)).toBe("12%");
    });

    test("falls back for missing data", () => {
        expect(formatVariance(undefined)).toBe("--");
        expect(formatVariance(Number.NaN)).toBe("--");
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
});
