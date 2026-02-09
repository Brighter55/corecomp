import TotalRevenueGraph from "./TotalRevenueGraph.jsx"
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from "react-router-dom";

const mockFetch = vi.fn();
const mockSetSymbol = vi.fn();

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

describe("TotalRevenueGraph", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    test("loads up properly", async () => {
        const return_value = {
            annualReports: [
                { fiscalDateEnding: "2024-01-01", totalRevenue: "1000" }
            ],
            quarterlyReports: [
                { fiscalDateEnding: "2024-01-01", totalRevenue: "1000" }
            ],
        }
        mockFetch.mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: async () => (return_value),
        });
        render(
            <MemoryRouter>
                <TotalRevenueGraph symbol="AAPL" fetchVersion={0} setSymbol={mockSetSymbol} period={"annually"}></TotalRevenueGraph>
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
        const title = await screen.findByText("Revenue");
        expect(title).toBeInTheDocument();
    });

    test("update graph if symbol changes", async () => {
        const return_value = {
            annualReports: [
                { fiscalDateEnding: "2024-01-01", totalRevenue: "1000" }
            ],
            quarterlyReports: [
                { fiscalDateEnding: "2024-01-01", totalRevenue: "1000" }
            ],
        }
        mockFetch.mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: async () => (return_value),
        });
        const { rerender } = render(
            <MemoryRouter>
                <TotalRevenueGraph symbol="AAPL" fetchVersion={0} setSymbol={mockSetSymbol} period={"annually"}></TotalRevenueGraph>
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

        const updatedReturnValue = {
            annualReports: [
                { fiscalDateEnding: "2024-01-01", totalRevenue: "2000" }
            ],
            quarterlyReports: [
                { fiscalDateEnding: "2024-01-01", totalRevenue: "2000" }
            ],
        }
        mockFetch.mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: async () => (updatedReturnValue),
        });
        rerender(
            <MemoryRouter>
                <TotalRevenueGraph symbol="TSLA" fetchVersion={1} setSymbol={mockSetSymbol} period={"annually"}></TotalRevenueGraph>
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
        const title = await screen.findByText("Revenue");
        expect(title).toBeInTheDocument();
    });
});