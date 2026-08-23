import { useState, useMemo } from "react";
import { BarChart, Bar, Rectangle, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import GraphCard from "./GraphCard.jsx"
import GraphTitle from "./GraphTitle.jsx"
import NoDataGraph from "./NoDataGraph.jsx"
import {filterReports, getPercentChange} from "../../helpers/GraphsHelper.js"
import { TrendingUp, TrendingDown } from "lucide-react";

const explanation = (
    <div className="space-y-3">
        <p className="text-sm font-bold text-[var(--text-main)]">What is it?</p>
        <p className="text-sm text-[var(--text-main)]">
            A dividend payout is the distribution of a portion of a company's earnings to its shareholders. Companies use dividends to reward investors, typically in cash, on a quarterly basis, though some pay monthly or annually. The amount received by a shareholder depends on the number of shares owned and the dividend declared per share.
        </p>
        <p className="text-sm font-bold text-[var(--text-main)]">Interpretation</p>
        <div className="flex items-start gap-2">
            <TrendingUp className="mt-0.5 w-10 rounded-md text-green-600" />
            <p className="text-sm text-[var(--text-main)]">
                A steady or increasing DPS suggests a company is generating strong profits and has the cash flow to distribute to its shareholders.
            </p>
        </div>
        <div className="flex items-start gap-2">
            <TrendingDown className="mt-0.5 w-10 rounded-md text-red-600" />
            <p className="text-sm text-[var(--text-main)]">
                A lower DPS might mean the company is prioritizing reinvesting its earnings back into the business to fuel future growth
            </p>
        </div>
        <p className="text-sm text-[var(--text-main)]">
            A history of consistent or growing DPS can indicate a reliable income source.
        </p>
        <p className="text-sm text-[var(--text-main)]">
            A significant reduction or elimination of dividends can be a warning sign to financial hardship, declining profits, or a change in management's priorities.
        </p>
    </div>
)

function DividendsPayoutGraph({ statement, period }) {
    const [timeRange, setTimeRange] = useState("all");
    const [graphClicked, setGraphClicked] = useState(false);

    const reports = useMemo(() => {
        if (!statement) return [];
        if (Array.isArray(statement) && statement.length === 0) return [];

        return filterReports(statement["data"] ?? [], timeRange, "ex_dividend_date");
    }, [statement, timeRange, period]);

    const percentChange = useMemo(() => {
        if (reports.length === 0) {
            return NaN;
        }
        const percentChange = getPercentChange(reports, "amount");
        return percentChange;
    }, [reports]);

    // Keep only rows with a usable dividend amount so non-payers (empty "data" or
    // all-"None" amounts) render a "No data" card instead of a hollow chart.
    const chartData = useMemo(
        () =>
            reports.filter((report) => {
                const raw = report.amount;
                if (raw === null || raw === undefined) return false;
                if (typeof raw === "string" && (raw.trim().toLowerCase() === "none" || raw.trim() === "")) {
                    return false;
                }
                return Number.isFinite(Number(raw));
            }),
        [reports]
    );

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
    if (chartData.length === 0) {
        return <NoDataGraph />;
    }

    return (
        <div className="flex-1">
            <GraphCard graphClicked={graphClicked}>
                <GraphTitle
                    title="Dividend Payouts"
                    explanation={explanation}
                    percentChange={percentChange}
                    timeRange={timeRange}
                    setTimeRange={setTimeRange}
                    graphClicked={graphClicked}
                    setGraphClicked={setGraphClicked}
                />
                <div onClick={() => {setGraphClicked(true);}} className="min-h-0 w-full flex-1">
                    <ResponsiveContainer>
                        <BarChart
                            data={chartData}
                            margin={{
                            top: 5,
                            right: 30,
                            left: 20,
                            bottom: 5,
                            }}
                        >
                            <CartesianGrid strokeDasharray="" vertical={false} stroke="var(--main-dry-sage)" />
                            <XAxis dataKey="ex_dividend_date" interval="equidistantPreserveStart" stroke="var(--text-main)" tick={{fontSize: 12}}/>
                            <YAxis stroke="var(--text-main)" tickFormatter={(value) => (Number.isFinite(Number(value)) ? `$${value}` : "--")}/>
                            <Tooltip formatter={(value) => (Number.isFinite(Number(value)) ? `$${value}` : "--")}/>
                            <Bar dataKey="amount" fill="#588157" activeBar={<Rectangle fill="#A3B18A"/>}/>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </GraphCard>
        </div>
    )
}

export default DividendsPayoutGraph
