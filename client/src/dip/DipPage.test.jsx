import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import DipPage from "./DipPage.jsx";
import { authenticatedClient } from "../helpers/api.js";

vi.mock("recharts", async () => {
  const actual = await vi.importActual("recharts");
  const React = await vi.importActual("react");
  return {
    ...actual,
    ResponsiveContainer: ({ children }) =>
      React.cloneElement(children, { width: 800, height: 400 }),
  };
});

// The real header pulls in auth, theme and the market search; none of that is
// what this page is being tested for.
vi.mock("../headers/product-header/ProductHeader.jsx", () => ({
  default: () => <div data-testid="product-header" />,
}));

// Mocking the shared client covers the page and the sidebar in one place: both
// import src/helpers/api.js.
vi.mock("../helpers/api.js", () => ({
  authenticatedClient: vi.fn(),
}));

const NAMES = {
  AAPL: "Apple Inc",
  MSFT: "Microsoft Corp",
  TROW: "T. Rowe Price Group Inc",
};

const VARIANCES = {
  AAPL: { "50": 7.08, "200": 12.71 },
  MSFT: { "50": -1.32, "200": -2.63 },
  TROW: { "50": -21.2, "200": -27.1 },
};

const SEARCH_RESULTS = Object.entries(NAMES).map(([symbol, name]) => ({ symbol, name }));

function sessionResponse(body, { ok = true } = {}) {
  return { ok, json: async () => body };
}

// Mirrors the real contract: one row per requested symbol, with `name` from the
// Symbol table and `unknown` standing in for a ticker that is not in it.
function buildDipResponse(symbols) {
  return sessionResponse({
    asOf: "2026-09-25",
    results: symbols.map((symbol) => ({
      symbol,
      name: NAMES[symbol] ?? null,
      price: NAMES[symbol] ? 100 : null,
      variance: VARIANCES[symbol] ?? { "50": null, "200": null },
      status: NAMES[symbol] ? "ok" : "unknown",
    })),
  });
}

function mockApi({ dipResponse = null } = {}) {
  authenticatedClient.mockImplementation(async ({ endpoint, payload }) => {
    if (endpoint === "/pages/symbol-search") {
      return sessionResponse(SEARCH_RESULTS);
    }

    if (endpoint === "/pages/dip") {
      return dipResponse ?? buildDipResponse(payload.symbols);
    }

    throw new Error(`unexpected endpoint: ${endpoint}`);
  });
}

function seedWatchlist(symbols) {
  localStorage.setItem("corecomp_dip_watchlist", JSON.stringify(symbols));
}

function renderPage() {
  return render(
    <MemoryRouter>
      <DipPage />
    </MemoryRouter>,
  );
}

// Typing kicks off a 300ms debounce, so wait past it plus the mocked request
// before asserting on suggestions or pressing Enter.
async function searchFor(value) {
  fireEvent.change(screen.getByLabelText("Search ticker"), { target: { value } });

  await act(async () => {
    await new Promise((resolve) => {
      setTimeout(resolve, 350);
    });
  });
}

function pressEnter() {
  fireEvent.keyDown(screen.getByLabelText("Search ticker"), { key: "Enter" });
}

