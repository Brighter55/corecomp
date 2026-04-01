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


const explanation = (
    <Stack spacing={2}>
        <Typography variant="explanationTopic">What is it?</Typography>
        <Typography variant="explanationText">
            Retained earnings are cumulative profits the company has kept in the business after dividends, while common stock reflects the capital raised from issuing shares.
        </Typography>
        <Typography variant="explanationTopic">Calculation</Typography>
        <Typography
            variant="explanationText"
            sx={{ fontFamily: "'Times New Roman', Times, 'Segoe Ui', Arial, sans-serif" }}
        >
            Retained Earnings = Prior Retained Earnings + Net Income - Dividends
        </Typography>
        <Typography
            variant="explanationText"
            sx={{ fontFamily: "'Times New Roman', Times, 'Segoe Ui', Arial, sans-serif" }}
        >
            Common Stock = Shares Issued * Par Value
        </Typography>
        <Typography variant="explanationTopic">Interpretation</Typography>
        <Stack direction="row" spacing={1}>
            <TrendingUpIcon
                sx={{ color: "green", bgcolor: "white", borderRadius: "10px" }}
            />
            <Typography variant="explanationText">
                Rising retained earnings usually indicate the company is compounding profits and reinvesting internally.
            </Typography>
        </Stack>
        <Stack direction="row" spacing={1}>
            <TrendingDownIcon
                sx={{ color: "red", bgcolor: "white", borderRadius: "10px" }}
            />
            <Typography variant="explanationText">
                Falling retained earnings can signal weaker profitability, higher payouts, or one-time balance sheet pressure.
            </Typography>
        </Stack>
        <Stack direction="row" spacing={1}>
            <TrendingUpIcon
                sx={{ color: "green", bgcolor: "white", borderRadius: "10px" }}
            />
            <Typography variant="explanationText">
                Rising common stock often means the company issued additional shares to raise capital.
            </Typography>
        </Stack>
        <Stack direction="row" spacing={1}>
            <TrendingDownIcon
                sx={{ color: "red", bgcolor: "white", borderRadius: "10px" }}
            />
            <Typography variant="explanationText">
                Falling common stock is less common and may reflect capital restructuring or reporting adjustments.
            </Typography>
        </Stack>
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
                        <Typography variant="h6" textAlign="center">Retained Earnings v Common Stock</Typography>
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
                                name="Common Stock"
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
