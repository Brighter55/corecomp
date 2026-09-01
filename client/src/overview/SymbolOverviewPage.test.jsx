import SymbolOverviewPage from "./SymbolOverviewPage.tsx";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { authenticatedClientWithRetry } from "../helpers/api.js";

vi.mock("recharts", async () => {
  const actual = await vi.importActual("recharts");
  return { ...actual, ResponsiveContainer: () => <div /> };
});

vi.mock("../helpers/api.js", async () => {
  const actual = await vi.importActual("../helpers/api.js");
  return {
    ...actual,
    authenticatedClientWithRetry: vi.fn(),
  };
});

vi.mock("../headers/product-header/ProductHeader.jsx", () => ({
  default: () => <div data-testid="product-header">Product Header</div>,
}));

const standardReport = {
  fiscalDateEnding: "2023-12-31",
  totalRevenue: "100",
  netIncome: "10",
  grossProfit: "50",
  costOfRevenue: "50",
  researchAndDevelopment: "5",
  ebitda: "15",
  operatingCashflow: "20",
  capitalExpenditures: "5",
  freeCashFlow: "15",
  cashflowFromInvestment: "-10",
  cashflowFromFinancing: "5",
  depreciationDepletionAndAmortization: "4",
  dividendPayoutCommonStock: "1",
  changeInInventory: "2",
  commonStockSharesOutstanding: "1000",
  totalAssets: "200",
  totalShareholderEquity: "120",
  totalLiabilities: "80",
  cashAndCashEquivalentsAtCarryingValue: "30",
  shortLongTermDebtTotal: "40",
  retainedEarnings: "90",
  commonStock: "30",
  currentRatio: "1.5",
  DebtEquityRatio: "0.8",
  profitMarginPercent: "0.1",
};

const compositeMetric = {
  ROEPercentage: "ROEPercentage",
  ROAPercentage: "ROAPercentage",
  PERatio: "PERatio",
  PBRatio: "PBRatio",
  PSRatio: "PSRatio",
  PFCFRatio: "PFCFRatio",
  MarketCap: "marketCap",
};

function mockApi(dividendsResponse) {
  authenticatedClientWithRetry.mockImplementation(async (endpoint, payload) => {
    if (endpoint === "/pages/dividends") return dividendsResponse;
    if (endpoint === "/pages/pricing") return { status: 200, json: async () => [{ date: "2024-01-01", adjustedClose: "190" }] };
    if (endpoint === "/pages/earnings") return { status: 200, json: async () => ({ annualEarnings: [{ fiscalDateEnding: "2023-12-31", reportedEPS: "5" }], quarterlyEarnings: [] }) };
    if (endpoint === "/pages/income-statement" || endpoint === "/pages/cash-flow" || endpoint === "/pages/balance-sheet") {
      return { status: 200, json: async () => ({ annualReports: [standardReport], quarterlyReports: [] }) };
    }
    if (endpoint === "/pages/composite") {
      const metric = compositeMetric[payload?.graph] ?? "marketCap";
      return { status: 200, json: async () => ({ annualReports: [{ fiscalDateEnding: "2023-12-31", [metric]: "10" }], quarterlyReports: [] }) };
    }
    if (endpoint === "/pages/current-price") return { status: 200, json: async () => ({ name: "Apple Inc.", price: "190" }) };
    if (endpoint === "/pages/info") return { status: 200, json: async () => ({ sector: "Technology", industry: "Consumer Electronics" }) };
    return { status: 200, json: async () => ({}) };
  });
}

function renderPage() {
  return render(
    <MemoryRouter initialEntries={["/overview/AAPL"]}>
      <Routes>
        <Route path="/overview/:symbol" element={<SymbolOverviewPage />} />
      </Routes>
    </MemoryRouter>
  );
}

describe("SymbolOverviewPage", () => {
  beforeEach(() => vi.clearAllMocks());

  test("hides the Dividends accordion when the dividends endpoint returns 204", async () => {
    mockApi({ status: 204 });

    renderPage();

    // The Dividends section renders (with a loading skeleton) at first, then is
    // removed once the 204 resolves — wait for it to disappear.
    await waitFor(() => expect(screen.queryByRole("button", { name: "Dividends" })).not.toBeInTheDocument());

    // A section with data is still rendered.
    expect(await screen.findByRole("button", { name: "Income Statement" })).toBeInTheDocument();
  }, 20000);

  test("shows the Dividends accordion with a graph when dividends returns data", async () => {
    mockApi({ status: 200, json: async () => ({ data: [{ ex_dividend_date: "2024-01-01", amount: "1.2" }] }) });

    renderPage();

    // The Dividends item is closed by default (only "income" is open), so its
    // graph only mounts after the trigger is clicked.
    fireEvent.click(await screen.findByRole("button", { name: "Dividends" }));

    // "Dividend Payouts" is the graph's card title — only rendered once the
    // statement resolves with usable data, so this confirms the section isn't hidden.
    expect(await screen.findByText("Dividend Payouts")).toBeInTheDocument();
  }, 20000);
});
