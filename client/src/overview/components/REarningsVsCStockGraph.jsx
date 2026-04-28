import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useState, useMemo } from "react";
import { X } from "lucide-react";
import { filterReports, getPercentChange, formatToUnits } from "../../helpers/GraphsHelper.js";
import GraphCard from "./GraphCard.jsx";
import NoDataGraph from "./NoDataGraph.jsx";
import Explanation from "./Explanation.jsx";
import TimeRanges from "./TimeRanges.jsx";
// mui
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';

/*commonStock is APIC included */

const explanation = (
    <Stack spacing={2}>
        <Typography variant="explanationTopic">What is it?</Typography>
        <Typography variant="explanationText">
            Retained earnings are the cumulative net profits a company keeps and reinvests rather than distributing to shareholders as dividends.
        </Typography>
        <Typography variant="explanationText">
            Paid-in Capital is the total amount of cash or assets a company receives from investors in exchange for stock
        </Typography>
        <Typography variant="explanationTopic">Calculation</Typography>
        <Typography
            variant="explanationText"
            sx={{ fontFamily: "'Times New Roman', Times, 'Segoe Ui', Arial, sans-serif" }}
        >
            Ending Retained Earnings = Beginning Retained Earnings + Net Income/Loss - Dividends
        </Typography>
        <Typography
            variant="explanationText"
            sx={{ fontFamily: "'Times New Roman', Times, 'Segoe Ui', Arial, sans-serif" }}
        >
            Paid-in Capital = Common Stock + Additional Paid-In Capital (APIC)
        </Typography>
        <Typography variant="explanationTopic">Interpretation</Typography>
        <Stack direction="row" spacing={1}>
            <TrendingUpIcon
                sx={{ color: "green", bgcolor: "white", borderRadius: "10px" }}
            />
            <Typography variant="explanationText">
                Rising Retained Earnings: Indicates profitability and potential for reinvestment or future dividends, signifying a mature or growing company.
            </Typography>
        </Stack>
        <Stack direction="row" spacing={1}>
            <TrendingDownIcon
                sx={{ color: "red", bgcolor: "white", borderRadius: "10px" }}
            />
            <Typography variant="explanationText">
                Negative/Falling Retained Earnings: Signals accumulated net losses or high dividend payouts exceeding earnings, often showing a startup phase or financial distress.
            </Typography>
        </Stack>
        <Stack direction="row" spacing={1}>
            <TrendingUpIcon
                sx={{ color: "green", bgcolor: "white", borderRadius: "10px" }}
            />
            <Typography variant="explanationText">
                Rising Paid-in Capital (Step-ups): Usually represents new stock offerings or investment rounds. High, steady paid-in capital alongside low retained earnings suggests a startup or capital-intensive business.
            </Typography>
        </Stack>
        <Typography variant="explanationText">
            Widening Gap (Earnings &gt; Paid-in): Suggests the company is self-sustaining and creating value internally, rather than relying on external investors.
        </Typography>
    </Stack>
);


function REarningsVsCStock({ statement, period }) {
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

    const retainedEarningsPercentChange = useMemo(() => {
        if (reports.length === 0) {
            return NaN;
        }
        return getPercentChange(reports, "retainedEarnings");
    }, [reports]);

    const commonStockPercentChange = useMemo(() => {
        if (reports.length === 0) {
            return NaN;
        }
        return getPercentChange(reports, "commonStock");
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
                        <h3 className="text-lg font-semibold text-[var(--text-main)]">Retained Earnings vs Paid-in Capital</h3>
                        <Explanation explanation={explanation} />
                    </div>
                    <div className="ml-auto flex items-center gap-2">
                        <p className="text-lg font-semibold text-[#588157]">
                        {isNaN(retainedEarningsPercentChange)
                            ? "N/A"
                            : (retainedEarningsPercentChange >= 0
                                ? `+${retainedEarningsPercentChange}%`
                                : `${retainedEarningsPercentChange}%`)}
                        </p>
                        <p className="text-lg font-semibold text-[#bc4749]">
                        {isNaN(commonStockPercentChange)
                            ? "N/A"
                            : (commonStockPercentChange >= 0
                                ? `+${commonStockPercentChange}%`
                                : `${commonStockPercentChange}%`)}
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
                            <YAxis
                                tickFormatter={(value) => formatToUnits(value)}
                                stroke="var(--text-main)"
                                domain={[dataMin => dataMin * 0.95, dataMax => dataMax * 1.05]}
                            />
                            <Tooltip formatter={(value) => formatToUnits(value)} />
                            <Legend />
                            <Line
                                type="linear"
                                name="Retained Earnings"
                                dataKey="retainedEarnings"
                                stroke="#588157"
                                strokeWidth={2}
                                dot={true}
                                activeDot={{ r: 4, fill: "#A3B18A" }}
                            />
                            <Line
                                type="linear"
                                name="Paid-in Capital"
                                dataKey="commonStock"
                                stroke="#bc4749"
                                strokeWidth={2}
                                dot={true}
                                activeDot={{ r: 4, fill: "#B35C5E" }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </GraphCard>
        </div>
    );
}


export default REarningsVsCStock;
