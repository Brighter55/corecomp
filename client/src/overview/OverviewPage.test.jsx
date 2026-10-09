import OverviewPage from "./OverviewPage.tsx";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { authenticatedClient } from "../helpers/api.js";

const { mockNavigate } = vi.hoisted(() => ({
  mockNavigate: vi.fn(),
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock("../helpers/api.js", async () => {
  const actual = await vi.importActual("../helpers/api.js");
  return { ...actual, authenticatedClient: vi.fn() };
});

vi.mock("../headers/product-header/ProductHeader.jsx", () => ({
  default: () => <div data-testid="product-header">Product Header</div>,
}));

vi.mock("../shared/SymbolSearch.jsx", () => ({
  default: ({ handleSearchSubmit }) => (
    <input
      data-testid="symbol-search"
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          handleSearchSubmit(e, "AAPL");
        }
      }}
    />
  ),
}));

// --- viewport -----------------------------------------------------------------
// jsdom's matchMedia always reports matches: false, so without this the page
// would render one card per page in every test.

let currentWidth = 1440;
let mediaListeners = [];

function setViewport(width) {
  currentWidth = width;
  window.matchMedia = vi.fn((query) => {
    const min = Number(/min-width:\s*(\d+)px/.exec(query)?.[1] ?? 0);
    return {
      get matches() {
        return currentWidth >= min;
      },
      media: query,
      addEventListener: (_event, callback) => mediaListeners.push(callback),
      removeEventListener: vi.fn(),
    };
  });
}

function resizeTo(width) {
  currentWidth = width;
  // act() is required: the listeners call setState, and without it React does
  // not flush the re-render before the assertions run.
  act(() => {
    mediaListeners.forEach((callback) => callback());
  });
}

// --- fixtures -----------------------------------------------------------------

// Ranked descending by percentChange, as the backend returns them. 12 entries
// so paging is exercised: 3 pages at the desktop page size of 4.
const RANKED = [
  ["JNJ", 1.44], ["AMZN", 1.42], ["AAPL", 0.91], ["WMT", 0.9],
  ["XOM", 0.55], ["KO", 0.31], ["HD", 0.12], ["META", -0.18],
  ["GOOGL", -0.44], ["V", -0.76], ["UNH", -1.2], ["TSLA", -2.45],
];

const MOVERS = RANKED.map(([symbol, percentChange], index) => ({
  symbol,
  name: `${symbol} Holdings`,
  price: 100 + index,
  percentChange,
  volume: 1000000 + index,
  marketCap: 1000000000 + index,
  spark: [1, 2, 3, 4, 5, 6],
}));

const PAGE_SIZE = 4;

function response(body, { ok = true, status = 200 } = {}) {
  return { ok, status, json: async () => body };
}

function renderPage() {
  return render(
    <MemoryRouter>
      <OverviewPage />
    </MemoryRouter>
  );
}

/** Resolve the trending fetch with `body` and wait for the section to settle. */
async function renderWithMovers(body) {
  authenticatedClient.mockResolvedValue(response(body));
  const result = renderPage();
  await waitFor(() =>
    expect(screen.queryByTestId("trending-loading")).not.toBeInTheDocument()
  );
  return result;
}

function renderedSymbols() {
  return MOVERS.filter((mover) => screen.queryByText(mover.symbol) !== null).map(
    (mover) => mover.symbol
  );
}

const nextButton = () => screen.getByRole("button", { name: "Next trending stocks" });
const prevButton = () => screen.getByRole("button", { name: "Previous trending stocks" });

