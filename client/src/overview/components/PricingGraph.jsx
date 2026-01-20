import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import {useState, useEffect, useRef, useMemo} from "react"
import {filterReports, getPercentChange, formatToUnits} from "../../helpers/GraphsHelper.js"
import GraphTitle from "./GraphTitle.jsx"
import GraphCard from "./GraphCard.jsx"
import { useNavigate } from "react-router-dom";
import { fetchSymbolDataWithRetry } from "../../helpers/helper.js"
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


function PricingGraph({ symbol, fetchVersion, setSymbol, period }) {
    const navigate = useNavigate();
    const [statement, setStatement] = useState(null);
    const [timeRange, setTimeRange] = useState("all");
    const [graphClicked, setGraphClicked] = useState(false);

    const graphRef = useRef(null);

    useEffect(() => {
        async function getStatement() {
            const payload = {symbol: symbol};
            const response = await fetchSymbolDataWithRetry("http://127.0.0.1:8000/pages/pricing", payload, () => isActive, navigate, setSymbol);
            if (!isActive) {
                return;
            }
            const data = await response.json();
            console.log(data)
            setStatement(data);
        }

        let isActive = true;
        getStatement();

        return  () => {
            isActive = false;
        };
    }, [symbol, fetchVersion]);

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

        const filteredReports = filterReports(statement, timeRange, "date");
        console.log("filteredReports: ", filteredReports);
        return filteredReports;
    }, [statement, timeRange, period]);

    const percentChange = useMemo(() => {
        if (!reports.length) {
            return null;
        }
        const percentChange = getPercentChange(reports, "adjustedClose");
        return percentChange;
    }, [reports]);

    return (
        statement ? (
            <Box sx={{ flex: 1 }}>
                <GraphCard ref={graphRef} graphClicked={graphClicked}>
                    <GraphTitle
                        title="Adjusted Monthly Pricing"
                        explanation={explanation}
                        percentChange={percentChange}
                        timeRange={timeRange}
                        setTimeRange={setTimeRange}
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
                                    allowDecimals={false} tickFormatter={(value) => `$${value}`}
                                />
                                <Tooltip formatter={(value) => `$${value}`}/>
                                <Line type="linear" dataKey="adjustedClose" stroke="#588157" dot={false} activeDot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </Box>
                </GraphCard>
            </Box>
        ) : (
            <Skeleton variant="rounded" sx={{ flex: 1, height: "20rem" }}/>
        )
    )
}

export default PricingGraph
