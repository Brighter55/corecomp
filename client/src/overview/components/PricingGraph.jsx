import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useState, useMemo } from "react";
import {filterReports, getPercentChange} from "../../helpers/GraphsHelper.js"
import GraphTitle from "./GraphTitle.jsx"
import GraphCard from "./GraphCard.jsx"
import NoDataGraph from "./NoDataGraph.jsx"
// mui
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';


const explanation = (
    <Stack spacing={2}>
        <Typography variant="explanationTopic">What is it?</Typography>
        <Typography variant="explanationText">
            Adjusted monthly pricing represents a company's stock price after accounting for corporate actions like stock splits and dividends, making historical prices comparable to current prices.
        </Typography>
        <Typography variant="explanationTopic">Example</Typography>
        <Typography variant="explanationText">
            Dividends: When a company pays a cash dividend, the stock price
            typically drops by the dividend amount on the ex-dividend date.
            The adjusted price accounts for this by subtracting the dividend
            amount from the closing prices on and before the ex-dividend date,
            making the pre-dividend prices comparable to the post-dividend prices.
        </Typography>
        <Typography variant="explanationText">
            Stock Splits: If a company has a 2-for-1 stock split, the share price immediately halves.
            To prevent a misleading vertical drop on the chart, all historical prices before the
            split date are divided by two when calculating the adjusted price.
        </Typography>
        <Typography variant="explanationTopic">Interpretation</Typography>
        <Stack direction="row" spacing={1}>
            <TrendingUpIcon
                sx={{ color: "green", bgcolor: "white", borderRadius: "10px",}}
            />
            <Typography variant="explanationText">
                An upward trend in the adjusted price means the stock's value has genuinely increased.
            </Typography>
        </Stack>
        <Stack direction="row" spacing={1}>
            <TrendingDownIcon
                sx={{ color: "red", bgcolor: "white", borderRadius: "10px",}}
            />
            <Typography variant="explanationText">
                A downward trend in the adjusted price suggests the stock's value has decreased.
            </Typography>
        </Stack>
    </Stack>
)


function PricingGraph({ statement, period }) {
    const [timeRange, setTimeRange] = useState("all");
    const [graphClicked, setGraphClicked] = useState(false);

    const reports = useMemo(() => {
        if (!statement) return [];
        if (Array.isArray(statement) && statement.length === 0) return [];

        return filterReports(statement, timeRange, "date");
    }, [statement, timeRange, period]);

    const percentChange = useMemo(() => {
        if (reports.length === 0) {
            return NaN;
        }
        const percentChange = getPercentChange(reports, "adjustedClose");
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
        <div className="flex-1">
            <GraphCard graphClicked={graphClicked}>
                <GraphTitle
                    title="Adjusted Monthly Pricing"
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
                            <XAxis dataKey="date" stroke="var(--text-main)"
                                tick={{fontSize: 12}} interval="equidistantPreserveStart"
                            />
                            <YAxis stroke="var(--text-main)" domain={[dataMin => dataMin * 0.95, dataMax => dataMax * 1.05]}
                                allowDecimals={false} tickFormatter={(value) => `$${value}`}
                            />
                            <Tooltip formatter={(value) => `$${value}`}/>
                            <Line type="linear" dataKey="adjustedClose" stroke="#588157" dot={false} activeDot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </GraphCard>
        </div>
    )
}

export default PricingGraph
