import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, test, vi } from "vitest";

import PortfolioPage from "./PortfolioPage.jsx";
import { authenticatedClient, authenticatedClientUpload } from "../helpers/api.js";

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
  authenticatedClientUpload: vi.fn(),
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
    if (endpoint === "/portfolio/splits") {
      return Promise.resolve({
        ok: true,
        json: async () => overrides.splits ?? [],
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

const PREVIEW = {
  rows: [{}, {}, {}],
  counts: { BUY: 2, SELL: 1, DIVIDEND: 0, DTAX: 0, REC: 0, SPL: 1 },
  skipped: 4,
  unresolved_splits: [{ symbol: "OLD", trade_date: "2023-01-05", shares: 5 }],
  positions: { ACME: 13.75, SPLT: 20 },
};

describe("PortfolioPage", () => {
  beforeEach(() => {
    authenticatedClient.mockReset();
    authenticatedClientUpload.mockReset();
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

  test("derives the trade amount from shares times price", async () => {
    render(<PortfolioPage />);
    await screen.findByText("Core Portfolio");

    await userEvent.click(screen.getByRole("button", { name: "Add transaction" }));
    const dialog = screen
      .getByRole("heading", { name: "Add a transaction" })
      .closest("dialog");

    await userEvent.type(within(dialog).getByLabelText("Symbol"), "aapl");
    await userEvent.type(within(dialog).getByLabelText("Shares"), "10");
    await userEvent.type(within(dialog).getByLabelText("Price"), "121.50");

    expect(within(dialog).getByLabelText(/derived/i)).toHaveValue("1215.00");

    await userEvent.click(within(dialog).getByRole("button", { name: "Save" }));

    await waitFor(() =>
      expect(
        authenticatedClient.mock.calls.some(
          ([call]) => call.endpoint === "/portfolio/transactions" && call.payload,
        ),
      ).toBe(true),
    );
    const [{ payload }] = authenticatedClient.mock.calls.find(
      ([call]) => call.endpoint === "/portfolio/transactions" && call.payload,
    );
    expect(payload).toMatchObject({
      symbol: "AAPL",
      kind: "BUY",
      amount: "1215.00",
      shares: "10",
      price: "121.5",
    });
  });

  test("the split dialog posts the new-to-old ratio", async () => {
    render(<PortfolioPage />);
    await screen.findByText("Core Portfolio");

    await userEvent.click(screen.getByRole("button", { name: "Add split" }));
    const dialog = screen
      .getByRole("heading", { name: "Add a split" })
      .closest("dialog");

    await userEvent.type(within(dialog).getByLabelText("Symbol"), "aapl");
    await userEvent.type(within(dialog).getByLabelText("New shares"), "10");
    await userEvent.type(within(dialog).getByLabelText("Old shares"), "1");
    await userEvent.click(within(dialog).getByRole("button", { name: "Save split" }));

    await waitFor(() =>
      expect(
        authenticatedClient.mock.calls.some(
          ([call]) => call.endpoint === "/portfolio/splits" && call.payload,
        ),
      ).toBe(true),
    );
    const [{ payload }] = authenticatedClient.mock.calls.find(
      ([call]) => call.endpoint === "/portfolio/splits" && call.payload,
    );
    expect(payload).toEqual({
      symbol: "AAPL",
      effective_date: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
      numerator: 10,
      denominator: 1,
    });
  });

  test("import previews with a dry run and then confirms with a real one", async () => {
    authenticatedClientUpload
      .mockResolvedValueOnce({ ok: true, status: 200, json: async () => PREVIEW })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ ...PREVIEW, imported: 3 }),
      });

    render(<PortfolioPage />);
    await screen.findByText("Core Portfolio");

    await userEvent.click(screen.getByRole("button", { name: "Import" }));
    const dialog = screen
      .getByRole("heading", { name: "Import activity" })
      .closest("dialog");
    const file = new File(["Activity Date,Instrument"], "activity.csv", {
      type: "text/csv",
    });

    await userEvent.upload(within(dialog).getByLabelText("Activity CSV"), file);

    expect(await within(dialog).findByText("3 ledger rows.")).toBeInTheDocument();
    expect(within(dialog).getByText("BUY 2 · SELL 1 · SPL 1")).toBeInTheDocument();
    expect(within(dialog).getByText("4 skipped.")).toBeInTheDocument();
    expect(within(dialog).getByText("OLD on 2023-01-05")).toBeInTheDocument();
    expect(within(dialog).getByText("ACME 13.75 units")).toBeInTheDocument();

    await userEvent.click(
      within(dialog).getByRole("button", { name: "Confirm import" }),
    );

    await waitFor(() => expect(authenticatedClientUpload).toHaveBeenCalledTimes(2));
    const [previewCall, importCall] = authenticatedClientUpload.mock.calls.map(
      ([call]) => call,
    );
    expect(previewCall.endpoint).toBe("/portfolio/import");
    expect(previewCall.formData.get("dry_run")).toBe("true");
    expect(previewCall.formData.get("file")).toBe(file);
    expect(importCall.formData.get("file")).toBe(file);
    expect(importCall.formData.get("dry_run")).toBe("false");
  });

  test("lists a split beside the ledger and removes it", async () => {
    respond({
      splits: [
        {
          id: 7,
          symbol: "SPLT",
          effective_date: "2024-01-20",
          numerator: 10,
          denominator: 1,
        },
      ],
    });

    render(<PortfolioPage />);

    const ratio = await screen.findByText("10:1");
    const row = ratio.closest("tr");
    expect(within(row).getByText("SPLIT")).toBeInTheDocument();
    expect(within(row).getByText("SPLT")).toBeInTheDocument();

    await userEvent.click(within(row).getByRole("button", { name: "Remove" }));

    await waitFor(() =>
      expect(authenticatedClient).toHaveBeenCalledWith({
        endpoint: "/portfolio/splits/delete",
        payload: { id: 7 },
      }),
    );
  });
});
