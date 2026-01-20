import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import {useState, useEffect, useRef, useMemo} from "react"
import {filterReports, getPercentChange, formatToUnits} from "../../helpers/GraphsHelper.js"
import GraphCard from "./GraphCard.jsx"
import { fetchSymbolDataWithRetry } from "../../helpers/helper.js"
import { useNavigate } from "react-router-dom";
import Explanation from "./Explanation.jsx"
import TimeRanges from "./TimeRanges.jsx"
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
            Cash and Cash Equivalents At Carrying Value is liquid assets (things a company can easily convert to cash, such as cash on hand, bank accounts, marketable securities like stocks and bonds, and accounts receivable) the company owns.
        </Typography>
        <Typography variant="explanationText">
            Debt is money borrowed and owed to others, typically with interest
        </Typography>
        <Typography variant="explanationTopic">Calculation</Typography>
        <Typography
            variant="explanationText"
            sx={{ fontFamily: "'Times New Roman', Times, 'Segoe Ui', Arial, sans-serif" }}
        >
            Cash = Cash + Current bank accounts + Short-Term, Liquid Securities
        </Typography>
        <Typography
            variant="explanationText"
            sx={{ fontFamily: "'Times New Roman', Times, 'Segoe Ui', Arial, sans-serif" }}
        >
            Debt = Short Term Debt + Long Term Debt
        </Typography>
        <Typography variant="explanationTopic">Interpretation</Typography>
        <Stack direction="row" spacing={1}>
            <TrendingUpIcon
                sx={{ color: "green", bgcolor: "white", borderRadius: "10px",}}
            />
            <Typography variant="explanationText">
                Cash Uptrend is when a company is generating more cash than it is spending (positive cash flow) or raising funds through new investments/financing. This is usually a strong positive sign, indicating stability and resources for future growth.
            </Typography>
        </Stack>
        <Stack direction="row" spacing={1}>
            <TrendingDownIcon
                sx={{ color: "red", bgcolor: "white", borderRadius: "10px",}}
            />
            <Typography variant="explanationText">
                Cash Downtrend is when a company is burning through its cash reserves faster than it is generating new cash (negative cash flow). This is often a warning sign of operational or liquidity issues, though it could also be a temporary result of a large strategic investment.
            </Typography>
        </Stack>
        <Stack direction="row" spacing={1}>
            <TrendingUpIcon
                sx={{ color: "green", bgcolor: "white", borderRadius: "10px",}}
            />
            <Typography variant="explanationText">
                Debt Uptrend is wheb a company is taking on more debt. This can be a strategic positive if the money is used to fund profitable expansions, but it becomes a negative if the company cannot manage the increased interest payments or faces difficulty repaying the principal.
            </Typography>
        </Stack>
        <Stack direction="row" spacing={1}>
            <TrendingDownIcon
                sx={{ color: "red", bgcolor: "white", borderRadius: "10px",}}
            />
            <Typography variant="explanationText">
                Debt Downtrend is when a company is paying down its existing debt. This is generally a very positive sign, as it reduces financial risk, lowers interest expenses, and improves long-term financial stability.
            </Typography>
        </Stack>
    </Stack>
)


function CashVsDebtGraph({ symbol, fetchVersion, setSymbol, period }) {
    const navigate = useNavigate();
    const [statement, setStatement] = useState(null);
    const [timeRange, setTimeRange] = useState("all");
    const [graphClicked, setGraphClicked] = useState(false);

    const graphRef = useRef(null);

    useEffect(() => {
        async function getStatement() {
            const payload = {symbol: symbol};
            const response = await fetchSymbolDataWithRetry("http://127.0.0.1:8000/pages/balance-sheet", payload, () => isActive, navigate, setSymbol);
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

        const filteredReports = filterReports(statement[period === "annually" ? "annualReports" : "quarterlyReports"], timeRange, "fiscalDateEnding");
        console.log("filteredReports: ", filteredReports);
        return filteredReports;
    }, [statement, timeRange, period]);

    const cashPercentChange = useMemo(() => {
        if (!reports.length) {
            return null;
        }
        const cashPercentChange = getPercentChange(reports, "cashAndCashEquivalentsAtCarryingValue");
        return cashPercentChange;
    }, [reports]);

    const debtPercentChange = useMemo(() => {
        if (!reports.length) {
            return null;
        }
        const debtPercentChange = getPercentChange(reports, "shortLongTermDebtTotal");
        return debtPercentChange;
    }, [reports]);

    return (
        statement ? (
            <Box sx={{ flex: 1 }}>
                <GraphCard ref={graphRef} graphClicked={graphClicked}>
                    <Stack direction="row" sx={{ alignItems: "center" }}>
                        <Stack
                            direction="row"
                            sx={{ alignItems: "center", flexGrow: 1, justifyContent: "center" }}
                            spacing={1}
                        >
                            <Typography variant="h6" textAlign="center">Cash V Debt</Typography>
                            <Explanation explanation={explanation} />
                        </Stack>
                        <Typography
                            variant="h6"
                            sx={{
                                color: "var(--main-hunter-green)",
                            }}
                        >
                            {cashPercentChange >= 0 ? `+${cashPercentChange}%` : `${cashPercentChange}%`}
                        </Typography>
                        <Typography
                            variant="h6"
                            sx={{
                                color: "var(--main-brick)",
                            }}
                        >
                            {debtPercentChange >= 0 ? `+${debtPercentChange}%` : `${debtPercentChange}%`}
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
                                <CartesianGrid  strokeDasharray="" vertical={false} stroke="#A3B18A"/>
                                <XAxis dataKey="fiscalDateEnding" stroke="#344E41" interval="equidistantPreserveStart" tick={{fontSize: 12}} />
                                <YAxis 
                                    tickFormatter={(value) => formatToUnits(value)}
                                    stroke="#344E41"
                                    domain={[dataMin => dataMin * 0.95, dataMax => dataMax * 1.05]}
                                />
                                <Tooltip formatter={(value) => formatToUnits(value)}/>
                                <Legend />
                                <Bar name="cash" dataKey="cashAndCashEquivalentsAtCarryingValue" stackId="a" fill="#588157"  activeBar={{ fill: "#A3B18A", stroke: "#DAD7CD", strokeWidth: 2 }}/>
                                <Bar name="debt" dataKey="shortLongTermDebtTotal" stackId="a" fill="#bc4749" activeBar={{ fill: "#B35C5E", stroke: "#DAD7CD", strokeWidth: 2 }}/>
                            </BarChart>
                        </ResponsiveContainer>
                    </Box>
                </GraphCard>
            </Box>
        ) : (
            <Skeleton variant="rounded" sx={{ flex: 1, height: "20rem" }}/>
        )
    )
}


export default CashVsDebtGraph
