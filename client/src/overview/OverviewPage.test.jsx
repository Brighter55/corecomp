import OverviewPage from "./OverviewPage.tsx";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

const { mockAuthenticatedClientWithRetry } = vi.hoisted(() => ({
  mockAuthenticatedClientWithRetry: vi.fn(),
}));

vi.mock("../helpers/api.js", async () => {
  const actual = await vi.importActual("../helpers/api.js");
  return {
    ...actual,
    authenticatedClientWithRetry: mockAuthenticatedClientWithRetry,
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
    mockAuthenticatedClientWithRetry.mockResolvedValue({
      status: 200,
      json: async () => ({ annualReports: [], quarterlyReports: [] }),
    });
  });

  test("loads up properly", () => {
    render(
      <MemoryRouter>
        <OverviewPage />
      </MemoryRouter>
    );

    expect(screen.getByText("CoreComp")).toBeInTheDocument();
    expect(screen.getByText("Market Intelligence")).toBeInTheDocument();
    expect(screen.getByText("Trending Stocks")).toBeInTheDocument();
  });

  test("handles search submit, renders sentiment module, and issues section fetches", async () => {
    render(
      <MemoryRouter>
        <OverviewPage />
      </MemoryRouter>
    );

    fireEvent.keyDown(screen.getByTestId("symbol-search"), { key: "Enter" });

    await waitFor(() => {
      expect(screen.getByText("Market Fear Index")).toBeInTheDocument();
    });

    expect(screen.getByText("Queued for Tune Pass")).toBeInTheDocument();
    expect(screen.getByText("Company Snapshot")).toBeInTheDocument();
    expect(screen.getByText("Data Health")).toBeInTheDocument();

    await waitFor(() => {
      expect(mockAuthenticatedClientWithRetry).toHaveBeenCalledTimes(13);
    });

    const calledEndpoints = mockAuthenticatedClientWithRetry.mock.calls.map((call) => call[0]);
    expect(calledEndpoints).toEqual(
      expect.arrayContaining([
        "/pages/pricing",
        "/pages/dividends",
        "/pages/earnings",
        "/pages/income-statement",
        "/pages/cash-flow",
        "/pages/balance-sheet",
        "/pages/composite",
      ])
    );
  });
});