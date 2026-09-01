import NetIncomeVsOcfGraph from "./NetIncomeVsOcfGraph.jsx";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

const mockFilterReports = vi.fn();

vi.mock("recharts", async () => {
  const actual = await vi.importActual("recharts");
  return { ...actual, ResponsiveContainer: () => <div></div> };
});

vi.mock("../../helpers/GraphsHelper.js", async () => {
  const actual = await vi.importActual("../../helpers/GraphsHelper.js");
  return {
    ...actual,
    filterReports: () => mockFilterReports(),
  };
});

describe("NetIncomeVsOcfGraph", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("loads with statement prop", async () => {
    const statement = {
      annualReports: [{ fiscalDateEnding: "2024-01-01", operatingCashflow: "1000", netIncome: "800" }],
      quarterlyReports: [],
    };
    mockFilterReports.mockReturnValue([{ fiscalDateEnding: "2024-01-01", operatingCashflow: "1000", netIncome: "800" }]);

    render(
      <MemoryRouter>
        <NetIncomeVsOcfGraph statement={statement} period="annually" />
      </MemoryRouter>
    );

    expect(await screen.findByText("Net Income Vs OCF")).toBeInTheDocument();
    expect(mockFilterReports).toHaveBeenCalledTimes(1);
  });

  test("updates when statement prop changes", async () => {
    const firstStatement = {
      annualReports: [{ fiscalDateEnding: "2024-01-01", operatingCashflow: "1000", netIncome: "800" }],
      quarterlyReports: [],
    };
    const secondStatement = {
      annualReports: [{ fiscalDateEnding: "2024-01-01", operatingCashflow: "2000", netIncome: "1000" }],
      quarterlyReports: [],
    };

    mockFilterReports.mockReturnValue([{ fiscalDateEnding: "2024-01-01", operatingCashflow: "1000", netIncome: "800" }]);
    const { rerender } = render(
      <MemoryRouter>
        <NetIncomeVsOcfGraph statement={firstStatement} period="annually" />
      </MemoryRouter>
    );

    mockFilterReports.mockReturnValue([{ fiscalDateEnding: "2024-01-01", operatingCashflow: "2000", netIncome: "1000" }]);
    rerender(
      <MemoryRouter>
        <NetIncomeVsOcfGraph statement={secondStatement} period="annually" />
      </MemoryRouter>
    );

    expect(await screen.findByText("Net Income Vs OCF")).toBeInTheDocument();
    expect(mockFilterReports).toHaveBeenCalledTimes(2);
  });

  test("renders nothing when statement is empty", () => {
  const { container } = render(<MemoryRouter><NetIncomeVsOcfGraph statement={[]} period="annually" /></MemoryRouter>);
  expect(container).toBeEmptyDOMElement();
});
});