describe("OverviewPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mediaListeners = [];
    setViewport(1440);
    authenticatedClient.mockResolvedValue(response({ asOf: "2026-10-08", movers: MOVERS }));
  });

  // --- page plumbing --------------------------------------------------------

  test("loads up properly", () => {
    renderPage();

    expect(screen.getByText("CoreComp")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Today's movers" })).toBeInTheDocument();
  });

  test("handles search submit by navigating to the symbol overview", () => {
    renderPage();

    fireEvent.keyDown(screen.getByTestId("symbol-search"), { key: "Enter" });

    expect(mockNavigate).toHaveBeenCalledWith("/overview/AAPL");
  });

  test("renders no section beyond Today's movers", () => {
    renderPage();

    // The Market News placeholder was removed, and nothing replaced it.
    expect(screen.queryByRole("heading", { name: "Market News" })).not.toBeInTheDocument();
    expect(screen.getAllByRole("heading", { level: 2 })).toHaveLength(1);
  });

  test("the section title is not a link", () => {
    renderPage();

    // The titles used to be <a href="#"> with a chevron, going nowhere.
    expect(screen.getByRole("heading", { name: "Today's movers" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Today's movers" })).not.toBeInTheDocument();
  });

  test("requests the trending endpoint once, as a POST", () => {
    renderPage();

    // Payload must be an object: authenticatedClient sends a GET without one,
    // and the view only accepts POST.
    expect(authenticatedClient).toHaveBeenCalledTimes(1);
    expect(authenticatedClient).toHaveBeenCalledWith({
      endpoint: "/pages/trending",
      payload: {},
    });
  });

  test("shows a loading skeleton until the movers arrive", () => {
    authenticatedClient.mockReturnValue(new Promise(() => {}));

    renderPage();

    expect(screen.getByTestId("trending-loading")).toBeInTheDocument();
    expect(screen.queryByText("JNJ")).not.toBeInTheDocument();
  });

  // --- carousel -------------------------------------------------------------

  test("shows only the first page and disables the previous arrow", async () => {
    await renderWithMovers({ asOf: "2026-10-08", movers: MOVERS });

    expect(renderedSymbols()).toEqual(["JNJ", "AMZN", "AAPL", "WMT"]);
    expect(prevButton()).toBeDisabled();
    expect(nextButton()).toBeEnabled();
  });

  test("the next arrow reveals the following page", async () => {
    await renderWithMovers({ asOf: "2026-10-08", movers: MOVERS });

    fireEvent.click(nextButton());

    expect(renderedSymbols()).toEqual(["XOM", "KO", "HD", "META"]);
    expect(prevButton()).toBeEnabled();
  });

  test("paging does not refetch -- the whole list is already loaded", async () => {
    await renderWithMovers({ asOf: "2026-10-08", movers: MOVERS });

    fireEvent.click(nextButton());
    fireEvent.click(nextButton());

    expect(authenticatedClient).toHaveBeenCalledTimes(1);
  });

  test("disables the next arrow on the last page", async () => {
    await renderWithMovers({ asOf: "2026-10-08", movers: MOVERS });

    fireEvent.click(nextButton());
    fireEvent.click(nextButton());

    expect(renderedSymbols()).toEqual(["GOOGL", "V", "UNH", "TSLA"]);
    expect(nextButton()).toBeDisabled();
  });

  test("the previous arrow walks back a page", async () => {
    await renderWithMovers({ asOf: "2026-10-08", movers: MOVERS });

    fireEvent.click(nextButton());
    fireEvent.click(prevButton());

    expect(renderedSymbols()).toEqual(["JNJ", "AMZN", "AAPL", "WMT"]);
    expect(prevButton()).toBeDisabled();
  });

  test("a page size of 4 holds on a short list without paging", async () => {
    await renderWithMovers({ asOf: "2026-10-08", movers: MOVERS.slice(0, 3) });

    expect(renderedSymbols()).toEqual(["JNJ", "AMZN", "AAPL"]);
    expect(prevButton()).toBeDisabled();
    expect(nextButton()).toBeDisabled();
  });

  test("changing the page size clamps the page instead of showing nothing", async () => {
    await renderWithMovers({ asOf: "2026-10-08", movers: MOVERS });

    // On page 3 of 3 at 4-per-page, then the viewport narrows to 1-per-page --
    // 12 pages, and page 3 is now in range, so it must not blank the grid.
    fireEvent.click(nextButton());
    fireEvent.click(nextButton());

    resizeTo(500);

    expect(renderedSymbols()).toHaveLength(1);
    expect(screen.getByText("GOOGL")).toBeInTheDocument();
  });

  // --- card content ---------------------------------------------------------

  test("renders one sparkline per card on the page", async () => {
    const { container } = await renderWithMovers({ asOf: "2026-10-08", movers: MOVERS });

    const sparklines = container.querySelectorAll("polyline");
    expect(sparklines).toHaveLength(PAGE_SIZE);
    expect(sparklines[0].getAttribute("points").split(" ")).toHaveLength(
      MOVERS[0].spark.length
    );
  });

  test("formats the price and change from the payload, not from literals", async () => {
    await renderWithMovers({ asOf: "2026-10-08", movers: MOVERS });

    expect(screen.getByText("JNJ")).toBeInTheDocument();
    expect(screen.getByText("+1.44%")).toBeInTheDocument();
  });

  test("rounds the price to cents rather than leaking float precision", async () => {
    // Live prices arrive with full precision ("339.17999"). The mock fixtures
    // are all clean 2-decimal values, so only this case catches it.
    await renderWithMovers({
      asOf: "2026-10-08",
      movers: [{ ...MOVERS[0], price: 339.17999 }],
    });

    expect(screen.getByText("$339.18")).toBeInTheDocument();
    expect(screen.queryByText("$339.17999")).not.toBeInTheDocument();
  });

  test("a failed request shows an error instead of redirecting to /login", async () => {
    authenticatedClient.mockResolvedValue(
      response({ error: "rate limit issue" }, { ok: false, status: 503 })
    );

    renderPage();

    expect(await screen.findByRole("alert")).toBeInTheDocument();
    // A landing page must never yank an anonymous visitor into the paywall.
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test("an empty movers list hides the section rather than showing an empty grid", async () => {
    await renderWithMovers({ asOf: "2026-10-08", movers: [] });

    expect(screen.queryByRole("heading", { name: "Today's movers" })).not.toBeInTheDocument();
  });
});
