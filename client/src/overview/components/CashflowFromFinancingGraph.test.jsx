import CashflowFromFinancingGraph from "./CashflowFromFinancingGraph.jsx";
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

describe("CashflowFromFinancingGraph", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("loads with statement prop", async () => {
    const statement = {
      annualReports: [{ fiscalDateEnding: "2024-01-01", cashflowFromFinancing: "200" }],
      quarterlyReports: [],
    };
    mockFilterReports.mockReturnValue(statement.annualReports);
    mockGetPercentChange.mockReturnValue(0);

    render(
      <MemoryRouter>
        <CashflowFromFinancingGraph statement={statement} period="annually" />
      </MemoryRouter>
    );

    expect(await screen.findByText("Cashflow from Financing")).toBeInTheDocument();
    expect(mockFilterReports).toHaveBeenCalledTimes(1);
  });

  test("updates when statement prop changes", async () => {
    const firstStatement = {
      annualReports: [{ fiscalDateEnding: "2024-01-01", cashflowFromFinancing: "200" }],
      quarterlyReports: [],
    };
    const secondStatement = {
      annualReports: [{ fiscalDateEnding: "2024-01-01", cashflowFromFinancing: "100" }],
      quarterlyReports: [],
    };

    mockFilterReports.mockReturnValue(firstStatement.annualReports);
    const { rerender } = render(
      <MemoryRouter>
        <CashflowFromFinancingGraph statement={firstStatement} period="annually" />
      </MemoryRouter>
    );

    mockFilterReports.mockReturnValue(secondStatement.annualReports);
    rerender(
      <MemoryRouter>
        <CashflowFromFinancingGraph statement={secondStatement} period="annually" />
      </MemoryRouter>
    );

    expect(await screen.findByText("Cashflow from Financing")).toBeInTheDocument();
    expect(mockFilterReports).toHaveBeenCalledTimes(2);
  });

  test("renders NoDataGraph if statement is empty", async () => {
    render(
      <MemoryRouter>
        <CashflowFromFinancingGraph statement={[]} period="annually" />
      </MemoryRouter>
    );

    expect(await screen.findByText(/No Data/i)).toBeInTheDocument();
  });
});
