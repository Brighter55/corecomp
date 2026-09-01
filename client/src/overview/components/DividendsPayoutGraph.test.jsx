import DividendsPayoutGraph from "./DividendsPayoutGraph.jsx";
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

describe("DividendsPayoutGraph", () => {
  beforeEach(() => vi.clearAllMocks());

  test("loads with statement prop", async () => {
    const statement = { data: [{ ex_dividend_date: "2024-01-01", amount: "1.2" }] };
    mockFilterReports.mockReturnValue(statement.data);
    mockGetPercentChange.mockReturnValue(0);

    render(<MemoryRouter><DividendsPayoutGraph statement={statement} period="annually" /></MemoryRouter>);

    expect(await screen.findByText("Dividend Payouts")).toBeInTheDocument();
    expect(mockFilterReports).toHaveBeenCalledTimes(1);
  });

  test("updates when statement prop changes", async () => {
    const first = { data: [{ ex_dividend_date: "2024-01-01", amount: "1.2" }] };
    const second = { data: [{ ex_dividend_date: "2024-01-01", amount: "1.4" }] };

    mockFilterReports.mockReturnValue(first.data);
    const { rerender } = render(<MemoryRouter><DividendsPayoutGraph statement={first} period="annually" /></MemoryRouter>);

    mockFilterReports.mockReturnValue(second.data);
    rerender(<MemoryRouter><DividendsPayoutGraph statement={second} period="annually" /></MemoryRouter>);

    expect(await screen.findByText("Dividend Payouts")).toBeInTheDocument();
    expect(mockFilterReports).toHaveBeenCalledTimes(2);
  });

  test("renders nothing when statement is empty", () => {
  const { container } = render(<MemoryRouter><DividendsPayoutGraph statement={[]} period="annually" /></MemoryRouter>);
  expect(container).toBeEmptyDOMElement();
});
});