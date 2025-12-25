import { BarChart, Bar, Rectangle, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import TimeRanges from "./TimeRanges.jsx"
import {useState, useEffect, useRef} from "react"
import {filterReports, getPercentChange} from "../../helpers/GraphsHelper.js"
import GraphTitle from "./GraphTitle.jsx"
import GraphCard from "./GraphCard.jsx"
// mui compoenents
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';

const explanation = (
    <Stack spacing={1}>
        <Typography variant="explanationTopic">What is it?</Typography>
        <Typography variant="explanationText">
            Basic shares outstanding are the total shares issued and available for trading in the stock market. This includes shares held by both institutions and individual investors. However, this doesn't include Treasury shares (shares repurchased by the company and held in its treasury).
        </Typography>
        <Typography variant="explanationTopic">Calculation</Typography>
        <Typography variant="explanationText" sx={{ fontFamily: "'Times New Roman', Times, 'Segoe Ui', Arial, sans-serif" }}>Outstanding Shares = Issued shares - Treasury shares</Typography>
        <Typography variant="explanationTopic">Interpretation</Typography>
        <Stack direction="row" spacing={1}>
            <TrendingUpIcon
                sx={{ color: "green", bgcolor: "white", borderRadius: "10px",}}
            />
            <Typography variant="explanationText">
                Shares Outstanding increases when a company is issuing and selling new shares to raise their capital
            </Typography>
        </Stack>
        <Stack direction="row" spacing={1}>
            <TrendingDownIcon
                sx={{ color: "red", bgcolor: "white", borderRadius: "10px",}}
            />
            <Typography variant="explanationText">
                Shares Outstanding decreases when a company repurchases its own shares and holds them as treasury stock. The process is called "Share Buybacks"
            </Typography>
        </Stack>
        <Typography variant="explanationText">
            Shares Outstanding stays stable when a company isn’t raising new capital or aggressively buying back shares.
        </Typography>
    </Stack>
)

function SharesOutstandingGraph(props) {
    const [timeRange, setTimeRange] = useState("all");
    const reports = filterReports(props.reports, timeRange);
    const percentChange = getPercentChange(reports, "shares_outstanding_basic");
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

    function countDigits(value) {
        if (value === 0) {
            return 1;
        }
        return Math.floor(Math.log10(Math.abs(value))) + 1;
    }

    return (
        <Box sx={{ flex: 1 }}>
            <GraphCard ref={graphRef} graphClicked={graphClicked}>
                <GraphTitle
                    title="SharesOutstanding"
                    explanation={explanation}
                    percentChange={percentChange}
                    timeRange={timeRange}
                    setTimeRange={setTimeRange}
                    menuContainer={graphRef.current}
                />
                <Box onClick={() => {setGraphClicked(true);}} sx={{ width: "100%", height: "100%" }}>
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
                            <CartesianGrid strokeDasharray="" vertical={false} stroke="#A3B18A" />
                            <XAxis dataKey="date" interval="equidistantPreserveStart" stroke="#344E41" tick={{fontSize: 12}}/>
                            <YAxis tickFormatter={(value) => {
                                if (countDigits(value) >= 10) {return `${(value / 1000000000).toFixed(2)}B`}
                                if (countDigits(value) >= 7) {return `${(value / 1000000).toFixed(2)}M`}
                                return value
                            }} stroke="#344E41" domain={[dataMin => dataMin * 0.95, dataMax => dataMax * 1.05]}

                            />
                            <Tooltip formatter={(value) => {
                                if (countDigits(value) >= 10) {return `${value / 1000000000}B`}
                                if (countDigits(value) >= 7) {return `${value / 1000000}M`}
                                return value
                            }} />
                            <Bar dataKey="shares_outstanding_basic" fill="#588157" activeBar={<Rectangle fill="#A3B18A"/>}/>
                        </BarChart>
                    </ResponsiveContainer>
                </Box>
            </GraphCard>
        </Box>
    )
}

export default SharesOutstandingGraph
