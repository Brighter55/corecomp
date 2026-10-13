import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import EarningsPage from "./EarningsPage.jsx";
import { authenticatedClient } from "../helpers/api.js";
import { addDays, mondayOf, monthLabel, todayIso, weeklyWindow } from "./earningsWindow.js";

// The real header pulls in auth, theme and the market search; none of that is
// what this page is being tested for.
vi.mock("../headers/product-header/ProductHeader.jsx", () => ({
    default: () => <div data-testid="product-header" />,
}));

vi.mock("../helpers/api.js", () => ({
    authenticatedClient: vi.fn(),
}));

function sessionResponse(body, { ok = true } = {}) {
    return { ok, json: async () => body };
}

function tile(symbol, name, estimate) {
    return { symbol, name, estimate };
}

// The three groups in the server's canonical order.
const SESSIONS = [
    { session: "before_open", tiles: [tile("TSM", "Taiwan Semiconductor", 1.79)] },
    { session: "after_close", tiles: [tile("NFLX", "Netflix, Inc.", 5.12)] },
    { session: "unannounced", tiles: [tile("WAL", "Western Alliance", 1.86)] },
];

// Dates are derived from the window the page actually asked for, so the days
// always land in the rendered columns whatever today is.
function buildResponse(payload) {
    return {
        asOf: "2026-10-11",
        window: { start: payload.start, end: addDays(payload.start, payload.days - 1) },
        days: [
            { date: payload.start, sessions: SESSIONS },
            { date: addDays(payload.start, 2), sessions: [{ session: "before_open", tiles: [tile("AAPL", "Apple Inc", 1.5)] }] },
        ],
    };
}

function mockApi(override) {
    authenticatedClient.mockImplementation(async ({ payload }) => {
        if (override) {
            return override;
        }
        return sessionResponse(buildResponse(payload));
    });
}

function renderPage() {
    return render(
        <MemoryRouter>
            <EarningsPage />
        </MemoryRouter>,
    );
}

const expectedStart = () => weeklyWindow(todayIso()).start;

