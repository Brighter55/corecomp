import OverviewPage from "./OverviewPage.jsx";
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

vi.mock("./index.js", () => ({
  Hero: () => <div data-testid="hero">Hero</div>,
  Info: () => <div data-testid="info">Info</div>,
  TotalRevenueGraph: () => <div>TotalRevenueGraph</div>,
  NetIncomeGraph: () => <div>NetIncomeGraph</div>,
  OperatingCashflowGraph: () => <div>OperatingCashflowGraph</div>,
  CapitalExpendituresGraph: () => <div>CapitalExpendituresGraph</div>,
  FreeCashflowGraph: () => <div>FreeCashflowGraph</div>,
  DividendsPayoutGraph: () => <div>DividendsPayoutGraph</div>,
  CashVsDebtGraph: () => <div>CashVsDebtGraph</div>,
  SharesOutstandingGraph: () => <div>SharesOutstandingGraph</div>,
  EPSGraph: () => <div>EPSGraph</div>,
  PricingGraph: () => <div>PricingGraph</div>,
  ProfitMarginGraph: () => <div>ProfitMarginGraph</div>,
  ROEGraph: () => <div>ROEGraph</div>,
  PERatioGraph: () => <div>PERatioGraph</div>,
  EbitGraph: () => <div>EBIT</div>,
  EbitdaGraph: () => <div>EBITDA</div>,
  PBRatioGraph: () => <div>PBRatioGraph</div>,
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

    expect(screen.getByText("Enter stock symbol and get started now!")).toBeInTheDocument();
  });

  test("handles search submit, renders statement sections, and issues section fetches", async () => {
    render(
      <MemoryRouter>
        <OverviewPage />
      </MemoryRouter>
    );

    fireEvent.keyDown(screen.getByTestId("symbol-search"), { key: "Enter" });

    await waitFor(() => {
      expect(screen.getByTestId("hero")).toBeInTheDocument();
    });

    expect(screen.getByTestId("info")).toBeInTheDocument();
    expect(screen.getByText("Pricing Statement")).toBeInTheDocument();
    expect(screen.getByText("Dividend Statement")).toBeInTheDocument();
    expect(screen.getByText("Earnings Statement")).toBeInTheDocument();
    expect(screen.getByText("Income Statement")).toBeInTheDocument();
    expect(screen.getByText("Cash Flow Statement")).toBeInTheDocument();
    expect(screen.getByText("Balance Sheet Statement")).toBeInTheDocument();
    expect(screen.getByText("Ratios Statement")).toBeInTheDocument();

    await waitFor(() => {
      expect(mockAuthenticatedClientWithRetry).toHaveBeenCalledTimes(9);
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