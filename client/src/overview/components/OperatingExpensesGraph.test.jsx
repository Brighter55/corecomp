import OperatingExpensesGraph from "./OperatingExpensesGraph.jsx";
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

describe("OperatingExpensesGraph", () => {
  beforeEach(() => vi.clearAllMocks());

  test("loads with statement prop", async () => {
    const statement = { annualReports: [{ fiscalDateEnding: "2024-01-01", operatingExpenses: "1000" }], quarterlyReports: [] };
    mockFilterReports.mockReturnValue(statement.annualReports);
    mockGetPercentChange.mockReturnValue(0);

    render(<MemoryRouter><OperatingExpensesGraph statement={statement} period="annually" /></MemoryRouter>);

    expect(await screen.findByText("Operating Expenses")).toBeInTheDocument();
  });

  test("updates when statement prop changes", async () => {
    const first = { annualReports: [{ fiscalDateEnding: "2024-01-01", operatingExpenses: "1000" }], quarterlyReports: [] };
    const second = { annualReports: [{ fiscalDateEnding: "2024-01-01", operatingExpenses: "2000" }], quarterlyReports: [] };

    mockFilterReports.mockReturnValue(first.annualReports);
    const { rerender } = render(<MemoryRouter><OperatingExpensesGraph statement={first} period="annually" /></MemoryRouter>);

    mockFilterReports.mockReturnValue(second.annualReports);
    rerender(<MemoryRouter><OperatingExpensesGraph statement={second} period="annually" /></MemoryRouter>);

    expect(await screen.findByText("Operating Expenses")).toBeInTheDocument();
    expect(mockFilterReports).toHaveBeenCalledTimes(2);
  });

  test("renders NoDataGraph if statement is empty", async () => {
    render(<MemoryRouter><OperatingExpensesGraph statement={[]} period="annually" /></MemoryRouter>);
    expect(await screen.findByText(/No Data/i)).toBeInTheDocument();
  });
});
