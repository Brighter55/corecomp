import PBRatioGraph from "./PBRatioGraph.jsx"
import { render, screen, waitFor } from '@testing-library/react';
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

describe("PBRatioGraph", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    test("loads up properly", async () => {
        const returnValue = {
            annualReports: [
                { fiscalDateEnding: "2024-01-01", PBRatio: "3.2" }
            ],
            quarterlyReports: [
                { fiscalDateEnding: "2024-01-01", PBRatio: "3.2" }
            ],
        }
        mockAuthenticatedClientWithRetry.mockResolvedValueOnce({
            status: 200,
            json: async () => (returnValue),
        });
        mockFilterReports.mockReturnValue([{ fiscalDateEnding: "2024-01-01", PBRatio: "3.2" }]);
        mockGetPercentChange.mockReturnValue(0);

        render(
            <MemoryRouter>
                <PBRatioGraph symbol="AAPL" fetchVersion={0} setSymbol={mockSetSymbol} period="annually"></PBRatioGraph>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(mockAuthenticatedClientWithRetry).toHaveBeenCalledWith(
                "/pages/composite",
                expect.objectContaining({
                    symbol: "AAPL",
                    graph: "PBRatio"
                }),
                expect.any(Function),
                expect.any(Function),
                mockSetSymbol
            );
        });

        const title = await screen.findByText("P/B Ratio");
        expect(title).toBeInTheDocument();
        expect(mockFilterReports).toHaveBeenCalledTimes(1);
        expect(mockGetPercentChange).toHaveBeenCalledTimes(1);
    });

    test("update graph if symbol or fetchVersion changes", async () => {
        const firstReturnValue = {
            annualReports: [
                { fiscalDateEnding: "2024-01-01", PBRatio: "3.2" }
            ],
            quarterlyReports: [
                { fiscalDateEnding: "2024-01-01", PBRatio: "3.2" }
            ],
        }
        mockAuthenticatedClientWithRetry.mockResolvedValueOnce({
            status: 200,
            json: async () => (firstReturnValue),
        });

        mockFilterReports.mockReturnValue([{ fiscalDateEnding: "2024-01-01", PBRatio: "3.2" }]);
        mockGetPercentChange.mockReturnValue(0);

        const { rerender } = render(
            <MemoryRouter>
                <PBRatioGraph symbol="AAPL" fetchVersion={0} setSymbol={mockSetSymbol} period="annually"></PBRatioGraph>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(mockAuthenticatedClientWithRetry).toHaveBeenCalledWith(
                "/pages/composite",
                expect.objectContaining({
                    symbol: "AAPL",
                    graph: "PBRatio"
                }),
                expect.any(Function),
                expect.any(Function),
                mockSetSymbol
            );
        });

        const secondReturnValue = {
            annualReports: [
                { fiscalDateEnding: "2024-01-01", PBRatio: "3.8" }
            ],
            quarterlyReports: [
                { fiscalDateEnding: "2024-01-01", PBRatio: "3.8" }
            ],
        }

        mockAuthenticatedClientWithRetry.mockResolvedValueOnce({
            status: 200,
            json: async () => (secondReturnValue),
        });

        mockFilterReports.mockReturnValue([{ fiscalDateEnding: "2024-01-01", PBRatio: "3.8" }]);
        mockGetPercentChange.mockReturnValue(0.6);

        rerender(
            <MemoryRouter>
                <PBRatioGraph symbol="TSLA" fetchVersion={1} setSymbol={mockSetSymbol} period="annually"></PBRatioGraph>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(mockAuthenticatedClientWithRetry).toHaveBeenCalledWith(
                "/pages/composite",
                expect.objectContaining({
                    symbol: "TSLA",
                    graph: "PBRatio"
                }),
                expect.any(Function),
                expect.any(Function),
                mockSetSymbol
            );
        });

        const title = await screen.findByText("P/B Ratio");
        expect(title).toBeInTheDocument();
        expect(mockFilterReports).toHaveBeenCalledTimes(2);
        expect(mockGetPercentChange).toHaveBeenCalledTimes(2);

        const thirdReturnValue = {
            annualReports: [
                { fiscalDateEnding: "2024-01-01", PBRatio: "4.1" }
            ],
            quarterlyReports: [
                { fiscalDateEnding: "2024-01-01", PBRatio: "4.1" }
            ],
        }

        mockAuthenticatedClientWithRetry.mockResolvedValueOnce({
            status: 200,
            json: async () => (thirdReturnValue),
        });

        mockFilterReports.mockReturnValue([{ fiscalDateEnding: "2024-01-01", PBRatio: "4.1" }]);
        mockGetPercentChange.mockReturnValue(0.9);

        rerender(
            <MemoryRouter>
                <PBRatioGraph symbol="TSLA" fetchVersion={2} setSymbol={mockSetSymbol} period="annually"></PBRatioGraph>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(mockAuthenticatedClientWithRetry).toHaveBeenCalledWith(
                "/pages/composite",
                expect.objectContaining({
                    symbol: "TSLA",
                    graph: "PBRatio"
                }),
                expect.any(Function),
                expect.any(Function),
                mockSetSymbol
            );
        });

        expect(await screen.findByText("P/B Ratio")).toBeInTheDocument();
        expect(mockFilterReports).toHaveBeenCalledTimes(3);
        expect(mockGetPercentChange).toHaveBeenCalledTimes(3);
    });

    test("renders NoDataGraph if fetch returns 204", async () => {
        mockAuthenticatedClientWithRetry.mockResolvedValueOnce({
            status: 204,
        });

        render(
            <MemoryRouter>
                <PBRatioGraph symbol="AAPL" fetchVersion={0} setSymbol={mockSetSymbol} period="annually"></PBRatioGraph>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(mockAuthenticatedClientWithRetry).toHaveBeenCalledWith(
                "/pages/composite",
                expect.objectContaining({
                    symbol: "AAPL",
                    graph: "PBRatio"
                }),
                expect.any(Function),
                expect.any(Function),
                mockSetSymbol
            );
        });

        expect(await screen.findByText(/No Data/i)).toBeInTheDocument();
    });
});