import OverviewPage from "./OverviewPage.tsx";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

// NVDA / AAPL / TSLA / MSFT — the placeholder rows in OverviewPage.
const trendRowCount = 4;

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

describe("OverviewPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("loads up properly", () => {
    render(
      <MemoryRouter>
        <OverviewPage />
      </MemoryRouter>
    );

    expect(screen.getByText("CoreComp")).toBeInTheDocument();
    // Renamed from "Market Intelligence" to match the reference design.
    expect(screen.getByRole("heading", { name: "Market News" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Trending Stocks" })).toBeInTheDocument();
  });

  test("handles search submit by navigating to the symbol overview", () => {
    render(
      <MemoryRouter>
        <OverviewPage />
      </MemoryRouter>
    );

    fireEvent.keyDown(screen.getByTestId("symbol-search"), { key: "Enter" });

    expect(mockNavigate).toHaveBeenCalledWith("/overview/AAPL");
  });

  test("market news header exposes category filters with All selected", () => {
    render(
      <MemoryRouter>
        <OverviewPage />
      </MemoryRouter>
    );

    expect(screen.getByRole("button", { name: "All" })).toHaveAttribute("aria-pressed", "true");
    for (const label of ["Macro", "Commodities", "Technology"]) {
      expect(screen.getByRole("button", { name: label })).toHaveAttribute("aria-pressed", "false");
    }
  });

  test("market news header links out to the full news list", () => {
    render(
      <MemoryRouter>
        <OverviewPage />
      </MemoryRouter>
    );

    expect(screen.getByRole("link", { name: /view all news/i })).toBeInTheDocument();
  });

  test("trending stocks header exposes carousel controls", () => {
    render(
      <MemoryRouter>
        <OverviewPage />
      </MemoryRouter>
    );

    expect(screen.getByRole("button", { name: "Previous trending stocks" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Next trending stocks" })).toBeInTheDocument();
  });

  test("each trending card renders a sparkline", () => {
    const { container } = render(
      <MemoryRouter>
        <OverviewPage />
      </MemoryRouter>
    );

    // lucide icons render as <path>; the sparkline is the only <polyline> here.
    expect(container.querySelectorAll("polyline")).toHaveLength(trendRowCount);
  });

  test("each trending card shows its volume and market cap", () => {
    render(
      <MemoryRouter>
        <OverviewPage />
      </MemoryRouter>
    );

    expect(screen.getByText("Vol: 48.2M • Cap: $3.16T")).toBeInTheDocument();
    expect(screen.getByText("Vol: 79.1M • Cap: $785.4B")).toBeInTheDocument();
  });
});
