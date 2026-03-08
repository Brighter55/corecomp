import SharesOutstandingGraph from './SharesOutstandingGraph';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from "react-router-dom";

const mockFetch = vi.fn();
const mockSetSymbol = vi.fn();
const mockFilterReports = vi.fn();
const mockGetPercentChange = vi.fn();

global.fetch = mockFetch;

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

describe("SharesOutstandingGraph", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    test("loads up properly", async () => {
        const return_value = {
            data: [{date: "2024-01-01", shares_outstanding_basic: "100"}]
        };
        mockFetch.mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: async () => (return_value),
        });
        mockFilterReports.mockReturnValue([{date: "2024-01-01", shares_outstanding_basic: "100"}]);
        mockGetPercentChange.mockReturnValue(0);
        render(
            <MemoryRouter>
                <SharesOutstandingGraph symbol="AAPL" fetchVersion={0} setSymbol={mockSetSymbol} period="annually"></SharesOutstandingGraph>
            </MemoryRouter>
        );
        await waitFor(() => {
            expect(mockFetch).toHaveBeenCalledWith(
                "http://localhost:8000/pages/shares-outstanding",
                expect.objectContaining({
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({symbol: "AAPL"}),
                }),
            );
        });
        const title = await screen.findByText("Basic Shares Outstanding");
        expect(title).toBeInTheDocument();
        expect(mockFilterReports).toHaveBeenCalledTimes(1);
        expect(mockGetPercentChange).toHaveBeenCalledTimes(1);
    });

    test("update graph if symbol or fetchVersion changes", async () => {
        const firstReturnValue = {
            data: [{date: "2024-01-01", shares_outstanding_basic: "100"}]
        };
        mockFetch.mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: async () => (firstReturnValue),
        });

        mockFilterReports.mockReturnValue([{date: "2024-01-01", shares_outstanding_basic: "100"}]);
        mockGetPercentChange.mockReturnValue(0);

        const { rerender } = render(
            <MemoryRouter>
                <SharesOutstandingGraph symbol="AAPL" fetchVersion={0} setSymbol={mockSetSymbol} period="annually"></SharesOutstandingGraph>
            </MemoryRouter>
        );
        await waitFor(() => {
            expect(mockFetch).toHaveBeenCalledWith(
                "http://localhost:8000/pages/shares-outstanding",
                expect.objectContaining({
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({symbol: "AAPL"}),
                }),
            );
        });

        const secondReturnValue = {
            data: [{date: "2024-01-01", shares_outstanding_basic: "200"}]
        };

        mockFetch.mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: async () => (secondReturnValue),
        });

        mockFilterReports.mockReturnValue([{date: "2024-01-01", shares_outstanding_basic: "200"}]);
        mockGetPercentChange.mockReturnValue(0);

        rerender(
            <MemoryRouter>
                <SharesOutstandingGraph symbol="TSLA" fetchVersion={1} setSymbol={mockSetSymbol} period="annually"></SharesOutstandingGraph>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(mockFetch).toHaveBeenCalledWith(
                "http://localhost:8000/pages/shares-outstanding",
                expect.objectContaining({
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({symbol: "TSLA"}),
                }),
            );
        });
        const title = await screen.findByText("Basic Shares Outstanding");
        expect(title).toBeInTheDocument();
        expect(mockFilterReports).toHaveBeenCalledTimes(2);
        expect(mockGetPercentChange).toHaveBeenCalledTimes(2);

        const thirdReturnValue = {
            data: [{date: "2024-01-01", shares_outstanding_basic: "300"}]
        };
        
        mockFetch.mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: async () => (thirdReturnValue),
        });

        mockFilterReports.mockReturnValue([{date: "2024-01-01", shares_outstanding_basic: "300"}]);
        mockGetPercentChange.mockReturnValue(0);

        rerender(
            <MemoryRouter>
                <SharesOutstandingGraph symbol="TSLA" fetchVersion={2} setSymbol={mockSetSymbol} period="annually"></SharesOutstandingGraph>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(mockFetch).toHaveBeenCalledWith(
                "http://localhost:8000/pages/shares-outstanding",
                expect.objectContaining({
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({symbol: "TSLA"}),
                }),
            );
        });
        
        expect(await screen.findByText("Basic Shares Outstanding")).toBeInTheDocument();
        expect(mockFilterReports).toHaveBeenCalledTimes(3);
        expect(mockGetPercentChange).toHaveBeenCalledTimes(3);
    });

    test("renders NoDataGraph if fetch returns 204", async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            status: 204,
        });

        render(
            <MemoryRouter>
                <SharesOutstandingGraph symbol="AAPL" fetchVersion={0} setSymbol={mockSetSymbol} period="annually"></SharesOutstandingGraph>
            </MemoryRouter>
        );
        await waitFor(() => {
            expect(mockFetch).toHaveBeenCalledWith(
                "http://localhost:8000/pages/shares-outstanding",
                expect.objectContaining({
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({symbol: "AAPL"}),
                }),
            );
        });

        expect(await screen.findByText(/No Data/i)).toBeInTheDocument();
        }
    )

});