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
