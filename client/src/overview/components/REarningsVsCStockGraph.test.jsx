import REarningsVsCStock from "./REarningsVsCStockGraph.jsx";
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

describe("REarningsVsCStock", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("loads with statement prop", async () => {
    const statement = {
      annualReports: [
        {
          fiscalDateEnding: "2024-01-01",
          retainedEarnings: "120000",
          commonStock: "35000",
        },
      ],
      quarterlyReports: [],
    };

    mockFilterReports.mockReturnValue(statement.annualReports);
    mockGetPercentChange.mockReturnValue(0);

    render(
      <MemoryRouter>
        <REarningsVsCStock statement={statement} period="annually" />
      </MemoryRouter>
    );

    expect(await screen.findByText("Retained Earnings vs Paid-in Capital")).toBeInTheDocument();
    expect(mockFilterReports).toHaveBeenCalledTimes(1);
    expect(mockGetPercentChange).toHaveBeenCalledTimes(2);
  });

  test("updates when statement prop changes", async () => {
    const first = {
      annualReports: [
        {
          fiscalDateEnding: "2024-01-01",
          retainedEarnings: "120000",
          commonStock: "35000",
        },
      ],
      quarterlyReports: [],
    };

    const second = {
      annualReports: [
        {
          fiscalDateEnding: "2024-01-01",
          retainedEarnings: "150000",
          commonStock: "42000",
        },
      ],
      quarterlyReports: [],
    };

    mockFilterReports.mockReturnValue(first.annualReports);
    mockGetPercentChange.mockReturnValue(5);

    const { rerender } = render(
      <MemoryRouter>
        <REarningsVsCStock statement={first} period="annually" />
      </MemoryRouter>
    );

    mockFilterReports.mockReturnValue(second.annualReports);
    mockGetPercentChange.mockReturnValue(10);

    rerender(
      <MemoryRouter>
        <REarningsVsCStock statement={second} period="annually" />
      </MemoryRouter>
    );

    expect(await screen.findByText("Retained Earnings vs Paid-in Capital")).toBeInTheDocument();
    expect(mockFilterReports).toHaveBeenCalledTimes(2);
    expect(mockGetPercentChange).toHaveBeenCalledTimes(4);
  });

  test("renders nothing when statement is empty", () => {
  const { container } = render(<MemoryRouter><REarningsVsCStock statement={[]} period="annually" /></MemoryRouter>);
  expect(container).toBeEmptyDOMElement();
});
});
