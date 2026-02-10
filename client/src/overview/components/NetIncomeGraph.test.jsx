import NetIncomeGraph from "./NetIncomeGraph.jsx"
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

describe("NetIncomeGraph", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    test("loads up properly", async () => {
        const return_value = {
            annualReports: [
                { fiscalDateEnding: "2024-01-01", netIncome: "1000" }
            ],
            quarterlyReports: [
                { fiscalDateEnding: "2024-01-01", netIncome: "1000" }
            ],
        }
        mockFetch.mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: async () => (return_value),
        });
        mockFilterReports.mockReturnValue([{ fiscalDateEnding: "2024-01-01", netIncome: "1000" }]);
        mockGetPercentChange.mockReturnValue(0);
        render(
            <MemoryRouter>
                <NetIncomeGraph symbol="AAPL" fetchVersion={0} setSymbol={mockSetSymbol} period="annually"></NetIncomeGraph>
            </MemoryRouter>
        );
        await waitFor(() => {
            expect(mockFetch).toHaveBeenCalledWith(
                "http://localhost:8000/pages/income-statement",
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
        const title = await screen.findByText("Net Income");
        expect(title).toBeInTheDocument();
        expect(mockFilterReports).toHaveBeenCalledTimes(1);
        expect(mockGetPercentChange).toHaveBeenCalledTimes(1);
    });

    test("update graph if symbol or fetchVersion changes", async () => {
        const firstReturnValue = {
            annualReports: [
                { fiscalDateEnding: "2024-01-01", netIncome: "1000" }
            ],
            quarterlyReports: [
                { fiscalDateEnding: "2024-01-01", netIncome: "1000" }
            ],
        }
        mockFetch.mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: async () => (firstReturnValue),
        });

        mockFilterReports.mockReturnValue([{ fiscalDateEnding: "2024-01-01", netIncome: "1000" }]);
        mockGetPercentChange.mockReturnValue(0);

        const { rerender } = render(
            <MemoryRouter>
                <NetIncomeGraph symbol="AAPL" fetchVersion={0} setSymbol={mockSetSymbol} period="annually"></NetIncomeGraph>
            </MemoryRouter>
        );
        await waitFor(() => {
            expect(mockFetch).toHaveBeenCalledWith(
                "http://localhost:8000/pages/income-statement",
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
                { fiscalDateEnding: "2024-01-01", netIncome: "2000" }
            ],
            quarterlyReports: [
                { fiscalDateEnding: "2024-01-01", netIncome: "2000" }
            ],
        }

        mockFetch.mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: async () => (secondReturnValue),
        });

        mockFilterReports.mockReturnValue([{ fiscalDateEnding: "2024-01-01", netIncome: "2000" }]);
        mockGetPercentChange.mockReturnValue(0);

        rerender(
            <MemoryRouter>
                <NetIncomeGraph symbol="TSLA" fetchVersion={1} setSymbol={mockSetSymbol} period="annually"></NetIncomeGraph>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(mockFetch).toHaveBeenCalledWith(
                "http://localhost:8000/pages/income-statement",
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
        const title = await screen.findByText("Net Income");
        expect(title).toBeInTheDocument();
        expect(mockFilterReports).toHaveBeenCalledTimes(2);
        expect(mockGetPercentChange).toHaveBeenCalledTimes(2);

        const thirdReturnValue = {
            annualReports: [
                { fiscalDateEnding: "2024-01-01", netIncome: "3000" }
            ],
            quarterlyReports: [
                { fiscalDateEnding: "2024-01-01", netIncome: "3000" }
            ],
        }
        
        mockFetch.mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: async () => (thirdReturnValue),
        });

        mockFilterReports.mockReturnValue([{ fiscalDateEnding: "2024-01-01", netIncome: "3000" }]);
        mockGetPercentChange.mockReturnValue(0);

        rerender(
            <MemoryRouter>
                <NetIncomeGraph symbol="TSLA" fetchVersion={2} setSymbol={mockSetSymbol} period="annually"></NetIncomeGraph>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(mockFetch).toHaveBeenCalledWith(
                "http://localhost:8000/pages/income-statement",
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
        
        expect(await screen.findByText("Net Income")).toBeInTheDocument();
        expect(mockFilterReports).toHaveBeenCalledTimes(3);
        expect(mockGetPercentChange).toHaveBeenCalledTimes(3);
    });

});