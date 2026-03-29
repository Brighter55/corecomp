import PricingGraph from './PricingGraph';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from "react-router-dom";

const mockFilterReports = vi.fn();
const mockGetPercentChange = vi.fn();

vi.mock("recharts", async () => {
    const actual = await vi.importActual("recharts");
    return {
        ...actual,
        ResponsiveContainer: () => (
            <div></div>
        ),
    } 
});
vi.mock("../../helpers/GraphsHelper.js", async () => {
    const actual = await vi.importActual("../../helpers/GraphsHelper.js");
    return {
        ...actual,
        filterReports: () => mockFilterReports(),
        getPercentChange: () => mockGetPercentChange(),
    }
});

describe("PricingGraph", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    test("loads up properly", async () => {
        const statement = [{date: "2024-01-01", adjustedClose: "100"}];
        mockFilterReports.mockReturnValue([{date: "2024-01-01", adjustedClose: "100"}]);
        mockGetPercentChange.mockReturnValue(0);
        render(
            <MemoryRouter>
                <PricingGraph statement={statement} period="annually"></PricingGraph>
            </MemoryRouter>
        );

        const title = await screen.findByText("Adjusted Monthly Pricing");
        expect(title).toBeInTheDocument();
        expect(mockFilterReports).toHaveBeenCalledTimes(1);
        expect(mockGetPercentChange).toHaveBeenCalledTimes(1);
    });

    test("updates graph if statement prop changes", async () => {
        const firstStatement = [{date: "2024-01-01", adjustedClose: "100"}];

        mockFilterReports.mockReturnValue([{date: "2024-01-01", adjustedClose: "100"}]);
        mockGetPercentChange.mockReturnValue(0);

        const { rerender } = render(
            <MemoryRouter>
                <PricingGraph statement={firstStatement} period="annually"></PricingGraph>
            </MemoryRouter>
        );

        const secondStatement = [{date: "2024-01-01", adjustedClose: "200"}];

        mockFilterReports.mockReturnValue([{date: "2024-01-01", adjustedClose: "200"}]);
        mockGetPercentChange.mockReturnValue(0);

        rerender(
            <MemoryRouter>
                <PricingGraph statement={secondStatement} period="annually"></PricingGraph>
            </MemoryRouter>
        );

        const title = await screen.findByText("Adjusted Monthly Pricing");
        expect(title).toBeInTheDocument();
        expect(mockFilterReports).toHaveBeenCalledTimes(2);
        expect(mockGetPercentChange).toHaveBeenCalledTimes(2);
    });

    test("renders NoDataGraph if statement has no data", async () => {
        render(
            <MemoryRouter>
                <PricingGraph statement={[]} period="annually"></PricingGraph>
            </MemoryRouter>
        );

        expect(await screen.findByText(/No Data/i)).toBeInTheDocument();
        }
    )

});