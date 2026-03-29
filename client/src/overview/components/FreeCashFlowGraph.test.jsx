import FreeCashflowGraph from "./FreeCashflowGraph.jsx";
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

describe("FreeCashflowGraph", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("loads with statement prop", async () => {
    const statement = { annualReports: [{ fiscalDateEnding: "2024-01-01", freeCashFlow: "1200" }], quarterlyReports: [] };
    mockFilterReports.mockReturnValue([{ fiscalDateEnding: "2024-01-01", freeCashFlow: "1200" }]);
    mockGetPercentChange.mockReturnValue(0);

    render(
      <MemoryRouter>
        <FreeCashflowGraph statement={statement} period="annually" />
      </MemoryRouter>
    );

    expect(await screen.findByText("Free Cash Flow")).toBeInTheDocument();
    expect(mockFilterReports).toHaveBeenCalledTimes(1);
  });

  test("updates when statement prop changes", async () => {
    const firstStatement = { annualReports: [{ fiscalDateEnding: "2024-01-01", freeCashFlow: "1200" }], quarterlyReports: [] };
    const secondStatement = { annualReports: [{ fiscalDateEnding: "2024-01-01", freeCashFlow: "2200" }], quarterlyReports: [] };

    mockFilterReports.mockReturnValue([{ fiscalDateEnding: "2024-01-01", freeCashFlow: "1200" }]);
    const { rerender } = render(
      <MemoryRouter>
        <FreeCashflowGraph statement={firstStatement} period="annually" />
      </MemoryRouter>
    );

    mockFilterReports.mockReturnValue([{ fiscalDateEnding: "2024-01-01", freeCashFlow: "2200" }]);
    rerender(
      <MemoryRouter>
        <FreeCashflowGraph statement={secondStatement} period="annually" />
      </MemoryRouter>
    );

    expect(await screen.findByText("Free Cash Flow")).toBeInTheDocument();
    expect(mockFilterReports).toHaveBeenCalledTimes(2);
  });

  test("renders NoDataGraph if statement is empty", async () => {
    render(
      <MemoryRouter>
        <FreeCashflowGraph statement={[]} period="annually" />
      </MemoryRouter>
    );

    expect(await screen.findByText(/No Data/i)).toBeInTheDocument();
  });
});