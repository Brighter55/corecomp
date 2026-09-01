import MarketCapGraph from "./MarketCapGraph.jsx";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

const mockFilterReports = vi.fn();
const mockGetPercentChange = vi.fn();

vi.mock("recharts", async () => {
  const actual = await vi.importActual("recharts");
  return { ...actual, ResponsiveContainer: () => <div></div> };
});

vi.mock("../../helpers/GraphsHelper.js", async () => {
  const actual = await vi.importActual("../../helpers/GraphsHelper.js");
  return {
    ...actual,
    filterReports: () => mockFilterReports(),
    getPercentChange: () => mockGetPercentChange(),
  };
});

describe("MarketCapGraph", () => {
  beforeEach(() => vi.clearAllMocks());

  test("loads with statement prop", async () => {
    const statement = {
      annualReports: [{ fiscalDateEnding: "2024-01-01", marketCap: "3000000000" }],
      quarterlyReports: [],
    };
    mockFilterReports.mockReturnValue(statement.annualReports);
    mockGetPercentChange.mockReturnValue(0);

    render(<MemoryRouter><MarketCapGraph statement={statement} period="annually" /></MemoryRouter>);

    expect(await screen.findByText("Market Cap")).toBeInTheDocument();
  });

  test("updates when statement prop changes", async () => {
    const first = {
      annualReports: [{ fiscalDateEnding: "2024-01-01", marketCap: "3000000000" }],
      quarterlyReports: [],
    };
    const second = {
      annualReports: [{ fiscalDateEnding: "2024-01-01", marketCap: "3500000000" }],
      quarterlyReports: [],
    };

    mockFilterReports.mockReturnValue(first.annualReports);
    const { rerender } = render(<MemoryRouter><MarketCapGraph statement={first} period="annually" /></MemoryRouter>);

    mockFilterReports.mockReturnValue(second.annualReports);
    rerender(<MemoryRouter><MarketCapGraph statement={second} period="annually" /></MemoryRouter>);

    expect(await screen.findByText("Market Cap")).toBeInTheDocument();
    expect(mockFilterReports).toHaveBeenCalledTimes(2);
  });

  test("renders nothing when statement is empty", () => {
  const { container } = render(<MemoryRouter><MarketCapGraph statement={[]} period="annually" /></MemoryRouter>);
  expect(container).toBeEmptyDOMElement();
});
});
