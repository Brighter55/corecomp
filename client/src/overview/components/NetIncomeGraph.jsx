import { BarChart, Bar, Rectangle, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import CustomBar from "./CustomBar.jsx"
import CustomActiveBar from "./CustomActiveBar.jsx"
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

function NetIncomeGraph(props) {
    const [timeRange, setTimeRange] = useState("all");
    const reports = filterReports(props.reports, timeRange);
    const percentChange = getPercentChange(reports, "netIncome");
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

    const explanation = (
        <Stack spacing={2}>
            <Typography variant="explanationTopic">What is it?</Typography>
            <Typography variant="explanationText">
                Net income is a company's profit after all expenses and taxes have been deducted from its total revenue.            </Typography>
            <Typography variant="explanationTopic">Calculation</Typography>
            <Typography
                variant="explanationText"
                sx={{ fontFamily: "'Times New Roman', Times, 'Segoe Ui', Arial, sans-serif" }}
            >
                Net Income = Total Revenue – Total Expenses
            </Typography>
            <Typography variant="explanationTopic">Interpretation</Typography>
            <Stack direction="row" spacing={1}>
                <TrendingUpIcon
                    sx={{ color: "green", bgcolor: "white", borderRadius: "10px",}}
                />
                <Typography variant="explanationText">
                    A positive trend shows the company is improving its financial performance.
                </Typography>
            </Stack>
            <Stack direction="row" spacing={1}>
                <TrendingDownIcon
                    sx={{ color: "red", bgcolor: "white", borderRadius: "10px",}}
                />
                <Typography variant="explanationText">
                    A negative trend can be a warning sign, even if it remains positive. It suggests the company may be facing challenges in its operations or market.
                </Typography>
            </Stack>
        </Stack>
    )

    return (
        <Box sx={{ flex: 1 }}>
            <GraphCard ref={graphRef} graphClicked={graphClicked}>
                <GraphTitle
                    title="Net Income"
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
                            <CartesianGrid strokeDasharray="" vertical={false} stroke="#A3B18A"/>
                            <XAxis dataKey="date" stroke="#344E41" interval="equidistantPreserveStart" tick={{fontSize: 12}} />
                            <YAxis tickFormatter={(value) => {
                                if (countDigits(value) >= 10) {return `${(value / 1000000000).toFixed(2)}B`}
                                if (countDigits(value) >= 7) {return `${(value / 1000000).toFixed(2)}M`}
                                return value
                            }} stroke="#344E41" domain={[dataMin => dataMin * 0.95, dataMax => dataMax * 1.05]} />
                            <Tooltip formatter={(value) => {
                                if (countDigits(value) >= 10) {return `${value / 1000000000}B`}
                                if (countDigits(value) >= 7) {return `${value / 1000000}M`}
                                return value
                            }}/>
                            <Bar dataKey="netIncome" shape={<CustomBar></CustomBar>} activeBar={<CustomActiveBar></CustomActiveBar>} />
                        </BarChart>
                    </ResponsiveContainer>
                </Box>
            </GraphCard>
        </Box>
    )
}


export default NetIncomeGraph
