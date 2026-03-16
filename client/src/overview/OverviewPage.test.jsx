import OverviewPage from "./OverviewPage.jsx"
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from "react-router-dom";

const mockFetch = vi.fn();
global.fetch = mockFetch;

vi.mock("../headers/product-header/ProductHeader.jsx", () => ({
  default: () => <div data-testid="product-header">Product Header</div>
}));

vi.mock("../shared/SymbolSearch.jsx", () => ({
  default: ({ handleSearchSubmit }) => (
    <input 
      data-testid="symbol-search"
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          handleSearchSubmit(e, 'AAPL');
        }
      }}
    />
  )
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

        expect(screen.getByText("Enter stock symbol and get started now!")).toBeInTheDocument();
    });

    test("handles search submit and displays graphs", async () => {
        render(
            <MemoryRouter>
                <OverviewPage />
            </MemoryRouter>
        );

        const searchInput = screen.getByTestId("symbol-search");
        
        fireEvent.keyDown(searchInput, { key: 'Enter' });

        await waitFor(() => {
            expect(screen.getByTestId("hero")).toBeInTheDocument();
        });

        expect(screen.queryByText("Enter stock symbol and get started now!")).not.toBeInTheDocument();
        
        expect(screen.getByTestId("info")).toBeInTheDocument();
    });
});