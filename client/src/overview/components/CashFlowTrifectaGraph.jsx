import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from 'recharts';
import { useState, useMemo } from "react";
import { X } from "lucide-react";
import { filterReports, formatToUnits } from "../../helpers/GraphsHelper.js";
import GraphCard from "./GraphCard.jsx";
import NoDataGraph from "./NoDataGraph.jsx";
import Explanation from "./Explanation.jsx";
import TimeRanges from "./TimeRanges.jsx";
import { TrendingUp, TrendingDown } from "lucide-react";

const explanation = (
    <div className="space-y-4">
        <p className="text-sm font-bold text-[var(--text-main)]">What is it?</p>
        <p className="text-sm text-[var(--text-main)]">
            Cash Flow Trifecta combines operating, investing, and financing cash flows into one view so you can compare the full cash picture for each period.
        </p>
        <p className="text-sm font-bold text-[var(--text-main)]">Interpretation</p>
        <div className="space-y-4">
            <div className="space-y-2">
                <p className="text-base font-semibold text-[var(--text-main)]">Startup / Growth Stage</p>
                <div className="space-y-2 pl-2">
                    <div className="flex items-start gap-2">
                        <TrendingDown className="mt-0.5 w-10 flex-shrink-0 rounded-md text-red-600" />
                        <div>
                            <p className="text-sm font-semibold text-[var(--text-main)]">OCF: Negative/low</p>
                            <p className="text-sm text-[var(--text-main)]">Not profitable yet, high expenses</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-2">
                        <TrendingDown className="mt-0.5 w-10 flex-shrink-0 rounded-md text-red-600" />
                        <div>
                            <p className="text-sm font-semibold text-[var(--text-main)]">ICF: Strongly negative</p>
                            <p className="text-sm text-[var(--text-main)]">Heavy investment for growth</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-2">
                        <TrendingUp className="mt-0.5 w-10 flex-shrink-0 rounded-md text-green-600" />
                        <div>
                            <p className="text-sm font-semibold text-[var(--text-main)]">CFF: Strongly positive</p>
                            <p className="text-sm text-[var(--text-main)]">Raising cash (debt/equity) to fund losses</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-2">
                <p className="text-base font-semibold text-[var(--text-main)]">Mature Stage</p>
                <div className="space-y-2 pl-2">
                    <div className="flex items-start gap-2">
                        <TrendingUp className="mt-0.5 w-10 flex-shrink-0 rounded-md text-green-600" />
                        <div>
                            <p className="text-sm font-semibold text-[var(--text-main)]">OCF: Strong positive</p>
                            <p className="text-sm text-[var(--text-main)]">Stable, cash-generating business</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-2">
                        <TrendingDown className="mt-0.5 w-10 flex-shrink-0 rounded-md text-red-600" />
                        <div>
                            <p className="text-sm font-semibold text-[var(--text-main)]">ICF: Moderately negative</p>
                            <p className="text-sm text-[var(--text-main)]">Maintenance + small investments</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-2">
                        <TrendingDown className="mt-0.5 w-10 flex-shrink-0 rounded-md text-red-600" />
                        <div>
                            <p className="text-sm font-semibold text-[var(--text-main)]">CFF: Negative</p>
                            <p className="text-sm text-[var(--text-main)]">Returning cash (dividends, buybacks, debt repayment)</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-2">
                <p className="text-base font-semibold text-[var(--text-main)]">Declining Stage</p>
                <div className="space-y-2 pl-2">
                    <div className="flex items-start gap-2">
                        <TrendingDown className="mt-0.5 w-10 flex-shrink-0 rounded-md text-red-600" />
                        <div>
                            <p className="text-sm font-semibold text-[var(--text-main)]">OCF: Weak/negative</p>
                            <p className="text-sm text-[var(--text-main)]">Shrinking business</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-2">
                        <TrendingUp className="mt-0.5 w-10 flex-shrink-0 rounded-md text-green-600" />
                        <div>
                            <p className="text-sm font-semibold text-[var(--text-main)]">ICF: Positive</p>
                            <p className="text-sm text-[var(--text-main)]">Selling assets</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-2">
                        <TrendingDown className="mt-0.5 w-10 flex-shrink-0 rounded-md text-red-600" />
                        <div>
                            <p className="text-sm font-semibold text-[var(--text-main)]">CFF: Mixed</p>
                            <p className="text-sm text-[var(--text-main)]">Raising cash to survive or paying down remaining obligations</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
);
function CashFlowTrifectaGraph({ statement, period }) {
    const [timeRange, setTimeRange] = useState("all");
    const [graphClicked, setGraphClicked] = useState(false);

    const reports = useMemo(() => {
        if (!statement) return [];
        if (Array.isArray(statement) && statement.length === 0) return [];

        return filterReports(
            statement[period === "annually" ? "annualReports" : "quarterlyReports"] ?? [],
            timeRange,
            "fiscalDateEnding",
        );
    }, [statement, timeRange, period]);

    if (statement === null) {
        return (
            <div className="flex-1">
                <div className="h-80 w-full min-w-[21rem] animate-pulse rounded-[10px] bg-[rgba(163,177,138,0.25)] sm:h-[25rem]" />
            </div>
        );
    }
    if (Array.isArray(statement) && statement.length === 0) {
        return <NoDataGraph />;
    }

    return (
        <div className="flex-1">
            <GraphCard graphClicked={graphClicked}>
                <div className="flex flex-wrap items-center gap-3 px-2 pt-2 sm:flex-nowrap">
                    <div className="flex min-w-0 flex-1 items-center justify-center gap-2 text-center">
                        <h3 className="text-lg font-semibold text-[var(--text-main)]">Cash Flow Trifecta</h3>
                        <Explanation explanation={explanation} />
                    </div>
                    <div className="ml-auto flex items-center gap-2">
                        <TimeRanges timeRange={timeRange} setTimeRange={setTimeRange} />
                        {graphClicked && (
                            <button
                                type="button"
                                aria-label="Close graph"
                                onClick={() => setGraphClicked(false)}
                                className="inline-flex h-7 w-7 items-center justify-center rounded-full text-[var(--text-main)] transition-colors hover:bg-[var(--main-brick)]"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        )}
                    </div>
                </div>
                <div onClick={() => { setGraphClicked(true); }} className="min-h-0 w-full flex-1">
                    <ResponsiveContainer>
                        <LineChart
                            data={reports}
                            margin={{
                                top: 5,
                                right: 30,
                                left: 20,
                                bottom: 5,
                            }}
                        >
                            <CartesianGrid strokeDasharray="" vertical={false} stroke="var(--main-dry-sage)" />
                            <XAxis dataKey="fiscalDateEnding" interval="equidistantPreserveStart" stroke="var(--text-main)" tick={{ fontSize: 12 }} />
                            <YAxis tickFormatter={(value) => formatToUnits(value)} stroke="var(--text-main)" domain={[dataMin => dataMin * 0.95, dataMax => dataMax * 1.05]} />
                            <Tooltip formatter={(value) => formatToUnits(value)} />
                            <Legend />
                            <ReferenceLine y={0} stroke="var(--text-main)" strokeWidth={2} strokeDasharray="3 3" />
                            <Line name="Operating Cash Flow" dataKey="operatingCashflow" stroke="#3A5A40" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} type="monotone" />
                            <Line name="Cashflow from Investment" dataKey="cashflowFromInvestment" stroke="#588157" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} type="monotone" />
                            <Line name="Cashflow from Financing" dataKey="cashflowFromFinancing" stroke="#bc4749" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} type="monotone" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </GraphCard>
        </div>
    );
}

export default CashFlowTrifectaGraph;