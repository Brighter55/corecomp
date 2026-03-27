import EbitdaGraph from "./EbitdaGraph.jsx"
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

describe("EbitdaGraph", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    test("loads up properly", async () => {
        const return_value = {
            annualReports: [
                { fiscalDateEnding: "2024-01-01", ebitda: "1500000" }
            ],
            quarterlyReports: [
                { fiscalDateEnding: "2024-01-01", ebitda: "1500000" }
            ],
        }
        mockAuthenticatedClientWithRetry.mockResolvedValueOnce({
            status: 200,
            json: async () => (return_value),
        });
        mockFilterReports.mockReturnValue([{ fiscalDateEnding: "2024-01-01", ebitda: "1500000" }]);
        mockGetPercentChange.mockReturnValue(0);
        
        render(
            <MemoryRouter>
                <EbitdaGraph symbol="AAPL" fetchVersion={0} setSymbol={mockSetSymbol} period="annually"></EbitdaGraph>
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
        
        const title = await screen.findByText("EBITDA");
        expect(title).toBeInTheDocument();
        expect(mockFilterReports).toHaveBeenCalledTimes(1);
        expect(mockGetPercentChange).toHaveBeenCalledTimes(1);
    });

    test("update graph if symbol or fetchVersion changes", async () => {
        const firstReturnValue = {
            annualReports: [
                { fiscalDateEnding: "2024-01-01", ebitda: "1500000" }
            ],
            quarterlyReports: [
                { fiscalDateEnding: "2024-01-01", ebitda: "1500000" }
            ],
        }
        mockAuthenticatedClientWithRetry.mockResolvedValueOnce({
            status: 200,
            json: async () => (firstReturnValue),
        });

        mockFilterReports.mockReturnValue([{ fiscalDateEnding: "2024-01-01", ebitda: "1500000" }]);
        mockGetPercentChange.mockReturnValue(0);

        const { rerender } = render(
            <MemoryRouter>
                <EbitdaGraph symbol="AAPL" fetchVersion={0} setSymbol={mockSetSymbol} period="annually"></EbitdaGraph>
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
                { fiscalDateEnding: "2024-01-01", ebitda: "1800000" }
            ],
            quarterlyReports: [
                { fiscalDateEnding: "2024-01-01", ebitda: "1800000" }
            ],
        }

        mockAuthenticatedClientWithRetry.mockResolvedValueOnce({
            status: 200,
            json: async () => (secondReturnValue),
        });

        mockFilterReports.mockReturnValue([{ fiscalDateEnding: "2024-01-01", ebitda: "1800000" }]);
        mockGetPercentChange.mockReturnValue(20);

        rerender(
            <MemoryRouter>
                <EbitdaGraph symbol="TSLA" fetchVersion={1} setSymbol={mockSetSymbol} period="annually"></EbitdaGraph>
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
        
        const title = await screen.findByText("EBITDA");
        expect(title).toBeInTheDocument();
        expect(mockFilterReports).toHaveBeenCalledTimes(2);
        expect(mockGetPercentChange).toHaveBeenCalledTimes(2);

        const thirdReturnValue = {
            annualReports: [
                { fiscalDateEnding: "2024-01-01", ebitda: "2000000" }
            ],
            quarterlyReports: [
                { fiscalDateEnding: "2024-01-01", ebitda: "2000000" }
            ],
        }
        
        mockAuthenticatedClientWithRetry.mockResolvedValueOnce({
            status: 200,
            json: async () => (thirdReturnValue),
        });

        mockFilterReports.mockReturnValue([{ fiscalDateEnding: "2024-01-01", ebitda: "2000000" }]);
        mockGetPercentChange.mockReturnValue(33.33);

        rerender(
            <MemoryRouter>
                <EbitdaGraph symbol="TSLA" fetchVersion={2} setSymbol={mockSetSymbol} period="annually"></EbitdaGraph>
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
        
        expect(await screen.findByText("EBITDA")).toBeInTheDocument();
        expect(mockFilterReports).toHaveBeenCalledTimes(3);
        expect(mockGetPercentChange).toHaveBeenCalledTimes(3);
    });

    test("renders NoDataGraph if fetch returns 204", async () => {
        mockAuthenticatedClientWithRetry.mockResolvedValueOnce({
            status: 204,
        });

        render(
            <MemoryRouter>
                <EbitdaGraph symbol="AAPL" fetchVersion={0} setSymbol={mockSetSymbol} period="annually"></EbitdaGraph>
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
