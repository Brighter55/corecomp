import ROEGraph from "./ROEGraph.jsx"
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

describe("ROEGraph", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    test("loads up properly", async () => {
        const return_value = {
            annualReports: [
                { fiscalDateEnding: "2024-01-01", ROEPercentage: "15.5" }
            ],
            quarterlyReports: [
                { fiscalDateEnding: "2024-01-01", ROEPercentage: "15.5" }
            ],
        }
        mockAuthenticatedClientWithRetry.mockResolvedValueOnce({
            status: 200,
            json: async () => (return_value),
        });
        mockFilterReports.mockReturnValue([{ fiscalDateEnding: "2024-01-01", ROEPercentage: "15.5" }]);
        mockGetPercentChange.mockReturnValue(0);
        
        render(
            <MemoryRouter>
                <ROEGraph symbol="AAPL" fetchVersion={0} setSymbol={mockSetSymbol} period="annually"></ROEGraph>
            </MemoryRouter>
        );
        
        await waitFor(() => {
            expect(mockAuthenticatedClientWithRetry).toHaveBeenCalledWith(
                "/pages/composite",
                expect.objectContaining({
                    symbol: "AAPL",
                    graph: "ROEPercentage"
                }),
                expect.any(Function),
                expect.any(Function),
                mockSetSymbol
            );
        });
        
        const title = await screen.findByText("ROE Percentage");
        expect(title).toBeInTheDocument();
        expect(mockFilterReports).toHaveBeenCalledTimes(1);
        expect(mockGetPercentChange).toHaveBeenCalledTimes(1);
    });

    test("update graph if symbol or fetchVersion changes", async () => {
        const firstReturnValue = {
            annualReports: [
                { fiscalDateEnding: "2024-01-01", ROEPercentage: "15.5" }
            ],
            quarterlyReports: [
                { fiscalDateEnding: "2024-01-01", ROEPercentage: "15.5" }
            ],
        }
        mockAuthenticatedClientWithRetry.mockResolvedValueOnce({
            status: 200,
            json: async () => (firstReturnValue),
        });

        mockFilterReports.mockReturnValue([{ fiscalDateEnding: "2024-01-01", ROEPercentage: "15.5" }]);
        mockGetPercentChange.mockReturnValue(0);

        const { rerender } = render(
            <MemoryRouter>
                <ROEGraph symbol="AAPL" fetchVersion={0} setSymbol={mockSetSymbol} period="annually"></ROEGraph>
            </MemoryRouter>
        );
        
        await waitFor(() => {
            expect(mockAuthenticatedClientWithRetry).toHaveBeenCalledWith(
                "/pages/composite",
                expect.objectContaining({
                    symbol: "AAPL",
                    graph: "ROEPercentage"
                }),
                expect.any(Function),
                expect.any(Function),
                mockSetSymbol
            );
        });

        const secondReturnValue = {
            annualReports: [
                { fiscalDateEnding: "2024-01-01", ROEPercentage: "18.2" }
            ],
            quarterlyReports: [
                { fiscalDateEnding: "2024-01-01", ROEPercentage: "18.2" }
            ],
        }

        mockAuthenticatedClientWithRetry.mockResolvedValueOnce({
            status: 200,
            json: async () => (secondReturnValue),
        });

        mockFilterReports.mockReturnValue([{ fiscalDateEnding: "2024-01-01", ROEPercentage: "18.2" }]);
        mockGetPercentChange.mockReturnValue(2.7);

        rerender(
            <MemoryRouter>
                <ROEGraph symbol="TSLA" fetchVersion={1} setSymbol={mockSetSymbol} period="annually"></ROEGraph>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(mockAuthenticatedClientWithRetry).toHaveBeenCalledWith(
                "/pages/composite",
                expect.objectContaining({
                    symbol: "TSLA",
                    graph: "ROEPercentage"
                }),
                expect.any(Function),
                expect.any(Function),
                mockSetSymbol
            );
        });
        
        const title = await screen.findByText("ROE Percentage");
        expect(title).toBeInTheDocument();
        expect(mockFilterReports).toHaveBeenCalledTimes(2);
        expect(mockGetPercentChange).toHaveBeenCalledTimes(2);

        const thirdReturnValue = {
            annualReports: [
                { fiscalDateEnding: "2024-01-01", ROEPercentage: "20.1" }
            ],
            quarterlyReports: [
                { fiscalDateEnding: "2024-01-01", ROEPercentage: "20.1" }
            ],
        }
        
        mockAuthenticatedClientWithRetry.mockResolvedValueOnce({
            status: 200,
            json: async () => (thirdReturnValue),
        });

        mockFilterReports.mockReturnValue([{ fiscalDateEnding: "2024-01-01", ROEPercentage: "20.1" }]);
        mockGetPercentChange.mockReturnValue(4.6);

        rerender(
            <MemoryRouter>
                <ROEGraph symbol="TSLA" fetchVersion={2} setSymbol={mockSetSymbol} period="annually"></ROEGraph>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(mockAuthenticatedClientWithRetry).toHaveBeenCalledWith(
                "/pages/composite",
                expect.objectContaining({
                    symbol: "TSLA",
                    graph: "ROEPercentage"
                }),
                expect.any(Function),
                expect.any(Function),
                mockSetSymbol
            );
        });
        
        expect(await screen.findByText("ROE Percentage")).toBeInTheDocument();
        expect(mockFilterReports).toHaveBeenCalledTimes(3);
        expect(mockGetPercentChange).toHaveBeenCalledTimes(3);
    });

    test("renders NoDataGraph if fetch returns 204", async () => {
        mockAuthenticatedClientWithRetry.mockResolvedValueOnce({
            status: 204,
        });

        render(
            <MemoryRouter>
                <ROEGraph symbol="AAPL" fetchVersion={0} setSymbol={mockSetSymbol} period="annually"></ROEGraph>
            </MemoryRouter>
        );
        
        await waitFor(() => {
            expect(mockAuthenticatedClientWithRetry).toHaveBeenCalledWith(
                "/pages/composite",
                expect.objectContaining({
                    symbol: "AAPL",
                    graph: "ROEPercentage"
                }),
                expect.any(Function),
                expect.any(Function),
                mockSetSymbol
            );
        });

        expect(await screen.findByText(/No Data/i)).toBeInTheDocument();
    });
});
