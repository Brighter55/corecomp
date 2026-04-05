import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import CustomBar from "./CustomBar.jsx"
import CustomActiveBar from "./CustomActiveBar.jsx"
import {useState, useEffect, useRef, useMemo} from "react"
import {filterReports, getPercentChange, formatToUnits} from "../../helpers/GraphsHelper.js"
import GraphTitle from "./GraphTitle.jsx"
import GraphCard from "./GraphCard.jsx"
import NoDataGraph from "./NoDataGraph.jsx"
// mui
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Skeleton from '@mui/material/Skeleton';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

const explanation = (
    <Stack spacing={2}>
        <Typography variant="explanationTopic">What is it?</Typography>
        <Typography variant="explanationText">
            Cash Flow from Financing (CFF) activities section on a cash flow statement reports the net flow of cash between a company and its owners (shareholders) and creditors. It highlights how a business funds itself, showing money raised through issuing stock or debt (inflows) and money spent on dividends, share buybacks, or debt repayment (outflows).
        </Typography>
        <Typography variant="explanationTopic">Calculation</Typography>
        <Typography
            variant="explanationText"
            sx={{ fontFamily: "'Times New Roman', Times, 'Segoe Ui', Arial, sans-serif" }}
        >
            CFF = Cash Inflows from Issuing Equity or Debt - (Dividends Paid + Repurchase of Debt and Equity)
        </Typography>
        <Typography variant="explanationTopic">Interpretation</Typography>
        <Stack direction="row" spacing={1}>
            <TrendingUpIcon
                sx={{ color: "green", bgcolor: "white", borderRadius: "10px",}}
            />
            <Typography variant="explanationText">
                A positive trend shows the company is receiving more cash from lenders or investors than it is paying out. It usually signifies raising capital for growth, typical for young, expanding firms.
            </Typography>
        </Stack>
        <Stack direction="row" spacing={1}>
            <TrendingDownIcon
                sx={{ color: "red", bgcolor: "white", borderRadius: "10px",}}
            />
            <Typography variant="explanationText">
                A downward trend (negative/decreasing) often indicates a mature company paying down debt or rewarding shareholders through buybacks or dividends.
            </Typography>
        </Stack>
    </Stack>
)

function CashflowFromFinancingGraph({ statement, period }) {
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
        console.log("CashflowFromFinancingGraph: ", filteredReports);
        return filteredReports;
    }, [statement, timeRange, period]);

    const percentChange = useMemo(() => {
        if (!reports.length) {
            return NaN;
        }
        const percentChange = getPercentChange(reports, "cashflowFromFinancing");
        return percentChange;
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
                <GraphTitle
                    title="Cashflow from Financing"
                    explanation={explanation}
                    percentChange={percentChange}
                    timeRange={timeRange}
                    setTimeRange={setTimeRange}
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
                            <XAxis dataKey="fiscalDateEnding" interval="equidistantPreserveStart" stroke="#344E41" tick={{fontSize: 12}} />
                            <YAxis tickFormatter={(value) => formatToUnits(value)} stroke="#344E41" domain={[dataMin => dataMin * 0.95, dataMax => dataMax * 1.05]} />
                            <Tooltip formatter={(value) => formatToUnits(value)} />
                            <Bar name="Cashflow from Financing" dataKey="cashflowFromFinancing" shape={<CustomBar></CustomBar>}  activeBar={<CustomActiveBar></CustomActiveBar>} />
                        </BarChart>
                    </ResponsiveContainer>
                </Box>
            </GraphCard>
        </Box>
    )
}

export default CashflowFromFinancingGraph
