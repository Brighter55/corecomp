import { render } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import DipColumnChart from "./DipColumnChart.jsx";
import { BAR_COLORS, buildDipRows } from "../dipChartHelpers.js";
import sampleData from "../sample-data/dipSampleData.json";

// ResponsiveContainer measures its parent, which is 0x0 under jsdom, and mocking
// it to an empty div -- the pattern the overview graph tests use -- would hide
// every bar. Handing the chart explicit dimensions instead lets the real Recharts
// layout run, so columns, ticks and labels all actually render and can be asserted.
vi.mock("recharts", async () => {
  const actual = await vi.importActual("recharts");
  const React = await vi.importActual("react");
  return {
    ...actual,
    ResponsiveContainer: ({ children }) =>
      React.cloneElement(children, { width: 800, height: 400 }),
  };
});

function renderChart(window = "200") {
  return render(<DipColumnChart rows={buildDipRows(sampleData.variance[window])} />);
}

function texts(container, selector) {
  return Array.from(container.querySelectorAll(selector)).map((node) => node.textContent);
}

const columns = (container) => container.querySelectorAll(".recharts-rectangle");
const fills = (container) =>
  Array.from(columns(container)).map((node) => node.getAttribute("fill"));

describe("DipColumnChart", () => {
  test("draws one column per scanned symbol, including the flat ones", () => {
    const { container } = renderChart();

    expect(columns(container)).toHaveLength(13);
  });

  test("runs worst dip to best, left to right", () => {
    const { container } = renderChart();

    expect(
      texts(container, ".recharts-xAxis .recharts-cartesian-axis-tick-value"),
    ).toEqual([
      "TROW", "SBUX", "TGT", "DIS", "NKE", "VICI", "JPM",
      "TXRH", "MSFT", "HD", "SPG", "COST", "AAPL",
    ]);
  });

  test("labels every column with its variance, below dips and above the rest", () => {
    const { container } = renderChart();

    expect(texts(container, ".dip-column-label")).toEqual([
      "-27.00%", "-16.00%", "-11.00%", "-11.00%", "-10.00%", "-6.00%", "-3.00%",
      "-2.00%", "0.00%", "0.00%", "1.00%", "10.00%", "12.00%",
    ]);
  });

  // The axis is deliberately coarser than the columns: its ticks are fixed 5% steps,
  // so hundredths on the gridlines would be noise. This pins that split.
  test("keeps the fixed percentage axis whole, from +15% down to -30%", () => {
    const { container } = renderChart();

    expect(
      texts(container, ".recharts-yAxis .recharts-cartesian-axis-tick-value"),
    ).toEqual([
      "15%", "10%", "5%", "0%", "-5%",
      "-10%", "-15%", "-20%", "-25%", "-30%",
    ]);
  });

  test("bands the column colours by how deep the dip is", () => {
    const { container } = renderChart();

    // Only TROW (-27%) clears the deep-dip threshold in the 200-day series.
    const bands = fills(container);
    expect(bands.filter((fill) => fill === BAR_COLORS.deepDip)).toHaveLength(1);
    expect(bands.filter((fill) => fill === BAR_COLORS.dip)).toHaveLength(7);
    expect(bands.filter((fill) => fill === BAR_COLORS.neutral)).toHaveLength(5);
  });

  test("rebands when the 50-day series is plotted", () => {
    const { container } = renderChart("50");

    const bands = fills(container);
    expect(bands.filter((fill) => fill === BAR_COLORS.deepDip)).toHaveLength(1);
    expect(bands.filter((fill) => fill === BAR_COLORS.dip)).toHaveLength(7);
    expect(bands.filter((fill) => fill === BAR_COLORS.neutral)).toHaveLength(5);
  });
});