describe("DipPage", () => {
  beforeEach(() => {
    // Nothing in setupTests.js clears storage, and the watchlist lives there.
    localStorage.clear();
    authenticatedClient.mockReset();
    mockApi();
  });

  test("renders the page heading and the header", () => {
    renderPage();

    expect(screen.getByRole("heading", { level: 1, name: "Dip Finder" })).toBeInTheDocument();
    expect(screen.getByTestId("product-header")).toBeInTheDocument();
  });

  test("starts with an empty watchlist and asks for nothing", () => {
    renderPage();

    expect(screen.getByText("Your watchlist is empty. Search above to add a ticker.")).toBeInTheDocument();
    expect(screen.getByTestId("dip-empty")).toBeInTheDocument();

    // No symbols means no request, so a visitor who has added nothing cannot
    // have spent any of their 5 free symbols.
    expect(authenticatedClient).not.toHaveBeenCalled();
  });

  test("opens on the 200-day window", () => {
    renderPage();

    expect(screen.getByRole("heading", { name: "Price vs 200d SMA" })).toBeInTheDocument();
    expect(screen.getByText("Variance from 200-day simple moving average")).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "200 DAY SMA" })).toHaveAttribute("aria-checked", "true");
  });

  test("offers exactly two SMA windows, with no 100-day option", () => {
    renderPage();

    expect(screen.getAllByRole("radio")).toHaveLength(2);
    expect(screen.queryByText("100 DAY SMA")).not.toBeInTheDocument();
  });

  test("restores a stored watchlist and names it from the response", async () => {
    seedWatchlist(["AAPL", "MSFT"]);
    renderPage();

    expect(await screen.findByText("Apple Inc")).toBeInTheDocument();
    expect(screen.getByText("Microsoft Corp")).toBeInTheDocument();
    expect(authenticatedClient).toHaveBeenCalledWith({
      endpoint: "/pages/dip",
      payload: { symbols: ["AAPL", "MSFT"] },
    });
  });

  test("removing a watchlist entry drops it from the sidebar", async () => {
    seedWatchlist(["AAPL", "MSFT"]);
    renderPage();

    await screen.findByText("Apple Inc");

    fireEvent.click(screen.getByLabelText("Remove AAPL from watchlist"));

    expect(screen.queryByText("Apple Inc")).not.toBeInTheDocument();
    expect(screen.getByText("Microsoft Corp")).toBeInTheDocument();
  });

  test("adding a symbol appends it and persists it", async () => {
    renderPage();

    await searchFor("TROW");
    pressEnter();

    expect(await screen.findByText("T. Rowe Price Group Inc")).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem("corecomp_dip_watchlist"))).toContain("TROW");
  });

  test("adding a duplicate is refused with a notice", async () => {
    seedWatchlist(["AAPL"]);
    renderPage();

    await screen.findByText("Apple Inc");

    await searchFor("AAPL");
    pressEnter();

    expect(screen.getByRole("status")).toHaveTextContent("AAPL is already in your watchlist");
    expect(screen.getAllByText("Apple Inc")).toHaveLength(1);
  });

  test("a ticker with no match in the symbol list is refused with a notice", async () => {
    renderPage();

    await searchFor("ZZZZ");
    pressEnter();

    expect(screen.getByRole("status")).toHaveTextContent('No match for "ZZZZ" in our symbol list');
  });

  test("switching to the 50-day window re-titles the card without refetching", async () => {
    seedWatchlist(["AAPL"]);
    renderPage();

    await screen.findByText("Apple Inc");
    const callsAfterLoad = authenticatedClient.mock.calls.length;

    fireEvent.click(screen.getByRole("radio", { name: "50 DAY SMA" }));

    expect(screen.getByRole("heading", { name: "Price vs 50d SMA" })).toBeInTheDocument();
    expect(screen.getByText("Variance from 50-day simple moving average")).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "50 DAY SMA" })).toHaveAttribute("aria-checked", "true");

    // Both windows arrive in one response, so toggling must not re-meter.
    expect(authenticatedClient.mock.calls.length).toBe(callsAfterLoad);
  });

  test("shows an inline upsell when the anonymous quota is exhausted", async () => {
    seedWatchlist(["AAPL"]);
    mockApi({
      dipResponse: sessionResponse(
        { detail: "quota_exceeded" },
        { ok: false },
      ),
    });
    renderPage();

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("You've used all 5 free symbols for this month");

    // An inline message, not a redirect away from a page mid-interaction.
    expect(screen.getByRole("heading", { level: 1, name: "Dip Finder" })).toBeInTheDocument();
  });

  test("shows an empty state when no row has a usable moving average", async () => {
    seedWatchlist(["AAPL"]);
    mockApi({
      dipResponse: sessionResponse({
        asOf: "2026-09-25",
        results: [
          {
            symbol: "AAPL",
            name: "Apple Inc",
            price: 231.4,
            variance: { "50": null, "200": null },
            status: "ok",
          },
        ],
      }),
    });
    renderPage();

    expect(
      await screen.findByText("No moving-average data for your watchlist yet."),
    ).toBeInTheDocument();
  });

  test("treats an unknown symbol as unavailable without failing the page", async () => {
    seedWatchlist(["AAPL", "ZZZZ"]);
    renderPage();

    // The known row still charts, and the unknown one still lists -- with its
    // ticker standing in for the missing name rather than throwing.
    expect(await screen.findByText("Apple Inc")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getAllByText("ZZZZ").length).toBeGreaterThan(0);
    });
  });

  test("clicking the chart expands it to fullscreen, and it closes again", async () => {
    seedWatchlist(["AAPL"]);
    renderPage();

    await screen.findByText("Apple Inc");
    expect(screen.queryByLabelText("Close graph")).not.toBeInTheDocument();

    // No dedicated expand control: the chart body carries the click, matching
    // every other graph in the app.
    fireEvent.click(screen.getByTestId("dip-chart-body"));

    fireEvent.click(screen.getByLabelText("Close graph"));

    expect(screen.queryByLabelText("Close graph")).not.toBeInTheDocument();
  });
});
