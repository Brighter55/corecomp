import NetIncomeFromContinuingOperationsGraph from "./NetIncomeFromContinuingOperationsGraph.jsx";
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
  return { ...actual, filterReports: () => mockFilterReports(), getPercentChange: () => mockGetPercentChange() };
});

describe("NetIncomeFromContinuingOperationsGraph", () => {
  beforeEach(() => vi.clearAllMocks());

  test("loads with statement prop", async () => {
    const statement = { annualReports: [{ fiscalDateEnding: "2024-01-01", netIncomeFromContinuingOperations: "1000" }], quarterlyReports: [] };
    mockFilterReports.mockReturnValue(statement.annualReports);
    mockGetPercentChange.mockReturnValue(0);

    render(<MemoryRouter><NetIncomeFromContinuingOperationsGraph statement={statement} period="annually" /></MemoryRouter>);

    expect(await screen.findByText("Net Income From Continuing Operations")).toBeInTheDocument();
  });

  test("updates when statement prop changes", async () => {
    const first = { annualReports: [{ fiscalDateEnding: "2024-01-01", netIncomeFromContinuingOperations: "1000" }], quarterlyReports: [] };
    const second = { annualReports: [{ fiscalDateEnding: "2024-01-01", netIncomeFromContinuingOperations: "2000" }], quarterlyReports: [] };

    mockFilterReports.mockReturnValue(first.annualReports);
    const { rerender } = render(<MemoryRouter><NetIncomeFromContinuingOperationsGraph statement={first} period="annually" /></MemoryRouter>);

    mockFilterReports.mockReturnValue(second.annualReports);
    rerender(<MemoryRouter><NetIncomeFromContinuingOperationsGraph statement={second} period="annually" /></MemoryRouter>);

    expect(await screen.findByText("Net Income From Continuing Operations")).toBeInTheDocument();
    expect(mockFilterReports).toHaveBeenCalledTimes(2);
  });

  test("renders NoDataGraph if statement is empty", async () => {
    render(<MemoryRouter><NetIncomeFromContinuingOperationsGraph statement={[]} period="annually" /></MemoryRouter>);
    expect(await screen.findByText(/No Data/i)).toBeInTheDocument();
  });
});