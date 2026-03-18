import EbitGraph from './ebitGraph';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from "react-router-dom";


const { mockAuthenticatedClientWithRetry, mockSetSymbol, mockFilterReports, mockGetPercentChange } = vi.hoisted(() => ({
    mockSetSymbol: vi.fn(),
    mockFilterReports: vi.fn(),
    mockGetPercentChange: vi.fn(),
    mockAuthenticatedClientWithRetry: vi.fn(),
}));

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

vi.mock("../../helpers/api.js", async () => {
    const actual = await vi.importActual("../../helpers/api.js");
    return {
        ...actual,
        authenticatedClientWithRetry: mockAuthenticatedClientWithRetry,
    }
});

describe("EbitGraph", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    test("loads up properly", async () => {
        const return_value = {
            annualReports: [
                { fiscalDateEnding: "2024-01-01", ebit: "1200000" }
            ],
            quarterlyReports: [
                { fiscalDateEnding: "2024-01-01", ebit: "1200000" }
            ],
        }
        mockAuthenticatedClientWithRetry.mockResolvedValueOnce({
            status: 200,
            json: async () => (return_value),
        });
        mockFilterReports.mockReturnValue([{ fiscalDateEnding: "2024-01-01", ebit: "1200000" }]);
        mockGetPercentChange.mockReturnValue(0);
        
        render(
            <MemoryRouter>
                <EbitGraph symbol="AAPL" fetchVersion={0} setSymbol={mockSetSymbol} period="annually"></EbitGraph>
            </MemoryRouter>
        );
        
        await waitFor(() => {
            expect(mockAuthenticatedClientWithRetry).toHaveBeenCalledWith(
                "/pages/income-statement",
                expect.objectContaining({
                    symbol: "AAPL",
                }),
                expect.any(Function),
                expect.any(Function),
                mockSetSymbol
            );
        });
        
        const title = await screen.findByText("EBIT");
        expect(title).toBeInTheDocument();
        expect(mockFilterReports).toHaveBeenCalledTimes(1);
        expect(mockGetPercentChange).toHaveBeenCalledTimes(1);
    });

    test("update graph if symbol or fetchVersion changes", async () => {
        const firstReturnValue = {
            annualReports: [
                { fiscalDateEnding: "2024-01-01", ebit: "1200000" }
            ],
            quarterlyReports: [
                { fiscalDateEnding: "2024-01-01", ebit: "1200000" }
            ],
        }
        mockAuthenticatedClientWithRetry.mockResolvedValueOnce({
            status: 200,
            json: async () => (firstReturnValue),
        });

        mockFilterReports.mockReturnValue([{ fiscalDateEnding: "2024-01-01", ebit: "1200000" }]);
        mockGetPercentChange.mockReturnValue(0);

        const { rerender } = render(
            <MemoryRouter>
                <EbitGraph symbol="AAPL" fetchVersion={0} setSymbol={mockSetSymbol} period="annually"></EbitGraph>
            </MemoryRouter>
        );
        
        await waitFor(() => {
            expect(mockAuthenticatedClientWithRetry).toHaveBeenCalledWith(
                "/pages/income-statement",
                expect.objectContaining({
                    symbol: "AAPL",
                }),
                expect.any(Function),
                expect.any(Function),
                mockSetSymbol
            );
        });

        const secondReturnValue = {
            annualReports: [
                { fiscalDateEnding: "2024-01-01", ebit: "1400000" }
            ],
            quarterlyReports: [
                { fiscalDateEnding: "2024-01-01", ebit: "1400000" }
            ],
        }

        mockAuthenticatedClientWithRetry.mockResolvedValueOnce({
            status: 200,
            json: async () => (secondReturnValue),
        });

        mockFilterReports.mockReturnValue([{ fiscalDateEnding: "2024-01-01", ebit: "1400000" }]);
        mockGetPercentChange.mockReturnValue(16.67);

        rerender(
            <MemoryRouter>
                <EbitGraph symbol="TSLA" fetchVersion={1} setSymbol={mockSetSymbol} period="annually"></EbitGraph>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(mockAuthenticatedClientWithRetry).toHaveBeenCalledWith(
                "/pages/income-statement",
                expect.objectContaining({
                    symbol: "TSLA",
                }),
                expect.any(Function),
                expect.any(Function),
                mockSetSymbol
            );
        });
        
        const title = await screen.findByText("EBIT");
        expect(title).toBeInTheDocument();
        expect(mockFilterReports).toHaveBeenCalledTimes(2);
        expect(mockGetPercentChange).toHaveBeenCalledTimes(2);

        const thirdReturnValue = {
            annualReports: [
                { fiscalDateEnding: "2024-01-01", ebit: "1600000" }
            ],
            quarterlyReports: [
                { fiscalDateEnding: "2024-01-01", ebit: "1600000" }
            ],
        }
        
        mockAuthenticatedClientWithRetry.mockResolvedValueOnce({
            status: 200,
            json: async () => (thirdReturnValue),
        });

        mockFilterReports.mockReturnValue([{ fiscalDateEnding: "2024-01-01", ebit: "1600000" }]);
        mockGetPercentChange.mockReturnValue(33.33);

        rerender(
            <MemoryRouter>
                <EbitGraph symbol="TSLA" fetchVersion={2} setSymbol={mockSetSymbol} period="annually"></EbitGraph>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(mockAuthenticatedClientWithRetry).toHaveBeenCalledWith(
                "/pages/income-statement",
                expect.objectContaining({
                    symbol: "TSLA",
                }),
                expect.any(Function),
                expect.any(Function),
                mockSetSymbol
            );
        });
        
        expect(await screen.findByText("EBIT")).toBeInTheDocument();
        expect(mockFilterReports).toHaveBeenCalledTimes(3);
        expect(mockGetPercentChange).toHaveBeenCalledTimes(3);
    });

    test("renders NoDataGraph if fetch returns 204", async () => {
        mockAuthenticatedClientWithRetry.mockResolvedValueOnce({
            status: 204,
        });

        render(
            <MemoryRouter>
                <EbitGraph symbol="AAPL" fetchVersion={0} setSymbol={mockSetSymbol} period="annually"></EbitGraph>
            </MemoryRouter>
        );
        
        await waitFor(() => {
            expect(mockAuthenticatedClientWithRetry).toHaveBeenCalledWith(
                "/pages/income-statement",
                expect.objectContaining({
                    symbol: "AAPL",
                }),
                expect.any(Function),
                expect.any(Function),
                mockSetSymbol
            );
        });

        expect(await screen.findByText(/No Data/i)).toBeInTheDocument();
    });
});
