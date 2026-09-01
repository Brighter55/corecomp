import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useState, useMemo } from "react";
import { X } from "lucide-react";
import { filterReports, getPercentChange, formatToUnits } from "../../helpers/GraphsHelper.js"
import GraphCard from "./GraphCard.jsx"
import Explanation from "./Explanation.jsx"
import TimeRanges from "./TimeRanges.jsx"
import { Card, CardContent } from "@/components/ui/card";

const explanation = (
    <div className="space-y-3">
        <p className="text-sm font-bold text-[var(--text-main)]">What is it?</p>
        <p className="text-sm text-[var(--text-main)]">
            This grouped bar chart compares operating cash flow with net income for each period.
            It helps show whether accounting profit is supported by cash generated from core operations.
        </p>
    </div>
)

function TooltipContent({ active, payload, label }) {
    if (!active || !payload || payload.length === 0) {
        return null;
    }

    const operatingCashflow = Number(payload.find((item) => item.dataKey === "operatingCashflow")?.value);
    const netIncome = Number(payload.find((item) => item.dataKey === "netIncome")?.value);

    return (
        <Card className="min-w-[12rem] rounded-md border border-[var(--main-dry-sage)] bg-[var(--bg-main)] p-2 shadow-none">
            <CardContent className="space-y-1 p-0 text-sm">
                {label}
                <p className="text-[#588157]">
                Operating Cash Flow: {formatToUnits(operatingCashflow)}
                </p>
                <p className="text-[#bc4749]">
                Net Income: {formatToUnits(netIncome)}
                </p>
            </CardContent>
        </Card>
    );
}


function NetIncomeVsOcfGraph({ statement, period }) {
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

    const operatingCashflowPercentChange = useMemo(() => {
        if (reports.length === 0) {
            return NaN;
        }
        return getPercentChange(reports, "operatingCashflow");
    }, [reports]);

    const netIncomePercentChange = useMemo(() => {
        if (reports.length === 0) {
            return NaN;
        }
        return getPercentChange(reports, "netIncome");
    }, [reports]);

    if (statement === null) {
        return (
            <div className="flex-1">
                <div className="h-80 w-full min-w-[21rem] animate-pulse rounded-[10px] bg-[rgba(163,177,138,0.25)] sm:h-[25rem]" />
            </div>
        );
    }
    if (Array.isArray(statement) && statement.length === 0) {
        return null;
    }

    return (
        <div className="flex-1">
            <GraphCard graphClicked={graphClicked}>
                <div className="flex flex-wrap items-center gap-3 px-2 pt-2 sm:flex-nowrap">
                    <div className="flex min-w-0 flex-1 items-center justify-center gap-2 text-center">
                        <h3 className="text-lg font-semibold text-[var(--text-main)]">Net Income Vs OCF</h3>
                        <Explanation explanation={explanation} />
                    </div>
                    <div className="ml-auto flex items-center gap-2">
                        <p className="text-lg font-semibold text-[#588157]">
                        {isNaN(operatingCashflowPercentChange) ? "N/A" : (operatingCashflowPercentChange >= 0 ? `+${operatingCashflowPercentChange}%` : `${operatingCashflowPercentChange}%`)}
                        </p>
                        <p className="text-lg font-semibold text-[#bc4749]">
                        {isNaN(netIncomePercentChange) ? "N/A" : (netIncomePercentChange >= 0 ? `+${netIncomePercentChange}%` : `${netIncomePercentChange}%`)}
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
                            <CartesianGrid strokeDasharray="" vertical={false} stroke="var(--main-dry-sage)"/>
                            <XAxis dataKey="fiscalDateEnding" interval="equidistantPreserveStart" stroke="var(--text-main)" tick={{fontSize: 12}} />
                            <YAxis tickFormatter={(value) => formatToUnits(value)} stroke="var(--text-main)" domain={[dataMin => dataMin * 0.95, dataMax => dataMax * 1.05]} />
                            <Tooltip content={<TooltipContent />} />
                            <Legend />
                            <Bar name="Operating Cash Flow" dataKey="operatingCashflow" fill="#588157" activeBar={{ fill: "#A3B18A", stroke: "#DAD7CD", strokeWidth: 2 }} />
                            <Bar name="Net Income" dataKey="netIncome" fill="#bc4749" activeBar={{ fill: "#B35C5E", stroke: "#DAD7CD", strokeWidth: 2 }} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </GraphCard>
        </div>
    )
}


export default NetIncomeVsOcfGraph