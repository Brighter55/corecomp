import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, test, vi } from "vitest";

import PortfolioPage from "./PortfolioPage.jsx";
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

vi.mock("../headers/product-header/ProductHeader.jsx", () => ({
  default: () => <div data-testid="product-header" />,
}));

vi.mock("../helpers/api.js", () => ({
  authenticatedClient: vi.fn(),
}));

const LEDGER = [
  {
    id: 1,
    symbol: "AAPL",
    trade_date: "2024-01-02",
    kind: "BUY",
    amount: "1000.0000",
    shares: null,
    price: null,
  },
];

const ANALYSIS = {
  window: { start: "2024-01-02", end: "2025-01-02" },
  benchmark: "SPY",
  positions: [
    {
      symbol: "AAPL",
      units: 10,
      price: 120,
      market_value: 1200,
      cost_basis: 1000,
      return_pct: 20,
      period_returns: { all: 20, "1y": 20, "1d": 1 },
      first_date: "2024-01-02",
      shares_typed: null,
      split_factor: null,
    },
  ],
  summary: {
    value: 1200,
    invested: 1000,
    dividends: 0,
    profit: 200,
    return_pct: 20,
    benchmark_value: 1100,
    benchmark_profit: 100,
    benchmark_return_pct: 10,
  },
  series: {
    dates: ["2024-01-02", "2024-06-03", "2025-01-02"],
    value: [1000, 1100, 1200],
    invested: [1000, 1000, 1000],
    dividends: [0, 0, 0],
    benchmark_value: [1000, 1050, 1100],
    benchmark_dividends: [0, 0, 0],
  },
};

function respond(overrides = {}) {
  authenticatedClient.mockImplementation(({ endpoint }) => {
    if (endpoint === "/portfolio/transactions") {
      return Promise.resolve({
        ok: true,
        json: async () => overrides.ledger ?? LEDGER,
      });
    }
    if (endpoint.startsWith("/portfolio/analysis")) {
      return Promise.resolve({
        ok: true,
        json: async () => overrides.analysis ?? ANALYSIS,
      });
    }
    return Promise.resolve({ ok: true, json: async () => ({}) });
  });
}

describe("PortfolioPage", () => {
  beforeEach(() => {
    authenticatedClient.mockReset();
    respond();
  });

  test("renders the headline value and the four cards", async () => {
    render(<PortfolioPage />);

    expect(await screen.findByText("Core Portfolio")).toBeInTheDocument();
    expect(screen.getAllByText("$1,200.00").length).toBeGreaterThan(0);
    expect(await screen.findByText("Portfolio value")).toBeInTheDocument();
    expect(screen.getByText("Portfolio performance")).toBeInTheDocument();
    expect(screen.getByText("Dynamics of portfolio returns")).toBeInTheDocument();
    expect(screen.getByText("Holdings performance")).toBeInTheDocument();
    expect(screen.getByText("Transactions")).toBeInTheDocument();
  });

  test("shows the empty state when the ledger has no positions", async () => {
    respond({
      ledger: [],
      analysis: {
        ...ANALYSIS,
        positions: [],
        summary: { ...ANALYSIS.summary, value: 0, invested: 0, profit: 0 },
        series: {
          dates: [],
          value: [],
          invested: [],
          dividends: [],
          benchmark_value: [],
          benchmark_dividends: [],
        },
      },
    });

    render(<PortfolioPage />);

    expect(await screen.findByText("No holdings yet")).toBeInTheDocument();
  });

  test("opens the add transaction dialog", async () => {
    render(<PortfolioPage />);
    await screen.findByText("Core Portfolio");

    await userEvent.click(screen.getByRole("button", { name: "Add transaction" }));

    expect(
      await screen.findByRole("heading", { name: "Add a transaction" }),
    ).toBeInTheDocument();
  });

  test("opens the benchmark picker", async () => {
    render(<PortfolioPage />);
    await screen.findByText("Core Portfolio");

    await userEvent.click(screen.getAllByRole("button", { name: "Select" })[0]);

    expect(
      await screen.findByRole("heading", { name: "Choose a benchmark" }),
    ).toBeInTheDocument();
  });
});
