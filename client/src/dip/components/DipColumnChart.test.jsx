import { render } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import DipColumnChart from "./DipColumnChart.jsx";
import { buildDipRows } from "../dipChartHelpers.js";
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

// Fills are computed per row, so they come back as literal hexes.
const redder = (hex) => parseInt(hex.slice(1, 3), 16) > parseInt(hex.slice(3, 5), 16);

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

  // The regression this replaced: a fixed five-step ramp put neighbouring columns
  // in the same band, so the best performer and the next one down rendered as a
  // single colour and the chart read as flat.
  test("gives every distinct variance its own colour", () => {
    const { container } = renderChart();

    // 13 columns, but two pairs share a variance (-11 twice, 0 twice).
    expect(new Set(fills(container)).size).toBe(11);
  });

  test("never repeats a colour between columns that differ", () => {
    const { container } = renderChart();
    const rows = buildDipRows(sampleData.variance["200"]);
    const colours = fills(container);

    rows.forEach((row, index) => {
      const neighbour = rows[index + 1];

      if (neighbour && neighbour.variance !== row.variance) {
        expect(colours[index]).not.toBe(colours[index + 1]);
      }
    });
  });

  test("runs red at the deepest dip and green at the best performer", () => {
    const { container } = renderChart();
    const colours = fills(container);

    expect(redder(colours[0])).toBe(true); // TROW -27
    expect(redder(colours[colours.length - 1])).toBe(false); // AAPL +12
  });

  test("re-colours the 50-day series without collapsing neighbours", () => {
    const { container } = renderChart("50");

    // All 13 values differ in this window, so no colour may repeat.
    expect(new Set(fills(container)).size).toBe(13);
  });
});
