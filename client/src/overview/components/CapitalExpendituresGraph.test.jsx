import CapitalExpendituresGraph from "./CapitalExpendituresGraph.jsx";
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

describe("CapitalExpendituresGraph", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("loads with statement prop", async () => {
    const statement = { annualReports: [{ fiscalDateEnding: "2024-01-01", capitalExpenditures: "500" }], quarterlyReports: [] };
    mockFilterReports.mockReturnValue([{ fiscalDateEnding: "2024-01-01", capitalExpenditures: "500" }]);
    mockGetPercentChange.mockReturnValue(0);

    render(
      <MemoryRouter>
        <CapitalExpendituresGraph statement={statement} period="annually" />
      </MemoryRouter>
    );

    expect(await screen.findByText("Capital Expenditures")).toBeInTheDocument();
    expect(mockFilterReports).toHaveBeenCalledTimes(1);
  });

  test("updates when statement prop changes", async () => {
    const firstStatement = { annualReports: [{ fiscalDateEnding: "2024-01-01", capitalExpenditures: "500" }], quarterlyReports: [] };
    const secondStatement = { annualReports: [{ fiscalDateEnding: "2024-01-01", capitalExpenditures: "700" }], quarterlyReports: [] };

    mockFilterReports.mockReturnValue([{ fiscalDateEnding: "2024-01-01", capitalExpenditures: "500" }]);
    const { rerender } = render(
      <MemoryRouter>
        <CapitalExpendituresGraph statement={firstStatement} period="annually" />
      </MemoryRouter>
    );

    mockFilterReports.mockReturnValue([{ fiscalDateEnding: "2024-01-01", capitalExpenditures: "700" }]);
    rerender(
      <MemoryRouter>
        <CapitalExpendituresGraph statement={secondStatement} period="annually" />
      </MemoryRouter>
    );

    expect(await screen.findByText("Capital Expenditures")).toBeInTheDocument();
    expect(mockFilterReports).toHaveBeenCalledTimes(2);
  });

  test("renders nothing when statement is empty", () => {
  const { container } = render(<MemoryRouter><CapitalExpendituresGraph statement={[]} period="annually" /></MemoryRouter>);
  expect(container).toBeEmptyDOMElement();
});
});