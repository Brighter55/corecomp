import { render, screen, within } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import MonthlyGrid from "./MonthlyGrid.jsx";
import { daysByDate, weekdayCells } from "../earningsWindow.js";

function tile(symbol) {
    return { symbol, name: `${symbol} Inc`, estimate: 1.1 };
}

function day(date, tiles) {
    return { date, sessions: [{ session: "before_open", tiles }] };
}

function renderGrid(days, monthAnchor = "2026-10-12") {
    return render(
        <MonthlyGrid
            cells={weekdayCells("2026-09-28", 35)}
            daysByDate={daysByDate(days)}
            monthAnchor={monthAnchor}
        />,
    );
}

function cellFor(container, iso) {
    return within(container.querySelector(`[data-date="${iso}"]`));
}

describe("MonthlyGrid", () => {
    test("renders a Monday-to-Friday header row", () => {
        renderGrid([]);

        expect(screen.getByText("Mon")).toBeInTheDocument();
        expect(screen.getByText("Fri")).toBeInTheDocument();
        expect(screen.queryByText("Sat")).not.toBeInTheDocument();
        expect(screen.queryByText("Sun")).not.toBeInTheDocument();
    });

    test("caps a busy day and counts the rest, the overflow being the true total", () => {
        // Oct 1 is inside the displayed month; 20 entries is 14 past the cap of 6.
        renderGrid([
            day(
                "2026-10-01",
                Array.from({ length: 20 }, (_, index) => tile(`SYM${index}`)),
            ),
        ]);

        const cell = cellFor(document.body, "2026-10-01");

        expect(cell.getAllByTestId("earnings-tile")).toHaveLength(6);
        expect(cell.getByTestId("month-overflow")).toHaveTextContent("+14 more");
    });

    test("shows no overflow indicator when the day fits", () => {
        renderGrid([day("2026-10-01", [tile("AAPL"), tile("MSFT"), tile("NVDA")])]);

        const cell = cellFor(document.body, "2026-10-01");

        expect(cell.getAllByTestId("earnings-tile")).toHaveLength(3);
        expect(cell.queryByTestId("month-overflow")).not.toBeInTheDocument();
    });

    test("treats a day that exactly fills the cap as fitting", () => {
        renderGrid([day("2026-10-01", Array.from({ length: 6 }, (_, i) => tile(`S${i}`)))]);

        const cell = cellFor(document.body, "2026-10-01");

        expect(cell.getAllByTestId("earnings-tile")).toHaveLength(6);
        expect(cell.queryByTestId("month-overflow")).not.toBeInTheDocument();
    });

    test("keeps the server's tile order rather than sorting", () => {
        // The server sorts ascending by symbol and owns that order; feeding it
        // unsorted proves the grid does not impose a sort of its own.
        renderGrid([day("2026-10-01", [tile("ZZZ"), tile("AAA"), tile("MMM")])]);

        const symbols = cellFor(document.body, "2026-10-01")
            .getAllByTestId("earnings-tile")
            .map((tileElement) => tileElement.textContent);

        expect(symbols).toEqual(["ZZZ", "AAA", "MMM"]);
    });

    test("counts tiles across every session on the day", () => {
        renderGrid([
            {
                date: "2026-10-01",
                sessions: [
                    { session: "before_open", tiles: [tile("A1"), tile("A2")] },
                    { session: "after_close", tiles: [tile("B1"), tile("B2")] },
                    { session: "unannounced", tiles: [tile("C1"), tile("C2")] },
                ],
            },
        ]);

        const cell = cellFor(document.body, "2026-10-01");

        expect(cell.getAllByTestId("earnings-tile")).toHaveLength(6);
        expect(cell.queryByTestId("month-overflow")).not.toBeInTheDocument();
    });

    test("dims a cell that falls outside the displayed month", () => {
        const { container } = renderGrid([]);

        // Sep 28 is the grid's first cell but belongs to September, not October.
        expect(container.querySelector('[data-date="2026-09-28"]').className).toContain("opacity-40");
        expect(container.querySelector('[data-date="2026-10-01"]').className).not.toContain("opacity-40");
    });

    test("renders an empty cell for a date the server omitted", () => {
        renderGrid([day("2026-10-01", [tile("AAPL")])]);

        const cell = cellFor(document.body, "2026-10-02");

        expect(cell.queryAllByTestId("earnings-tile")).toHaveLength(0);
        // The date number still shows, so the grid reads as a calendar.
        expect(cell.getByText("2")).toBeInTheDocument();
    });
});
