import CashFlowTrifectaGraph from "./CashFlowTrifectaGraph.jsx";
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

describe("CashFlowTrifectaGraph", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("loads with statement prop", async () => {
    const statement = {
      annualReports: [
        {
          fiscalDateEnding: "2024-01-01",
          operatingCashflow: "1200",
          cashflowFromInvestment: "-400",
          cashflowFromFinancing: "-600",
        },
      ],
      quarterlyReports: [],
    };

    mockFilterReports.mockReturnValue(statement.annualReports);

    render(
      <MemoryRouter>
        <CashFlowTrifectaGraph statement={statement} period="annually" />
      </MemoryRouter>
    );

    expect(await screen.findByText("Cash Flow Trifecta")).toBeInTheDocument();
    expect(mockFilterReports).toHaveBeenCalledTimes(1);
    expect(screen.queryByText("N/A")).not.toBeInTheDocument();
  });

  test("updates when statement prop changes", async () => {
    const firstStatement = {
      annualReports: [
        {
          fiscalDateEnding: "2024-01-01",
          operatingCashflow: "1200",
          cashflowFromInvestment: "-400",
          cashflowFromFinancing: "-600",
        },
      ],
      quarterlyReports: [],
    };

    const secondStatement = {
      annualReports: [
        {
          fiscalDateEnding: "2024-01-01",
          operatingCashflow: "1600",
          cashflowFromInvestment: "-300",
          cashflowFromFinancing: "-500",
        },
      ],
      quarterlyReports: [],
    };

    mockFilterReports.mockReturnValue(firstStatement.annualReports);
    const { rerender } = render(
      <MemoryRouter>
        <CashFlowTrifectaGraph statement={firstStatement} period="annually" />
      </MemoryRouter>
    );

    mockFilterReports.mockReturnValue(secondStatement.annualReports);
    rerender(
      <MemoryRouter>
        <CashFlowTrifectaGraph statement={secondStatement} period="annually" />
      </MemoryRouter>
    );

    expect(await screen.findByText("Cash Flow Trifecta")).toBeInTheDocument();
    expect(mockFilterReports).toHaveBeenCalledTimes(2);
  });

  test("renders nothing when statement is empty", () => {
  const { container } = render(<MemoryRouter><CashFlowTrifectaGraph statement={[]} period="annually" /></MemoryRouter>);
  expect(container).toBeEmptyDOMElement();
});
});
