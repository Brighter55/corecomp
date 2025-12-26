import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import TimeRanges from "./TimeRanges.jsx"
import {useState, useEffect, useRef} from "react"
import {filterReports, getPercentChange} from "../../helpers/GraphsHelper.js"
import GraphTitle from "./GraphTitle.jsx"
import GraphCard from "./GraphCard.jsx"
// mui
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import Box from '@mui/material/Box';
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


function PricingGraph(props) {
    const [timeRange, setTimeRange] = useState("all");
    const reports = filterReports(props.reports, timeRange);
    const percentChange = getPercentChange(reports, "adjusted close");
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

    return (
        <Box sx={{ flex: 1 }}>
            <GraphCard ref={graphRef} graphClicked={graphClicked}>
                <GraphTitle
                    title="Adjusted Monthly Pricing"
                    explanation={explanation}
                    percentChange={percentChange}
                    timeRange={timeRange}
                    setTimeRange={setTimeRange}
                    menuContainer={graphRef.current}
                />
                <Box onClick={() => {setGraphClicked(true);}} sx={{ width: "100%", height: "100%" }}>
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
                            <CartesianGrid strokeDasharray="" vertical={false} stroke="#A3B18A"/>
                            <XAxis dataKey="date" stroke="#344E41"
                                tick={{fontSize: 12}} interval="equidistantPreserveStart"
                            />
                            <YAxis stroke="#344E41" domain={[dataMin => dataMin * 0.95, dataMax => dataMax * 1.05]}
                                allowDecimals={false}
                            />
                            <Tooltip />
                            <Line type="linear" dataKey="adjusted close" stroke="#588157" dot={false} activeDot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </Box>
            </GraphCard>
        </Box>
    )
}

export default PricingGraph
