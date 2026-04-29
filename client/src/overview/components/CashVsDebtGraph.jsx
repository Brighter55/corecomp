import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useState, useMemo } from "react";
import { X } from "lucide-react";
import {filterReports, getPercentChange, formatToUnits} from "../../helpers/GraphsHelper.js"
import GraphCard from "./GraphCard.jsx"
import NoDataGraph from "./NoDataGraph.jsx"
import Explanation from "./Explanation.jsx"
import TimeRanges from "./TimeRanges.jsx"
import { TrendingUp, TrendingDown } from "lucide-react";


const explanation = (
    <div className="space-y-3">
        <p className="text-sm font-bold text-[var(--text-main)]">What is it?</p>
        <p className="text-sm text-[var(--text-main)]">
            Cash and Cash Equivalents At Carrying Value is liquid assets (things a company can easily convert to cash, such as cash on hand, bank accounts, marketable securities like stocks and bonds, and accounts receivable) the company owns.
        </p>
        <p className="text-sm text-[var(--text-main)]">
            Debt is money borrowed and owed to others, typically with interest
        </p>
        <p className="text-sm font-bold text-[var(--text-main)]">Calculation</p>
        <p className="text-sm font-mono text-[var(--text-main)]">
            Cash = Cash + Current bank accounts + Short-Term, Liquid Securities
        </p>
        <p className="text-sm font-mono text-[var(--text-main)]">
            Debt = Short Term Debt + Long Term Debt
        </p>
        <p className="text-sm font-bold text-[var(--text-main)]">Interpretation</p>
        <div className="flex items-start gap-2">
            <TrendingUp className="mt-0.5 w-10 rounded-md text-green-600" />
            <p className="text-sm text-[var(--text-main)]">
                Cash Uptrend is when a company is generating more cash than it is spending (positive cash flow) or raising funds through new investments/financing. This is usually a strong positive sign, indicating stability and resources for future growth.
            </p>
        </div>
        <div className="flex items-start gap-2">
            <TrendingDown className="mt-0.5 w-10 rounded-md text-red-600" />
            <p className="text-sm text-[var(--text-main)]">
                Cash Downtrend is when a company is burning through its cash reserves faster than it is generating new cash (negative cash flow). This is often a warning sign of operational or liquidity issues, though it could also be a temporary result of a large strategic investment.
            </p>
        </div>
        <div className="flex items-start gap-2">
            <TrendingUp className="mt-0.5 w-10 rounded-md text-green-600" />
            <p className="text-sm text-[var(--text-main)]">
                Debt Uptrend is wheb a company is taking on more debt. This can be a strategic positive if the money is used to fund profitable expansions, but it becomes a negative if the company cannot manage the increased interest payments or faces difficulty repaying the principal.
            </p>
        </div>
        <div className="flex items-start gap-2">
            <TrendingDown className="mt-0.5 w-10 rounded-md text-red-600" />
            <p className="text-sm text-[var(--text-main)]">
                Debt Downtrend is when a company is paying down its existing debt. This is generally a very positive sign, as it reduces financial risk, lowers interest expenses, and improves long-term financial stability.
            </p>
        </div>
    </div>
)

function CashVsDebtGraph({ statement, period }) {
    const [timeRange, setTimeRange] = useState("all");
    const [graphClicked, setGraphClicked] = useState(false);

    const reports = useMemo(() => {
        if (!statement) return [];
        if (Array.isArray(statement) && statement.length === 0) return [];

        return filterReports(
            statement[period === "annually" ? "annualReports" : "quarterlyReports"] ?? [],
            timeRange,
            "fiscalDateEnding"
        );
    }, [statement, timeRange, period]);

    const cashPercentChange = useMemo(() => {
        if (reports.length === 0) {
            return NaN;
        }
        const cashPercentChange = getPercentChange(reports, "cashAndCashEquivalentsAtCarryingValue");
        return cashPercentChange;
    }, [reports]);

    const debtPercentChange = useMemo(() => {
        if (reports.length === 0) {
            return NaN;
        }
        const debtPercentChange = getPercentChange(reports, "shortLongTermDebtTotal");
        return debtPercentChange;
    }, [reports]);

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
                        <h3 className="text-lg font-semibold text-[var(--text-main)]">Cash V Debt</h3>
                        <Explanation explanation={explanation} />
                    </div>
                    <div className="ml-auto flex items-center gap-2">
                        <p className="text-lg font-semibold text-[#588157]">
                        {isNaN(cashPercentChange) ? "N/A" : (cashPercentChange >= 0 ? `+${cashPercentChange}%` : `${cashPercentChange}%`)}
                        </p>
                        <p className="text-lg font-semibold text-[#bc4749]">
                        {isNaN(debtPercentChange) ? "N/A" : (debtPercentChange >= 0 ? `+${debtPercentChange}%` : `${debtPercentChange}%`)}
                        </p>
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
                <div onClick={() => {setGraphClicked(true);}} className="min-h-0 w-full flex-1">
                    <ResponsiveContainer>
                        <BarChart
                            data={reports}
                            margin={{
                            top: 5,
                            right: 30,
                            left: 20,
                            bottom: 5,
                            }}
                        >
                            <CartesianGrid  strokeDasharray="" vertical={false} stroke="var(--main-dry-sage)"/>
                            <XAxis dataKey="fiscalDateEnding" stroke="var(--text-main)" interval="equidistantPreserveStart" tick={{fontSize: 12}} />
                            <YAxis 
                                tickFormatter={(value) => formatToUnits(value)}
                                stroke="var(--text-main)"
                                domain={[dataMin => dataMin * 0.95, dataMax => dataMax * 1.05]}
                            />
                            <Tooltip formatter={(value) => formatToUnits(value)}/>
                            <Legend />
                            <Bar name="cash" dataKey="cashAndCashEquivalentsAtCarryingValue" stackId="a" fill="#588157"  activeBar={{ fill: "#A3B18A", stroke: "#DAD7CD", strokeWidth: 2 }}/>
                            <Bar name="debt" dataKey="shortLongTermDebtTotal" stackId="b" fill="#bc4749" activeBar={{ fill: "#B35C5E", stroke: "#DAD7CD", strokeWidth: 2 }}/>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </GraphCard>
        </div>
    )
}


export default CashVsDebtGraph
