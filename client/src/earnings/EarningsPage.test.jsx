import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import EarningsPage from "./EarningsPage.jsx";
import { authenticatedClient } from "../helpers/api.js";
import { addDays, mondayOf, monthLabel, monthlyWindow, todayIso, weeklyWindow } from "./earningsWindow.js";

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

// A response whose days the test chooses, built from the window the page
// actually asked for so the tiles land in a rendered cell whatever today is.
function mockApiWith(build) {
    authenticatedClient.mockImplementation(async ({ payload }) => sessionResponse(build(payload)));
}

function body(payload, days) {
    return {
        asOf: "2026-10-11",
        window: { start: payload.start, end: addDays(payload.start, payload.days - 1) },
        days,
    };
}

function day(date, sessions) {
    return { date, sessions };
}

// Opens the popup and picks an option. userEvent, not fireEvent: the popover
// is Radix, which opens on real pointer events rather than a synthetic click.
async function selectFilter(user, label) {
    await user.click(screen.getByRole("button", { name: "Filter stocks" }));
    await user.click(await screen.findByRole("radio", { name: label }));
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

    test("filters to the tiles the server flagged popular", async () => {
        const user = userEvent.setup();
        // POPCO is popular but its market cap is tiny, so reading `popular`
        // rather than inferring size is the only way it survives.
        mockApiWith((payload) =>
            body(payload, [
                day(payload.start, [
                    {
                        session: "before_open",
                        tiles: [
                            { symbol: "POPCO", name: "Popular Co", estimate: 1.5, marketCap: 5, popular: true },
                            { symbol: "BIGCO", name: "Big Co", estimate: 2.5, marketCap: 300_000_000_000, popular: false },
                        ],
                    },
                ]),
            ]),
        );
        renderPage();
        await screen.findByText("POPCO");

        await selectFilter(user, "Popular stocks");

        expect(screen.getByText("POPCO")).toBeInTheDocument();
        expect(screen.queryByText("BIGCO")).not.toBeInTheDocument();
    });

    test("drops an unknown market cap under a threshold and never refetches", async () => {
        const user = userEvent.setup();
        mockApiWith((payload) =>
            body(payload, [
                day(payload.start, [
                    {
                        session: "before_open",
                        tiles: [
                            { symbol: "KNOWN", name: "Known Co", estimate: 1, marketCap: 300_000_000_000, popular: false },
                            { symbol: "UNKNOWN", name: "Unknown Co", estimate: 1, marketCap: null, popular: false },
                        ],
                    },
                ]),
            ]),
        );
        renderPage();
        await screen.findByText("KNOWN");
        const callsAfterLoad = authenticatedClient.mock.calls.length;

        await selectFilter(user, "Market cap 100B+");

        expect(screen.getByText("KNOWN")).toBeInTheDocument();
        expect(screen.queryByText("UNKNOWN")).not.toBeInTheDocument();
        // The filter narrows what was already received; a refetch would spend
        // the shared upstream quota for data the page already holds.
        expect(authenticatedClient.mock.calls.length).toBe(callsAfterLoad);
    });

    test("counts the monthly overflow over the filtered set", async () => {
        const user = userEvent.setup();
        const big = (index) => ({
            symbol: `BIG${index}`,
            name: `Big ${index}`,
            estimate: 1,
            marketCap: 150_000_000_000,
            popular: false,
        });
        const small = (index) => ({
            symbol: `SML${index}`,
            name: `Small ${index}`,
            estimate: 1,
            marketCap: 2_000_000_000,
            popular: false,
        });
        // Eight tiles on one day, three above 100B: the cap shows six and two
        // overflow, until the filter leaves only the three big ones.
        const tiles = [big(0), big(1), big(2), small(0), small(1), small(2), small(3), small(4)];
        mockApiWith((payload) =>
            body(payload, [day(payload.start, [{ session: "before_open", tiles }])]),
        );
        renderPage();
        await screen.findByText("BIG0");

        await user.click(screen.getByRole("radio", { name: "Monthly" }));
        const start = monthlyWindow(todayIso()).start;
        const cell = () => within(document.body.querySelector(`[data-date="${start}"]`));

        await waitFor(() => {
            expect(cell().getAllByTestId("earnings-tile")).toHaveLength(6);
        });
        expect(cell().getByTestId("month-overflow")).toHaveTextContent("+2 more");

        await selectFilter(user, "Market cap 100B+");

        await waitFor(() => {
            expect(cell().getAllByTestId("earnings-tile")).toHaveLength(3);
        });
        expect(cell().queryByTestId("month-overflow")).not.toBeInTheDocument();
    });

    test("shows an empty state when nothing matches the filter", async () => {
        const user = userEvent.setup();
        mockApiWith((payload) =>
            body(payload, [
                day(payload.start, [
                    {
                        session: "before_open",
                        tiles: [{ symbol: "TINYCO", name: "Tiny Co", estimate: 1, marketCap: null, popular: false }],
                    },
                ]),
            ]),
        );
        renderPage();
        await screen.findByText("TINYCO");

        await selectFilter(user, "Market cap 100B+");

        expect(await screen.findByTestId("earnings-filter-empty")).toBeInTheDocument();
        expect(screen.queryByTestId("weekly-board")).not.toBeInTheDocument();
    });
});
