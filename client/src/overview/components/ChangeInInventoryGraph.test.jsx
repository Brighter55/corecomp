import ChangeInInventoryGraph from "./ChangeInInventoryGraph.jsx";
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

describe("ChangeInInventoryGraph", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("loads with statement prop", async () => {
    const statement = {
      annualReports: [{ fiscalDateEnding: "2024-01-01", changeInInventory: "20" }],
      quarterlyReports: [],
    };
    mockFilterReports.mockReturnValue(statement.annualReports);
    mockGetPercentChange.mockReturnValue(0);

    render(
      <MemoryRouter>
        <ChangeInInventoryGraph statement={statement} period="annually" />
      </MemoryRouter>
    );

    expect(await screen.findByText("Change in Inventory")).toBeInTheDocument();
    expect(mockFilterReports).toHaveBeenCalledTimes(1);
  });

  test("updates when statement prop changes", async () => {
    const firstStatement = {
      annualReports: [{ fiscalDateEnding: "2024-01-01", changeInInventory: "20" }],
      quarterlyReports: [],
    };
    const secondStatement = {
      annualReports: [{ fiscalDateEnding: "2024-01-01", changeInInventory: "30" }],
      quarterlyReports: [],
    };

    mockFilterReports.mockReturnValue(firstStatement.annualReports);
    const { rerender } = render(
      <MemoryRouter>
        <ChangeInInventoryGraph statement={firstStatement} period="annually" />
      </MemoryRouter>
    );

    mockFilterReports.mockReturnValue(secondStatement.annualReports);
    rerender(
      <MemoryRouter>
        <ChangeInInventoryGraph statement={secondStatement} period="annually" />
      </MemoryRouter>
    );

    expect(await screen.findByText("Change in Inventory")).toBeInTheDocument();
    expect(mockFilterReports).toHaveBeenCalledTimes(2);
  });

  test("renders NoDataGraph if statement is empty", async () => {
    render(
      <MemoryRouter>
        <ChangeInInventoryGraph statement={[]} period="annually" />
      </MemoryRouter>
    );

    expect(await screen.findByText(/No Data/i)).toBeInTheDocument();
  });
});
