import ROEGraph from "./ROEGraph.jsx";
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

describe("ROEGraph", () => {
  beforeEach(() => vi.clearAllMocks());

  test("loads with statement prop", async () => {
    const statement = { annualReports: [{ fiscalDateEnding: "2024-01-01", ROEPercentage: "12" }], quarterlyReports: [] };
    mockFilterReports.mockReturnValue(statement.annualReports);
    mockGetPercentChange.mockReturnValue(0);

    render(<MemoryRouter><ROEGraph statement={statement} period="annually" /></MemoryRouter>);

    expect(await screen.findByText("ROE Percentage")).toBeInTheDocument();
  });

  test("updates when statement prop changes", async () => {
    const first = { annualReports: [{ fiscalDateEnding: "2024-01-01", ROEPercentage: "12" }], quarterlyReports: [] };
    const second = { annualReports: [{ fiscalDateEnding: "2024-01-01", ROEPercentage: "14" }], quarterlyReports: [] };

    mockFilterReports.mockReturnValue(first.annualReports);
    const { rerender } = render(<MemoryRouter><ROEGraph statement={first} period="annually" /></MemoryRouter>);

    mockFilterReports.mockReturnValue(second.annualReports);
    rerender(<MemoryRouter><ROEGraph statement={second} period="annually" /></MemoryRouter>);

    expect(await screen.findByText("ROE Percentage")).toBeInTheDocument();
    expect(mockFilterReports).toHaveBeenCalledTimes(2);
  });

  test("renders NoDataGraph if statement is empty", async () => {
    render(<MemoryRouter><ROEGraph statement={[]} period="annually" /></MemoryRouter>);
    expect(await screen.findByText(/No Data/i)).toBeInTheDocument();
  });
});