describe("EarningsPage", () => {
    beforeEach(() => {
        authenticatedClient.mockReset();
        mockApi();
    });

    test("renders the page heading and the header", () => {
        renderPage();

        expect(screen.getByRole("heading", { level: 1, name: "Earnings Calendar" })).toBeInTheDocument();
        expect(screen.getByTestId("product-header")).toBeInTheDocument();
    });

    test("asks for the Monday-to-Friday week on mount", () => {
        renderPage();

        expect(authenticatedClient).toHaveBeenCalledWith({
            endpoint: "/pages/earnings-calendar",
            payload: { start: expectedStart(), days: 5 },
        });
    });

    test("opens on the weekly view and draws five day columns", async () => {
        renderPage();

        await screen.findByText("TSM");

        expect(screen.getByRole("radio", { name: "Weekly" })).toHaveAttribute("aria-checked", "true");

        // Scoped to the board: the shared footer also carries level-3 headings.
        const board = screen.getByTestId("weekly-board");

        expect(within(board).getAllByRole("heading", { level: 3 })).toHaveLength(5);
        expect(within(board).getAllByRole("heading", { level: 3 })[0]).toHaveTextContent("Mon");
    });

    test("shows a loading skeleton before the window arrives", () => {
        renderPage();

        expect(screen.getByTestId("earnings-loading")).toBeInTheDocument();
    });

    test("renders each day's session groups in the server's array order", async () => {
        // Deliberately not the canonical order: the page must follow the array
        // it was handed rather than impose its own.
        const start = expectedStart();
        mockApi(
            sessionResponse({
                asOf: "2026-10-11",
                window: { start, end: addDays(start, 4) },
                days: [
                    {
                        date: start,
                        sessions: [
                            { session: "unannounced", tiles: [tile("WAL", "Western Alliance", 1.86)] },
                            { session: "after_close", tiles: [tile("NFLX", "Netflix, Inc.", 5.12)] },
                            { session: "before_open", tiles: [tile("TSM", "Taiwan Semiconductor", 1.79)] },
                        ],
                    },
                ],
            }),
        );
        renderPage();

        await screen.findByText("WAL");

        const groupHeadings = screen
            .getAllByRole("heading", { level: 4 })
            .map((heading) => heading.textContent);

        expect(groupHeadings).toEqual(["Unannounced", "After Close", "Before Open"]);
    });

    test("shows a tile's estimate in its tooltip", async () => {
        renderPage();

        const symbol = await screen.findByText("TSM");

        expect(symbol.closest('[data-testid="earnings-tile"]')).toHaveAttribute(
            "title",
            "Taiwan Semiconductor · Est. EPS 1.79",
        );
    });

    test("shows each company's logo, falling back to the ticker chip", async () => {
        const { container } = renderPage();

        await screen.findByText("TSM");

        const logo = container.querySelector('img[src*="img.logo.dev"]');
        expect(logo).toBeInTheDocument();
        expect(logo.getAttribute("src")).toContain("TSM");

        // logo.dev has no mark for every ticker, so a failed image degrades to
        // the ticker chip rather than leaving an empty circle.
        fireEvent.error(logo);

        expect(logo).not.toBeInTheDocument();
        expect(await screen.findByTestId("ticker-chip")).toBeInTheDocument();
    });

    test("walks the week forward and back by seven days", async () => {
        renderPage();
        await screen.findByText("TSM");

        fireEvent.click(screen.getByRole("button", { name: "Next week" }));

        await waitFor(() => {
            expect(authenticatedClient).toHaveBeenLastCalledWith({
                endpoint: "/pages/earnings-calendar",
                payload: { start: addDays(expectedStart(), 7), days: 5 },
            });
        });

        fireEvent.click(screen.getByRole("button", { name: "Previous week" }));

        await waitFor(() => {
            expect(authenticatedClient).toHaveBeenLastCalledWith({
                endpoint: "/pages/earnings-calendar",
                payload: { start: expectedStart(), days: 5 },
            });
        });
    });

    test("switching to the monthly grid asks for whole weeks of the month", async () => {
        const user = userEvent.setup();
        renderPage();
        await screen.findByText("TSM");

        await user.click(screen.getByRole("radio", { name: "Monthly" }));

        await waitFor(() => {
            expect(authenticatedClient).toHaveBeenLastCalledWith({
                endpoint: "/pages/earnings-calendar",
                payload: {
                    start: expect.any(String),
                    days: expect.any(Number),
                },
            });
        });

        const lastPayload = authenticatedClient.mock.calls.at(-1)[0].payload;

        // A whole number of Monday-to-Sunday rows, inside the server's 1..42.
        expect(lastPayload.days % 7).toBe(0);
        expect(lastPayload.days).toBeGreaterThanOrEqual(28);
        expect(lastPayload.days).toBeLessThanOrEqual(42);
        expect(lastPayload.start).toBe(mondayOf(lastPayload.start));

        // And the toolbar names the month the grid covers.
        expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(monthLabel(todayIso()));
    });

    test("shows an alert when the window cannot be loaded", async () => {
        mockApi(sessionResponse({ detail: "boom" }, { ok: false }));
        renderPage();

        const alert = await screen.findByRole("alert");

        expect(alert).toHaveTextContent("Earnings data is unavailable right now");

        // The toolbar survives the failure, so the visitor can page elsewhere.
        expect(screen.getByRole("radio", { name: "Weekly" })).toBeInTheDocument();
    });

    test("shows an empty state when the window holds no earnings", async () => {
        mockApi(
            sessionResponse({
                asOf: "2026-10-11",
                window: { start: expectedStart(), end: addDays(expectedStart(), 4) },
                days: [],
            }),
        );
        renderPage();

        expect(await screen.findByTestId("earnings-empty")).toBeInTheDocument();
    });

    test("renders the shared footer", () => {
        renderPage();

        expect(screen.getByRole("contentinfo")).toBeInTheDocument();
        expect(screen.getByRole("link", { name: "Contact Us" })).toHaveAttribute(
            "href",
            "mailto:support@corecomp.cc",
        );
    });

    test("shows the snapshot date the server reported", async () => {
        renderPage();

        expect(await screen.findByText("Updated as of 2026-10-11")).toBeInTheDocument();
    });
});
