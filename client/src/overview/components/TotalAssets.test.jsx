import TotalAssets from "./TotalAssets.jsx";
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

describe("TotalAssets", () => {
  beforeEach(() => vi.clearAllMocks());

  test("loads with statement prop", async () => {
    const statement = {
      annualReports: [
        {
          fiscalDateEnding: "2024-01-01",
          totalAssets: "5000",
          totalLiabilities: "2000",
          totalShareholderEquity: "3000",
        },
      ],
      quarterlyReports: [],
    };
    mockFilterReports.mockReturnValue(statement.annualReports);
    mockGetPercentChange.mockReturnValue(5);

    render(
      <MemoryRouter>
        <TotalAssets statement={statement} period="annually" />
      </MemoryRouter>
    );

    expect(await screen.findByText("Total Assets")).toBeInTheDocument();
  });

  test("updates when statement prop changes", async () => {
    const first = {
      annualReports: [
        {
          fiscalDateEnding: "2024-01-01",
          totalAssets: "5000",
          totalLiabilities: "2000",
          totalShareholderEquity: "3000",
        },
      ],
      quarterlyReports: [],
    };
    const second = {
      annualReports: [
        {
          fiscalDateEnding: "2024-01-01",
          totalAssets: "6000",
          totalLiabilities: "2500",
          totalShareholderEquity: "3500",
        },
      ],
      quarterlyReports: [],
    };

    mockFilterReports.mockReturnValue(first.annualReports);
    mockGetPercentChange.mockReturnValue(5);
    const { rerender } = render(
      <MemoryRouter>
        <TotalAssets statement={first} period="annually" />
      </MemoryRouter>
    );

    mockFilterReports.mockReturnValue(second.annualReports);
    mockGetPercentChange.mockReturnValue(10);
    rerender(
      <MemoryRouter>
        <TotalAssets statement={second} period="annually" />
      </MemoryRouter>
    );

    expect(await screen.findByText("Total Assets")).toBeInTheDocument();
    expect(mockFilterReports).toHaveBeenCalledTimes(2);
  });

  test("renders NoDataGraph if statement is empty", async () => {
    render(
      <MemoryRouter>
        <TotalAssets statement={[]} period="annually" />
      </MemoryRouter>
    );
    expect(await screen.findByText(/No Data/i)).toBeInTheDocument();
  });
  });