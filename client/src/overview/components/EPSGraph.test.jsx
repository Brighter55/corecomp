import EPSGraph from './EPSGraph';
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

describe("EPSGraph", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    test("loads up properly", async () => {
        const return_value = {
            annualEarnings: [
                { fiscalDateEnding: "2024-01-01", reportedEPS: "1.00", estimatedEPS: "1.00" }
            ],
            quarterlyEarnings: [
                { fiscalDateEnding: "2024-01-01", reportedEPS: "1.00", estimatedEPS: "1.00" }
            ],
        }
        mockFetch.mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: async () => (return_value),
        });
        mockFilterReports.mockReturnValue([{ fiscalDateEnding: "2024-01-01", reportedEPS: "1.00", estimatedEPS: "1.00" }]);
        mockGetPercentChange.mockReturnValue(0);
        render(
            <MemoryRouter>
                <EPSGraph symbol="AAPL" fetchVersion={0} setSymbol={mockSetSymbol} period="annually"></EPSGraph>
            </MemoryRouter>
        );
        await waitFor(() => {
            expect(mockFetch).toHaveBeenCalledWith(
                "http://localhost:8000/pages/earnings",
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
        const title = await screen.findByText(/Earning per Share/i);
        expect(title).toBeInTheDocument();
        expect(mockFilterReports).toHaveBeenCalledTimes(1);
        expect(mockGetPercentChange).toHaveBeenCalledTimes(1);
    });

    test("update graph if symbol or fetchVersion changes", async () => {
        const firstReturnValue = {
            annualEarnings: [
                { fiscalDateEnding: "2024-01-01", reportedEPS: "1.00", estimatedEPS: "1.00" }
            ],
            quarterlyEarnings: [
                { fiscalDateEnding: "2024-01-01", reportedEPS: "1.00", estimatedEPS: "1.00" }
            ],
        }
        mockFetch.mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: async () => (firstReturnValue),
        });

        mockFilterReports.mockReturnValue([{ fiscalDateEnding: "2024-01-01", reportedEPS: "1.00", estimatedEPS: "1.00" }]);
        mockGetPercentChange.mockReturnValue(0);

        const { rerender } = render(
            <MemoryRouter>
                <EPSGraph symbol="AAPL" fetchVersion={0} setSymbol={mockSetSymbol} period="annually"></EPSGraph>
            </MemoryRouter>
        );
        await waitFor(() => {
            expect(mockFetch).toHaveBeenCalledWith(
                "http://localhost:8000/pages/earnings",
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
            annualEarnings: [
                { fiscalDateEnding: "2024-01-01", reportedEPS: "2.00", estimatedEPS: "2.00" }
            ],
            quarterlyEarnings: [
                { fiscalDateEnding: "2024-01-01", reportedEPS: "2.00", estimatedEPS: "2.00" }
            ],
        }

        mockFetch.mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: async () => (secondReturnValue),
        });

        mockFilterReports.mockReturnValue([{ fiscalDateEnding: "2024-01-01", reportedEPS: "2.00", estimatedEPS: "2.00" }]);
        mockGetPercentChange.mockReturnValue(0);

        rerender(
            <MemoryRouter>
                <EPSGraph symbol="TSLA" fetchVersion={1} setSymbol={mockSetSymbol} period="annually"></EPSGraph>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(mockFetch).toHaveBeenCalledWith(
                "http://localhost:8000/pages/earnings",
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
        const title = await screen.findByText(/Earning per Share/i);
        expect(title).toBeInTheDocument();
        expect(mockFilterReports).toHaveBeenCalledTimes(2);
        expect(mockGetPercentChange).toHaveBeenCalledTimes(2);

        const thirdReturnValue = {
            annualEarnings: [
                { fiscalDateEnding: "2024-01-01", reportedEPS: "3.00", estimatedEPS: "3.00" }
            ],
            quarterlyEarnings: [
                { fiscalDateEnding: "2024-01-01", reportedEPS: "3.00", estimatedEPS: "3.00" }
            ],
        }
        
        mockFetch.mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: async () => (thirdReturnValue),
        });

        mockFilterReports.mockReturnValue([{ fiscalDateEnding: "2024-01-01", reportedEPS: "3.00", estimatedEPS: "3.00" }]);
        mockGetPercentChange.mockReturnValue(0);

        rerender(
            <MemoryRouter>
                <EPSGraph symbol="TSLA" fetchVersion={2} setSymbol={mockSetSymbol} period="annually"></EPSGraph>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(mockFetch).toHaveBeenCalledWith(
                "http://localhost:8000/pages/earnings",
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
        
        expect(await screen.findByText(/Earning per Share/i)).toBeInTheDocument();
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
                <EPSGraph symbol="AAPL" fetchVersion={0} setSymbol={mockSetSymbol} period="annually"></EPSGraph>
            </MemoryRouter>
        );
        await waitFor(() => {
            expect(mockFetch).toHaveBeenCalledWith(
                "http://localhost:8000/pages/earnings",
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