import sampleReports from "../sample-data/sampleData.json"
import { BarChart, Bar, Rectangle, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useState, useRef, useEffect } from "react"
import {filterReports, getPercentChange} from "../../helpers/GraphsHelper.js"
// borrows from overview page
import TimeRanges from "../../overview/components/TimeRanges.jsx"
import Explanation from "../../overview/components/Explanation.jsx"
// mui components
import Stack from '@mui/material/Stack';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

const explanation = (
    <Stack spacing={1}>
        <Typography variant="h5">What is it?</Typography>
        <Typography variant="body1">
            Net income is a company's profit after all expenses and taxes have been deducted from its total revenue.
        </Typography>
        <Typography variant="h5">Calculation</Typography>
        <Typography variant="body1" sx={{ fontFamily: "'Times New Roman', Times, 'Segoe Ui', Arial, sans-serif" }}>Net Income = Total Revenue – Total Expenses</Typography>
        <Typography variant="h5">Interpretation</Typography>
        <Stack direction="row" spacing={1}>
            <TrendingUpIcon
                sx={{ color: "green", bgcolor: "white", borderRadius: "10px",}}
            />
            <Typography variant="body1">
                A positive trend shows the company is improving its financial performance.
            </Typography>
        </Stack>
        <Stack direction="row" spacing={1}>
            <TrendingDownIcon
                sx={{ color: "red", bgcolor: "white", borderRadius: "10px",}}
            />
            <Typography variant="body1">
                A negative trend can be a warning sign, even if it remains positive. It suggests the company may be facing challenges in its operations or market.
            </Typography>
        </Stack>
    </Stack>
)

function SampleIncomeGraph({ key }) {
    const [timeRange, setTimeRange] = useState("all");
    const reports = filterReports(sampleReports.INCOME_STATEMENT, timeRange);
    const percentChange = getPercentChange(reports, "netIncome");

    // handle graph grows or shrinks when clicked
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

    function CustomBar(props) {
        const barColor = (props.value >= 0 ? "#588157" : "#bc4749");
        return <Rectangle {...props} fill={barColor}/>
    }

    function CustomActiveBar(props) {
        const activeBarColor = (props.value >= 0 ? "#A3B18A" : "#B35C5E");
        return <Rectangle {...props} fill={activeBarColor} stroke="#DAD7CD"></Rectangle>
    }

    function countDigits(value) {
        if (value === 0) {
            return 1;
        }
        return Math.floor(Math.log10(Math.abs(value))) + 1;
    }


    return (
        <Stack
            ref={graphRef}
            sx={
                graphClicked ? {
                    position: "fixed",
                    height: "80vh",
                    width: "90vw",
                    top: "10vh",
                    left: "5vw",
                    background: "var(--main-dust-grey)",
                    color: "var(--main-pine-teal)",
                    borderRadius: "10px",
                    zIndex: 3,
                } : {
                    height: "100%",
                    width: "80%",
                    background: "var(--main-dust-grey)",
                    borderRadius: "10px",
                    color: "var(--main-pine-teal)",
                    transition: "width 0.3s ease-in-out",
                }
            }
        >
            <Stack direction="row" sx={{ alignItems: "center" }}>
                <Stack
                    direction="row"
                    sx={{ alignItems: "center", flexGrow: 1, justifyContent: "center" }}
                    spacing={1}
                >
                    <Typography variant="h5">Net Income</Typography>
                    <Explanation explanation={explanation} />
                </Stack>
                <Typography
                    variant="h6"
                    sx={{color: percentChange >= 0 ? "#3A5A40" : "#bc4749"}}
                >
                    {percentChange >= 0 ? `+${percentChange}%` : `${percentChange}%`}
                </Typography>
                <TimeRanges timeRange={timeRange} setTimeRange={setTimeRange} menuContainer={graphRef.current} />
            </Stack>
            <Box
                sx={{ width: "100%", height: "100%" }}
                onClick={() => {setGraphClicked(true);}}
            >
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
        </Stack>
    )
}

export default SampleIncomeGraph
