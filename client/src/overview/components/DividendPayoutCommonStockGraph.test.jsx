import DividendPayoutCommonStockGraph from "./DividendPayoutCommonStockGraph.jsx";
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

describe("DividendPayoutCommonStockGraph", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("loads with statement prop", async () => {
    const statement = {
      annualReports: [{ fiscalDateEnding: "2024-01-01", dividendPayoutCommonStock: "50" }],
      quarterlyReports: [],
    };
    mockFilterReports.mockReturnValue(statement.annualReports);
    mockGetPercentChange.mockReturnValue(0);

    render(
      <MemoryRouter>
        <DividendPayoutCommonStockGraph statement={statement} period="annually" />
      </MemoryRouter>
    );

    expect(await screen.findByText("Dividend Payout (Common Stock)")).toBeInTheDocument();
    expect(mockFilterReports).toHaveBeenCalledTimes(1);
  });

  test("updates when statement prop changes", async () => {
    const firstStatement = {
      annualReports: [{ fiscalDateEnding: "2024-01-01", dividendPayoutCommonStock: "50" }],
      quarterlyReports: [],
    };
    const secondStatement = {
      annualReports: [{ fiscalDateEnding: "2024-01-01", dividendPayoutCommonStock: "70" }],
      quarterlyReports: [],
    };

    mockFilterReports.mockReturnValue(firstStatement.annualReports);
    const { rerender } = render(
      <MemoryRouter>
        <DividendPayoutCommonStockGraph statement={firstStatement} period="annually" />
      </MemoryRouter>
    );

    mockFilterReports.mockReturnValue(secondStatement.annualReports);
    rerender(
      <MemoryRouter>
        <DividendPayoutCommonStockGraph statement={secondStatement} period="annually" />
      </MemoryRouter>
    );

    expect(await screen.findByText("Dividend Payout (Common Stock)")).toBeInTheDocument();
    expect(mockFilterReports).toHaveBeenCalledTimes(2);
  });

  test("renders nothing when statement is empty", () => {
  const { container } = render(<MemoryRouter><DividendPayoutCommonStockGraph statement={[]} period="annually" /></MemoryRouter>);
  expect(container).toBeEmptyDOMElement();
});
});
