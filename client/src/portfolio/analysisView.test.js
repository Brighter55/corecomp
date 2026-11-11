import { describe, expect, it } from "vitest";

import {
  barScale,
  buildCashflows,
  formatPctLabel,
  holdingsFor,
  incomeMetrics,
  irr,
  monthlyReturns,
  profitOf,
  rangeStart,
  slicePoints,
  toPoints,
} from "./analysisView.js";

const SERIES = {
  dates: ["2024-01-02", "2024-06-03", "2024-12-31", "2025-06-02"],
  value: [1000, 1200, 1300, 1500],
  invested: [1000, 1000, 1000, 1100],
  dividends: [0, 10, 25, 40],
  benchmark_value: [1000, 1100, 1250, 1400],
  benchmark_dividends: [0, 5, 12, 20],
};

describe("formatting", () => {
  it("formats percentages with a sign and a compact label", () => {
    expect(formatPctLabel(254.2)).toBe("+254.2%");
    expect(formatPctLabel(-7.3)).toBe("-7.3%");
    expect(formatPctLabel(0.834)).toBe("+0.83%");
  });
});

describe("series transforms", () => {
  it("maps the API series to points", () => {
    const points = toPoints(SERIES);
    expect(points).toHaveLength(4);
    expect(points[1]).toEqual({
      date: "2024-06-03",
      value: 1200,
      invested: 1000,
      dividends: 10,
      benchmarkValue: 1100,
      benchmarkDividends: 5,
    });
  });

  it("computes profit as value plus dividends minus invested", () => {
    expect(profitOf(toPoints(SERIES)[1])).toBe(210);
  });

  it("slices by range relative to the last date", () => {
    const points = toPoints(SERIES);
    expect(rangeStart("all", points)).toBe("2024-01-02");
    expect(rangeStart("ytd", points)).toBe("2025-01-01");
    expect(rangeStart("1y", points)).toBe("2024-06-02");
    expect(slicePoints(points, "1y").map((point) => point.date)).toEqual([
      "2024-06-03",
      "2024-12-31",
      "2025-06-02",
    ]);
  });

  it("honours a custom window", () => {
    const points = toPoints(SERIES);
    const sliced = slicePoints(points, "custom", {
      from: "2024-03-01",
      to: "2024-12-31",
    });
    expect(sliced.map((point) => point.date)).toEqual([
      "2024-06-03",
      "2024-12-31",
    ]);
  });

  it("builds monthly returns against the previous month end", () => {
    const months = monthlyReturns(toPoints(SERIES), "all");
    expect(months.map((month) => month.key)).toEqual([
      "2024-01",
      "2024-06",
      "2024-12",
      "2025-06",
    ]);
    // June 2024: (1200 + 10) / 1000 - 1
    expect(months[1].pct).toBeCloseTo(21.0, 6);
    // December 2024: (1300 + 15) / 1200 - 1
    expect(months[2].pct).toBeCloseTo(9.5833, 3);
  });

  it("computes trailing income and its growth", () => {
    const metrics = incomeMetrics(toPoints(SERIES));
    expect(metrics.annual).toBe(40);
    expect(metrics.yieldPct).toBeCloseTo((40 / 1500) * 100, 6);
  });
});

describe("cash flows", () => {
  const ledger = [
    { kind: "BUY", trade_date: "2024-01-02", amount: "1000" },
    { kind: "SELL", trade_date: "2024-06-03", amount: "200" },
    { kind: "DIVIDEND", trade_date: "2024-07-01", amount: "50" },
  ];

  it("turns buys into outflows and sells into inflows", () => {
    expect(buildCashflows(ledger, 900, "2025-01-02")).toEqual([
      { date: "2024-01-02", amount: -1000 },
      { date: "2024-06-03", amount: 200 },
      { date: "2025-01-02", amount: 900 },
    ]);
  });

  it("finds a rate that zeroes the net present value", () => {
    const flows = [
      { date: "2021-01-01", amount: -1000 },
      { date: "2022-01-01", amount: 1100 },
    ];
    expect(irr(flows)).toBeCloseTo(10, 2);
  });

  it("returns null when there is no sign change", () => {
    expect(irr([{ date: "2020-01-01", amount: -1000 }])).toBeNull();
    expect(
      irr([
        { date: "2020-01-01", amount: -1000 },
        { date: "2021-01-01", amount: -10 },
      ]),
    ).toBeNull();
  });
});

describe("holdings", () => {
  const positions = [
    { symbol: "AAPL", market_value: 600, return_pct: 10, period_returns: { "1d": 1, all: 10 } },
    { symbol: "SPGI", market_value: 400, return_pct: -5, period_returns: { "1d": -2, all: -5 } },
  ];

  it("sorts by the selected period and falls back to lifetime", () => {
    expect(holdingsFor(positions, "1d").map((row) => row.symbol)).toEqual(["AAPL", "SPGI"]);
    expect(holdingsFor(positions, "5y").map((row) => row.ret)).toEqual([10, -5]);
  });

  it("adds portfolio weight", () => {
    expect(holdingsFor(positions, "all").map((row) => row.weight)).toEqual([60, 40]);
  });

  it("scales bars to a round axis", () => {
    expect(barScale([254, -19]).max).toBe(300);
    expect(barScale([254, -19]).ticks).toEqual([0, 50, 100, 150, 200, 250, 300]);
    expect(barScale([2.2, -19]).max).toBe(20);
  });
});
