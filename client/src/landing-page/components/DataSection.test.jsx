import DataSection from "./DataSection.tsx";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

const { mockNavigate } = vi.hoisted(() => ({
  mockNavigate: vi.fn(),
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Chart bodies don't need to render under jsdom; the tile headers (title, % change,
// time-range control) render outside ResponsiveContainer and stay assertable.
vi.mock("recharts", async () => {
  const actual = await vi.importActual("recharts");
  return { ...actual, ResponsiveContainer: () => <div /> };
});

vi.mock("../../shared/SymbolSearch.jsx", () => ({
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

describe("DataSection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders heading, all category tabs, and the income panel by default", () => {
    render(
      <MemoryRouter>
        <DataSection />
      </MemoryRouter>
    );

    expect(screen.getByText("Data you can trust")).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /Income Statements/i })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tab", { name: /Balance Sheets/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /Cash Flow Statements/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /Financial Metrics/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /Price Data/i })).toBeInTheDocument();
    expect(screen.getByText("Net Income Performance")).toBeInTheDocument();
  });

  test("renders a real sample chart instead of the placeholder", () => {
    render(
      <MemoryRouter>
        <DataSection />
      </MemoryRouter>
    );

    expect(screen.queryByText(/coming soon/i)).not.toBeInTheDocument();
    // Default income tab shows the product's net income chart (graph title inside the tile).
    expect(screen.getByRole("heading", { name: "Net Income" })).toBeInTheDocument();
    // Sample company chip comes from the inline data via the StockHeader provider.
    expect(screen.getByText("IBM")).toBeInTheDocument();
  });

  test("switches to the selected category when another tab is clicked", () => {
    render(
      <MemoryRouter>
        <DataSection />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole("tab", { name: /Balance Sheets/i }));

    expect(screen.getByRole("tab", { name: /Balance Sheets/i })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tab", { name: /Income Statements/i })).toHaveAttribute("aria-selected", "false");
    expect(screen.getByRole("heading", { name: /Balance Sheets/i })).toBeInTheDocument();
  });

  test("shows a chart appropriate to each category tab", () => {
    render(
      <MemoryRouter>
        <DataSection />
      </MemoryRouter>
    );

    const expectedTileHeading = {
      "Balance Sheets": "Total Assets",
      "Cash Flow Statements": "Cash Flow Trifecta",
      "Financial Metrics": "Profit Margin Percentage",
      "Price Data": "Adjusted Monthly Pricing",
    };

    for (const [tabName, graphTitle] of Object.entries(expectedTileHeading)) {
      fireEvent.click(screen.getByRole("tab", { name: new RegExp(tabName, "i") }));
      expect(screen.getByRole("heading", { name: graphTitle })).toBeInTheDocument();
    }
  });

  test("navigates to /overview/:symbol when a search is submitted", () => {
    render(
      <MemoryRouter>
        <DataSection />
      </MemoryRouter>
    );

    fireEvent.keyDown(screen.getByTestId("symbol-search"), { key: "Enter" });

    expect(mockNavigate).toHaveBeenCalledWith("/overview/AAPL");
  });
});
