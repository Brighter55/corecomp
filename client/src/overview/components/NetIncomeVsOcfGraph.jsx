import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import {useState, useEffect, useRef, useMemo} from "react"
import { filterReports, getPercentChange, formatToUnits } from "../../helpers/GraphsHelper.js"
import GraphCard from "./GraphCard.jsx"
import NoDataGraph from "./NoDataGraph.jsx"
import Explanation from "./Explanation.jsx"
import TimeRanges from "./TimeRanges.jsx"
// mui
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Skeleton from '@mui/material/Skeleton';

const explanation = (
    <Stack spacing={2}>
        <Typography variant="explanationTopic">What is it?</Typography>
        <Typography variant="explanationText">
            This grouped bar chart compares operating cash flow with net income for each period.
            It helps show whether accounting profit is supported by cash generated from core operations.
        </Typography>
    </Stack>
)

function TooltipContent({ active, payload, label }) {
    if (!active || !payload || payload.length === 0) {
        return null;
    }

    const operatingCashflow = Number(payload.find((item) => item.dataKey === "operatingCashflow")?.value);
    const netIncome = Number(payload.find((item) => item.dataKey === "netIncome")?.value);

    return (
        <Box
            sx={{
                bgcolor: "white",
                border: "1px solid #A3B18A",
                borderRadius: "6px",
                p: 1,
                minWidth: "12rem",
            }}
        >
            <Typography variant="caption" sx={{ display: "block", mb: 0.5 }}>
                {label}
            </Typography>
            <Typography variant="body2" sx={{ color: "#588157" }}>
                Operating Cash Flow: {formatToUnits(operatingCashflow)}
            </Typography>
            <Typography variant="body2" sx={{ color: "#bc4749" }}>
                Net Income: {formatToUnits(netIncome)}
            </Typography>
        </Box>
    );
}


function NetIncomeVsOcfGraph({ statement, period }) {
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

        const filteredReports = filterReports(statement[period === "annually" ? "annualReports" : "quarterlyReports"], timeRange, "fiscalDateEnding");
        console.log("NetIncomeVsOcfGraph:", filteredReports);
        return filteredReports;
    }, [statement, timeRange, period]);

    const operatingCashflowPercentChange = useMemo(() => {
        if (reports.length === 0) {
            return NaN;
        }
        return getPercentChange(reports, "operatingCashflow");
    }, [reports]);

    const netIncomePercentChange = useMemo(() => {
        if (reports.length === 0) {
            return NaN;
        }
        return getPercentChange(reports, "netIncome");
    }, [reports]);

    if (statement === null) {
        return <Skeleton variant="rounded" sx={{ flex: 1, height: "20rem" }}/>;
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
                        <Typography variant="h6" textAlign="center">Net Income Vs OCF</Typography>
                        <Explanation explanation={explanation} />
                    </Stack>
                    <Typography
                        variant="h6"
                        sx={{
                            color: "var(--main-hunter-green)",
                        }}
                    >
                        {isNaN(operatingCashflowPercentChange) ? "N/A" : (operatingCashflowPercentChange >= 0 ? `+${operatingCashflowPercentChange}%` : `${operatingCashflowPercentChange}%`)}
                    </Typography>
                    <Typography
                        variant="h6"
                        sx={{
                            color: "var(--main-brick)",
                        }}
                    >
                        {isNaN(netIncomePercentChange) ? "N/A" : (netIncomePercentChange >= 0 ? `+${netIncomePercentChange}%` : `${netIncomePercentChange}%`)}
                    </Typography>
                    <TimeRanges timeRange={timeRange} setTimeRange={setTimeRange} />
                </Stack>
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
                            <XAxis dataKey="fiscalDateEnding" interval="equidistantPreserveStart" stroke="#344E41" tick={{fontSize: 12}} />
                            <YAxis tickFormatter={(value) => formatToUnits(value)} stroke="#344E41" domain={[dataMin => dataMin * 0.95, dataMax => dataMax * 1.05]} />
                            <Tooltip content={<TooltipContent />} />
                            <Legend />
                            <Bar name="Operating Cash Flow" dataKey="operatingCashflow" fill="#588157" activeBar={{ fill: "#A3B18A", stroke: "#DAD7CD", strokeWidth: 2 }} />
                            <Bar name="Net Income" dataKey="netIncome" fill="#bc4749" activeBar={{ fill: "#B35C5E", stroke: "#DAD7CD", strokeWidth: 2 }} />
                        </BarChart>
                    </ResponsiveContainer>
                </Box>
            </GraphCard>
        </Box>
    )
}


export default NetIncomeVsOcfGraph