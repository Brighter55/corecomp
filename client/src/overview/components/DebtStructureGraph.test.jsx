import DebtStructureGraph from "./DebtStructureGraph.jsx";
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

describe("DebtStructureGraph", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("loads with statement prop", async () => {
    const statement = {
      annualReports: [
        {
          fiscalDateEnding: "2024-01-01",
          shortTermDebt: "1000",
          longTermDebt: "4000",
          shortLongTermDebtTotal: "5000",
        },
      ],
      quarterlyReports: [],
    };

    mockFilterReports.mockReturnValue(statement.annualReports);
    mockGetPercentChange.mockReturnValue(5);

    render(
      <MemoryRouter>
        <DebtStructureGraph statement={statement} period="annually" />
      </MemoryRouter>
    );

    expect(await screen.findByText("Debt Structure")).toBeInTheDocument();
    expect(mockFilterReports).toHaveBeenCalledTimes(1);
    expect(mockGetPercentChange).toHaveBeenCalledTimes(1);
  });

  test("updates when statement prop changes", async () => {
    const first = {
      annualReports: [
        {
          fiscalDateEnding: "2024-01-01",
          shortTermDebt: "1000",
          longTermDebt: "4000",
          shortLongTermDebtTotal: "5000",
        },
      ],
      quarterlyReports: [],
    };

    const second = {
      annualReports: [
        {
          fiscalDateEnding: "2024-01-01",
          shortTermDebt: "1500",
          longTermDebt: "4500",
          shortLongTermDebtTotal: "6000",
        },
      ],
      quarterlyReports: [],
    };

    mockFilterReports.mockReturnValue(first.annualReports);
    mockGetPercentChange.mockReturnValue(5);
    const { rerender } = render(
      <MemoryRouter>
        <DebtStructureGraph statement={first} period="annually" />
      </MemoryRouter>
    );

    mockFilterReports.mockReturnValue(second.annualReports);
    mockGetPercentChange.mockReturnValue(10);
    rerender(
      <MemoryRouter>
        <DebtStructureGraph statement={second} period="annually" />
      </MemoryRouter>
    );

    expect(await screen.findByText("Debt Structure")).toBeInTheDocument();
    expect(mockFilterReports).toHaveBeenCalledTimes(2);
    expect(mockGetPercentChange).toHaveBeenCalledTimes(2);
  });

  test("renders NoDataGraph if statement is empty", async () => {
    render(
      <MemoryRouter>
        <DebtStructureGraph statement={[]} period="annually" />
      </MemoryRouter>
    );

    expect(await screen.findByText(/No Data/i)).toBeInTheDocument();
  });
});