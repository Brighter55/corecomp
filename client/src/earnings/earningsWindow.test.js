import { describe, expect, test } from "vitest";
import {
    addDays,
    dayLabel,
    dayOfMonth,
    daysByDate,
    flattenTiles,
    isSameMonth,
    mondayOf,
    monthLabel,
    monthlyWindow,
    shiftMonths,
    weekdayCells,
    weekdayHeaders,
    weeklyLabel,
    weeklyWindow,
} from "./earningsWindow.js";

// 2026-10-12 is a Monday: the contract's own example window starts on it and
// runs to Sunday 2026-10-18.
describe("mondayOf", () => {
    test("walks back to the Monday of the week", () => {
        expect(mondayOf("2026-10-12")).toBe("2026-10-12");
        expect(mondayOf("2026-10-15")).toBe("2026-10-12");
        expect(mondayOf("2026-10-18")).toBe("2026-10-12");
    });

    test("crosses a month boundary rather than staying in it", () => {
        expect(mondayOf("2026-10-01")).toBe("2026-09-28");
        expect(mondayOf("2026-11-01")).toBe("2026-10-26");
    });
});

describe("addDays", () => {
    test("rolls over months and years", () => {
        expect(addDays("2026-10-31", 1)).toBe("2026-11-01");
        expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
        expect(addDays("2026-01-01", -1)).toBe("2025-12-31");
    });
});

describe("shiftMonths", () => {
    test("keeps the day of month when the target has it", () => {
        expect(shiftMonths("2026-10-12", 1)).toBe("2026-11-12");
        expect(shiftMonths("2026-10-12", -1)).toBe("2026-09-12");
    });

    test("clamps into a shorter month instead of overflowing", () => {
        expect(shiftMonths("2026-01-31", 1)).toBe("2026-02-28");
        expect(shiftMonths("2026-03-31", -1)).toBe("2026-02-28");
    });

    test("crosses the year boundary", () => {
        expect(shiftMonths("2026-12-15", 1)).toBe("2027-01-15");
    });
});

describe("weeklyWindow", () => {
    test("is the Monday-to-Friday week holding the anchor, five days long", () => {
        expect(weeklyWindow("2026-10-15")).toEqual({ start: "2026-10-12", days: 5 });
    });

    test("anchoring on any day of the week gives the same window", () => {
        expect(weeklyWindow("2026-10-12")).toEqual(weeklyWindow("2026-10-16"));
    });
});

describe("monthlyWindow", () => {
    test("runs Monday-to-Sunday over the weeks the month touches", () => {
        // Oct 1 is a Thursday, so the grid opens on Mon Sep 28 and closes on
        // Sun Nov 1 -- five week rows.
        expect(monthlyWindow("2026-10-12")).toEqual({ start: "2026-09-28", days: 35 });
    });

    test("uses six week rows when the month spills into a sixth", () => {
        // Mar 1 2026 is a Sunday and March has 31 days, the worst case: six
        // rows, 42 days, exactly the server's upper bound.
        expect(monthlyWindow("2026-03-15")).toEqual({ start: "2026-02-23", days: 42 });
    });

    test("names the month from the anchor, not the grid's start", () => {
        // The grid starts in September, but this is the October view.
        expect(monthLabel("2026-10-12")).toBe("October 2026");
    });
});

describe("weekdayCells", () => {
    test("lists Monday to Friday for a one-week window", () => {
        expect(weekdayCells("2026-10-12", 5)).toEqual([
            "2026-10-12",
            "2026-10-13",
            "2026-10-14",
            "2026-10-15",
            "2026-10-16",
        ]);
    });

    test("lists every weekday over a monthly window, weekends dropped", () => {
        const cells = weekdayCells("2026-09-28", 35);

        expect(cells).toHaveLength(25);
        expect(cells[0]).toBe("2026-09-28");
        expect(cells[4]).toBe("2026-10-02");
        expect(cells[5]).toBe("2026-10-05");
        expect(cells.at(-1)).toBe("2026-10-30");
        // No weekend ever appears.
        expect(cells.some((iso) => dayLabel(iso).startsWith("Sat"))).toBe(false);
        expect(cells.some((iso) => dayLabel(iso).startsWith("Sun"))).toBe(false);
    });

    test("exposes the weekday header row in board order", () => {
        expect(weekdayHeaders()).toEqual(["Mon", "Tue", "Wed", "Thu", "Fri"]);
    });
});

describe("labels", () => {
    test("formats a weekly range with the year only at the end", () => {
        expect(weeklyLabel({ start: "2026-10-12", days: 5 })).toBe("Oct 12 – Oct 16, 2026");
    });

    test("formats a single day as weekday plus number", () => {
        expect(dayLabel("2026-10-12")).toBe("Mon 12");
        expect(dayOfMonth("2026-10-05")).toBe(5);
    });
});

describe("isSameMonth", () => {
    test("separates the grid's leading days from the displayed month", () => {
        expect(isSameMonth("2026-09-28", "2026-10-12")).toBe(false);
        expect(isSameMonth("2026-10-01", "2026-10-12")).toBe(true);
        expect(isSameMonth("2026-10-31", "2026-10-12")).toBe(true);
    });
});

describe("daysByDate", () => {
    test("keys the server's days by their date", () => {
        const day = { date: "2026-10-15", sessions: [] };

        expect(daysByDate([day]).get("2026-10-15")).toBe(day);
    });

    test("survives a missing response", () => {
        expect(daysByDate(undefined).size).toBe(0);
        expect(daysByDate(null).size).toBe(0);
    });
});

describe("flattenTiles", () => {
    test("concatenates the day's tiles across sessions in array order", () => {
        const day = {
            sessions: [
                { session: "before_open", tiles: [{ symbol: "AAPL" }] },
                { session: "unannounced", tiles: [{ symbol: "MSFT" }, { symbol: "NVDA" }] },
            ],
        };

        expect(flattenTiles(day).map((tile) => tile.symbol)).toEqual(["AAPL", "MSFT", "NVDA"]);
    });

    test("returns nothing for an absent day", () => {
        expect(flattenTiles(undefined)).toEqual([]);
    });
});
