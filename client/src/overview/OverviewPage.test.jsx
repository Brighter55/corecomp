import OverviewPage from "./OverviewPage.tsx";
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

vi.mock("../headers/product-header/ProductHeader.jsx", () => ({
  default: () => <div data-testid="product-header">Product Header</div>,
}));

vi.mock("../shared/SymbolSearch.jsx", () => ({
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

    expect(screen.getByText("CoreComp")).toBeInTheDocument();
    expect(screen.getByText("Market Intelligence")).toBeInTheDocument();
    expect(screen.getByText("Trending Stocks")).toBeInTheDocument();
  });

  test("handles search submit by navigating to the symbol overview", () => {
    render(
      <MemoryRouter>
        <OverviewPage />
      </MemoryRouter>
    );

    fireEvent.keyDown(screen.getByTestId("symbol-search"), { key: "Enter" });

    expect(mockNavigate).toHaveBeenCalledWith("/overview/AAPL");
  });
});
