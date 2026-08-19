import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useState, useMemo } from "react";
import {filterReports, getPercentChange} from "../../helpers/GraphsHelper.js"
import GraphTitle from "./GraphTitle.jsx"
import GraphCard from "./GraphCard.jsx"
import NoDataGraph from "./NoDataGraph.jsx"
import { TrendingUp, TrendingDown } from "lucide-react";

const explanation = (
    <div className="space-y-3">
        <p className="text-sm font-bold text-[var(--text-main)]">What is it?</p>
        <p className="text-sm text-[var(--text-main)]">
            A measure of a company's profitability, showing how much profit is generated for each share of stock
        </p>
        <p className="text-sm font-bold text-[var(--text-main)]">Calculation</p>
        <p className="text-sm font-mono text-[var(--text-main)]">
            EPS = Net Income / # of outstanding shares
        </p>
        <p className="text-sm font-bold text-[var(--text-main)]">Interpretation</p>
        <div className="flex items-start gap-2">
            <TrendingUp className="mt-0.5 w-10 rounded-md text-green-600" />
            <p className="text-sm text-[var(--text-main)]">
                Upward trend in EPS generally signifies growing profitability, which can lead to a higher stock price and increased investor confidence.
            </p>
        </div>
        <div className="flex items-start gap-2">
            <TrendingDown className="mt-0.5 w-10 rounded-md text-red-600" />
            <p className="text-sm text-[var(--text-main)]">
                Downward trend in EPS signals declining profits, which often leads to a lower stock price and may indicate financial challenges.
            </p>
        </div>
    </div>
)

function EPSGraph({ statement, period }) {
    const [timeRange, setTimeRange] = useState("all");
    const [graphClicked, setGraphClicked] = useState(false);

    const reports = useMemo(() => {
        if (!statement) return [];
        if (Array.isArray(statement) && statement.length === 0) return [];

        return filterReports(
            statement[period === "annually" ? "annualEarnings" : "quarterlyEarnings"] ?? [],
            timeRange,
            "fiscalDateEnding"
        );
    }, [statement, timeRange, period]);

    const percentChange = useMemo(() => {
        if (reports.length === 0) {
            return NaN;
        }
        const percentChange = getPercentChange(reports, "reportedEPS");
        return percentChange;
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
        period === "quarterly" ? (
            <div className="flex-1">
                <GraphCard graphClicked={graphClicked}>
                    <GraphTitle
                        title="Earning per Share"
                        explanation={explanation}
                        percentChange={percentChange}
                        timeRange={timeRange}
                        setTimeRange={setTimeRange}
                        graphClicked={graphClicked}
                        setGraphClicked={setGraphClicked}
                    />
                    <div onClick={() => {setGraphClicked(true);}} className="min-h-0 w-full flex-1">
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
                            <CartesianGrid strokeDasharray="" vertical={false} stroke="var(--main-dry-sage)"/>
                            <XAxis dataKey="fiscalDateEnding" stroke="var(--text-main)" interval="equidistantPreserveStart" tick={{fontSize: 12}} />
                            <YAxis tickFormatter={(value) => `$${value.toFixed(2)}`} stroke="var(--text-main)" domain={[dataMin => dataMin * 0.95, dataMax => dataMax * 1.05]}/>
                            <Tooltip formatter={(value) => `$${value}`}/>
                            <Legend />
                            <Line name="reported EPS" type="monotone" dataKey="reportedEPS" stroke="#588157" strokeWidth={0} dot={{ fill: "#588157", r: 5}} activeDot={{ r: 8, fill: "#A3B18A"}} legendType="circle" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </GraphCard>
            </div>
        ) : (
            <div className="flex-1">
                <GraphCard graphClicked={graphClicked}>
                    <GraphTitle
                        title="Earning per Share"
                        explanation={explanation}
                        percentChange={percentChange}
                        timeRange={timeRange}
                        setTimeRange={setTimeRange}
                        graphClicked={graphClicked}
                        setGraphClicked={setGraphClicked}
                    />
                    <div onClick={() => {setGraphClicked(true);}} className="min-h-0 w-full flex-1">
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
                            <CartesianGrid strokeDasharray="" vertical={false} stroke="var(--main-dry-sage)"/>
                            <XAxis dataKey="fiscalDateEnding" stroke="var(--text-main)" interval="equidistantPreserveStart" tick={{fontSize: 12}} />
                            <YAxis tickFormatter={(value) => `$${value.toFixed(2)}`} stroke="var(--text-main)" domain={[dataMin => dataMin * 0.95, dataMax => dataMax * 1.05]}/>
                            <Tooltip formatter={(value) => `$${value}`}/>
                            <Legend />
                            <Line name="reported EPS" type="monotone" dataKey="reportedEPS" stroke="#588157" strokeWidth={0} dot={{ fill: "#588157", r: 5}} activeDot={{ r: 8, fill: "#A3B18A"}} legendType="circle" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </GraphCard>
            </div>
        )
    )
}

export default EPSGraph
