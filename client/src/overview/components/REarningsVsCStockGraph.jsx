import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useState, useEffect, useRef, useMemo } from "react";
import { filterReports, getPercentChange, formatToUnits } from "../../helpers/GraphsHelper.js";
import GraphCard from "./GraphCard.jsx";
import NoDataGraph from "./NoDataGraph.jsx";
import Explanation from "./Explanation.jsx";
import TimeRanges from "./TimeRanges.jsx";
// mui
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Skeleton from '@mui/material/Skeleton';

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

    const graphRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (graphRef.current && !graphRef.current.contains(event.target)) {
                setGraphClicked(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const reports = useMemo(() => {
        if (!statement) return [];
        if (Array.isArray(statement) && statement.length === 0) return [];

        return filterReports(statement[period === "annually" ? "annualReports" : "quarterlyReports"], timeRange, "fiscalDateEnding");
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
        return <Skeleton variant="rounded" sx={{ flex: 1, height: "20rem" }} />;
    }
    if (Array.isArray(statement) && statement.length === 0) {
        return <NoDataGraph />;
    }

    return (
        <Box sx={{ flex: 1 }}>
            <GraphCard ref={graphRef} graphClicked={graphClicked}>
                <Stack direction="row" sx={{ alignItems: "center" }}>
                    <Stack
                        direction="row"
                        sx={{ alignItems: "center", flexGrow: 1, justifyContent: "center" }}
                        spacing={1}
                    >
                        <Typography variant="h6" textAlign="center">Retained Earnings vs Paid-in Capital</Typography>
                        <Explanation explanation={explanation} />
                    </Stack>
                    <Typography
                        variant="h6"
                        sx={{
                            color: "var(--main-hunter-green)",
                        }}
                    >
                        {isNaN(retainedEarningsPercentChange)
                            ? "N/A"
                            : (retainedEarningsPercentChange >= 0
                                ? `+${retainedEarningsPercentChange}%`
                                : `${retainedEarningsPercentChange}%`)}
                    </Typography>
                    <Typography
                        variant="h6"
                        sx={{
                            color: "var(--main-brick)",
                        }}
                    >
                        {isNaN(commonStockPercentChange)
                            ? "N/A"
                            : (commonStockPercentChange >= 0
                                ? `+${commonStockPercentChange}%`
                                : `${commonStockPercentChange}%`)}
                    </Typography>
                    <TimeRanges timeRange={timeRange} setTimeRange={setTimeRange} />
                </Stack>
                <Box onClick={() => { setGraphClicked(true); }} sx={{ width: "100%", height: "100%" }}>
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
                            <CartesianGrid strokeDasharray="" vertical={false} stroke="#A3B18A" />
                            <XAxis dataKey="fiscalDateEnding" interval="equidistantPreserveStart" stroke="#344E41" tick={{ fontSize: 12 }} />
                            <YAxis
                                tickFormatter={(value) => formatToUnits(value)}
                                stroke="#344E41"
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
                </Box>
            </GraphCard>
        </Box>
    );
}


export default REarningsVsCStock;
