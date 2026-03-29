import EPSGraph from "./EPSGraph.jsx";
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

describe("EPSGraph", () => {
  beforeEach(() => vi.clearAllMocks());

  test("loads with statement prop", async () => {
    const statement = { annualEarnings: [{ fiscalDateEnding: "2024-01-01", reportedEPS: "2.1" }], quarterlyEarnings: [] };
    mockFilterReports.mockReturnValue(statement.annualEarnings);
    mockGetPercentChange.mockReturnValue(0);

    render(<MemoryRouter><EPSGraph statement={statement} period="annually" /></MemoryRouter>);

    expect(await screen.findByText("Earning per Share")).toBeInTheDocument();
    expect(mockFilterReports).toHaveBeenCalledTimes(1);
  });

  test("updates when statement prop changes", async () => {
    const first = { annualEarnings: [{ fiscalDateEnding: "2024-01-01", reportedEPS: "2.1" }], quarterlyEarnings: [] };
    const second = { annualEarnings: [{ fiscalDateEnding: "2024-01-01", reportedEPS: "2.4" }], quarterlyEarnings: [] };

    mockFilterReports.mockReturnValue(first.annualEarnings);
    const { rerender } = render(<MemoryRouter><EPSGraph statement={first} period="annually" /></MemoryRouter>);

    mockFilterReports.mockReturnValue(second.annualEarnings);
    rerender(<MemoryRouter><EPSGraph statement={second} period="annually" /></MemoryRouter>);

    expect(await screen.findByText("Earning per Share")).toBeInTheDocument();
    expect(mockFilterReports).toHaveBeenCalledTimes(2);
  });

  test("renders NoDataGraph if statement is empty", async () => {
    render(<MemoryRouter><EPSGraph statement={[]} period="annually" /></MemoryRouter>);
    expect(await screen.findByText(/No Data/i)).toBeInTheDocument();
  });
});