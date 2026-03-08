import CashVsDebtGraph from './CashVsDebtGraph';
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

describe("CashVsDebtGraph", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    test("loads up properly", async () => {
        const return_value = {
            annualReports: [
                { fiscalDateEnding: "2024-01-01", cashAndCashEquivalentsAtCarryingValue: "1000",  shortLongTermDebtTotal: "1000"}
            ],
            quarterlyReports: [
                { fiscalDateEnding: "2024-01-01", cashAndCashEquivalentsAtCarryingValue: "1000",  shortLongTermDebtTotal: "1000"}
            ],
        }
        mockFetch.mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: async () => (return_value),
        });
        mockFilterReports.mockReturnValue([{ fiscalDateEnding: "2024-01-01", cashAndCashEquivalentsAtCarryingValue: "1000",  shortLongTermDebtTotal: "1000"}]);
        mockGetPercentChange.mockReturnValue(0);
        render(
            <MemoryRouter>
                <CashVsDebtGraph symbol="AAPL" fetchVersion={0} setSymbol={mockSetSymbol} period="annually"></CashVsDebtGraph>
            </MemoryRouter>
        );
        await waitFor(() => {
            expect(mockFetch).toHaveBeenCalledWith(
                "http://localhost:8000/pages/balance-sheet",
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
        const title = await screen.findByText(/Cash V Debt/i);
        expect(title).toBeInTheDocument();
        expect(mockFilterReports).toHaveBeenCalledTimes(1);
        expect(mockGetPercentChange).toHaveBeenCalledTimes(2);
    });

    test("update graph if symbol or fetchVersion changes", async () => {
        const firstReturnValue = {
            annualReports: [
                { fiscalDateEnding: "2024-01-01", cashAndCashEquivalentsAtCarryingValue: "1000",  shortLongTermDebtTotal: "1000"}
            ],
            quarterlyReports: [
                { fiscalDateEnding: "2024-01-01", cashAndCashEquivalentsAtCarryingValue: "1000",  shortLongTermDebtTotal: "1000"}
            ],
        }
        mockFetch.mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: async () => (firstReturnValue),
        });

        mockFilterReports.mockReturnValue([{ fiscalDateEnding: "2024-01-01", cashAndCashEquivalentsAtCarryingValue: "1000",  shortLongTermDebtTotal: "1000"}]);
        mockGetPercentChange.mockReturnValue(0);

        const { rerender } = render(
            <MemoryRouter>
                <CashVsDebtGraph symbol="AAPL" fetchVersion={0} setSymbol={mockSetSymbol} period="annually"></CashVsDebtGraph>
            </MemoryRouter>
        );
        await waitFor(() => {
            expect(mockFetch).toHaveBeenCalledWith(
                "http://localhost:8000/pages/balance-sheet",
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
            annualReports: [
                { fiscalDateEnding: "2024-01-01", cashAndCashEquivalentsAtCarryingValue: "2000",  shortLongTermDebtTotal: "2000"}
            ],
            quarterlyReports: [
                { fiscalDateEnding: "2024-01-01", cashAndCashEquivalentsAtCarryingValue: "2000",  shortLongTermDebtTotal: "2000"}
            ],
        }

        mockFetch.mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: async () => (secondReturnValue),
        });

        mockFilterReports.mockReturnValue([{ fiscalDateEnding: "2024-01-01", cashAndCashEquivalentsAtCarryingValue: "2000",  shortLongTermDebtTotal: "2000"}]);
        mockGetPercentChange.mockReturnValue(0);

        rerender(
            <MemoryRouter>
                <CashVsDebtGraph symbol="TSLA" fetchVersion={1} setSymbol={mockSetSymbol} period="annually"></CashVsDebtGraph>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(mockFetch).toHaveBeenCalledWith(
                "http://localhost:8000/pages/balance-sheet",
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
        const title = await screen.findByText(/Cash V Debt/i);
        expect(title).toBeInTheDocument();
        expect(mockFilterReports).toHaveBeenCalledTimes(2);
        expect(mockGetPercentChange).toHaveBeenCalledTimes(4);

        const thirdReturnValue = {
            annualReports: [
                { fiscalDateEnding: "2024-01-01", cashAndCashEquivalentsAtCarryingValue: "3000",  shortLongTermDebtTotal: "3000"}
            ],
            quarterlyReports: [
                { fiscalDateEnding: "2024-01-01", cashAndCashEquivalentsAtCarryingValue: "3000",  shortLongTermDebtTotal: "3000"}
            ],
        }
        
        mockFetch.mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: async () => (thirdReturnValue),
        });

        mockFilterReports.mockReturnValue([{ fiscalDateEnding: "2024-01-01", cashAndCashEquivalentsAtCarryingValue: "3000",  shortLongTermDebtTotal: "3000"}]);
        mockGetPercentChange.mockReturnValue(0);

        rerender(
            <MemoryRouter>
                <CashVsDebtGraph symbol="TSLA" fetchVersion={2} setSymbol={mockSetSymbol} period="annually"></CashVsDebtGraph>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(mockFetch).toHaveBeenCalledWith(
                "http://localhost:8000/pages/balance-sheet",
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
        
        expect(await screen.findByText(/Cash V Debt/i)).toBeInTheDocument();
        expect(mockFilterReports).toHaveBeenCalledTimes(3);
        expect(mockGetPercentChange).toHaveBeenCalledTimes(6);
    });

    test("renders NoDataGraph if fetch returns 204", async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            status: 204,
        });

        render(
            <MemoryRouter>
                <CashVsDebtGraph symbol="AAPL" fetchVersion={0} setSymbol={mockSetSymbol} period="annually"></CashVsDebtGraph>
            </MemoryRouter>
        );
        await waitFor(() => {
            expect(mockFetch).toHaveBeenCalledWith(
                "http://localhost:8000/pages/balance-sheet",
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