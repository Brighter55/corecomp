import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import DipPage from "./DipPage.jsx";

vi.mock("recharts", async () => {
  const actual = await vi.importActual("recharts");
  const React = await vi.importActual("react");
  return {
    ...actual,
    ResponsiveContainer: ({ children }) =>
      React.cloneElement(children, { width: 800, height: 400 }),
  };
});

// The real header pulls in auth, theme and the market search; none of that is
// what this page is being tested for.
vi.mock("../headers/product-header/ProductHeader.jsx", () => ({
  default: () => <div data-testid="product-header" />,
}));

function renderPage() {
  return render(
    <MemoryRouter>
      <DipPage />
    </MemoryRouter>,
  );
}

function searchFor(value) {
  const input = screen.getByLabelText("Search ticker");
  fireEvent.change(input, { target: { value } });
  return input;
}

describe("DipPage", () => {
  test("renders the page heading and the header", () => {
    renderPage();

    expect(screen.getByRole("heading", { level: 1, name: "Dip Finder" })).toBeInTheDocument();
    expect(screen.getByTestId("product-header")).toBeInTheDocument();
  });

  test("seeds the watchlist from the design", () => {
    renderPage();

    expect(screen.getByText("Apple Inc")).toBeInTheDocument();
    expect(screen.getByText("Microsoft Corp")).toBeInTheDocument();
    expect(screen.getByText("Costco Wholesale Corp")).toBeInTheDocument();
    expect(screen.getByText("VICI Properties Inc")).toBeInTheDocument();
    expect(screen.getByText("Starbucks Corp")).toBeInTheDocument();
    expect(screen.getByText("Walt Disney Co")).toBeInTheDocument();
  });

  test("opens on the 200-day window", () => {
    renderPage();

    expect(screen.getByRole("heading", { name: "Price vs 200d SMA" })).toBeInTheDocument();
    expect(screen.getByText("Variance from 200-day simple moving average")).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "200 DAY SMA" })).toHaveAttribute("aria-checked", "true");
  });

  test("offers exactly two SMA windows, with no 100-day option", () => {
    renderPage();

    expect(screen.getAllByRole("radio")).toHaveLength(2);
    expect(screen.queryByText("100 DAY SMA")).not.toBeInTheDocument();
  });

  test("switching to the 50-day window re-titles the card", () => {
    renderPage();

    fireEvent.click(screen.getByRole("radio", { name: "50 DAY SMA" }));

    expect(screen.getByRole("heading", { name: "Price vs 50d SMA" })).toBeInTheDocument();
    expect(screen.getByText("Variance from 50-day simple moving average")).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "50 DAY SMA" })).toHaveAttribute("aria-checked", "true");
  });

  test("removing a watchlist entry drops it from the sidebar", () => {
    renderPage();

    fireEvent.click(screen.getByLabelText("Remove AAPL from watchlist"));

    expect(screen.queryByText("Apple Inc")).not.toBeInTheDocument();
    expect(screen.getByText("Microsoft Corp")).toBeInTheDocument();
  });

  test("adding a symbol that is not yet watched appends it", () => {
    renderPage();

    searchFor("TROW");
    fireEvent.keyDown(screen.getByLabelText("Search ticker"), { key: "Enter" });

    expect(screen.getByText("T. Rowe Price Group Inc")).toBeInTheDocument();
  });

  test("adding a duplicate is refused with a notice", () => {
    renderPage();

    searchFor("AAPL");
    fireEvent.keyDown(screen.getByLabelText("Search ticker"), { key: "Enter" });

    expect(screen.getByRole("status")).toHaveTextContent("AAPL is already in your watchlist");
    expect(screen.getAllByText("Apple Inc")).toHaveLength(1);
  });

  test("a ticker with no sample data is refused with a notice", () => {
    renderPage();

    searchFor("ZZZZ");
    fireEvent.keyDown(screen.getByLabelText("Search ticker"), { key: "Enter" });

    expect(screen.getByRole("status")).toHaveTextContent('No sample data for "ZZZZ"');
  });

  test("clicking the chart expands it to fullscreen, and it closes again", () => {
    renderPage();

    expect(screen.queryByLabelText("Close graph")).not.toBeInTheDocument();

    // No dedicated expand control: the chart body carries the click, matching
    // every other graph in the app.
    fireEvent.click(screen.getByTestId("dip-chart-body"));

    fireEvent.click(screen.getByLabelText("Close graph"));

    expect(screen.queryByLabelText("Close graph")).not.toBeInTheDocument();
  });
});
