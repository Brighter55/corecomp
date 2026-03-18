import { BarChart, Bar, Rectangle, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import CustomBar from "./CustomBar.jsx"
import CustomActiveBar from "./CustomActiveBar.jsx"
import {useState, useEffect, useRef, useMemo} from "react"
import { useNavigate } from "react-router-dom";
import {filterReports, getPercentChange, formatToUnits} from "../../helpers/GraphsHelper.js"
import GraphTitle from "./GraphTitle.jsx"
import GraphCard from "./GraphCard.jsx"
import NoDataGraph from "./NoDataGraph.jsx"
import { authenticatedClientWithRetry } from "../../helpers/api.js"
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
            EBITDA (Earnings Before Interest, Taxes, Depreciation, and Amortization) is a measure of a company's core operational profitability, showing how much cash it generates from operations alone.
        </Typography>
        <Typography variant="explanationTopic">Calculation</Typography>
        <Typography
            variant="explanationText"
            sx={{ fontFamily: "'Times New Roman', Times, 'Segoe Ui', Arial, sans-serif" }}
        >
            EBITDA = EBIT + Depreciation + Amortization
        </Typography>
        <Typography variant="explanationTopic">Interpretation</Typography>
        <Stack direction="row" spacing={1}>
            <TrendingUpIcon
                sx={{ color: "green", bgcolor: "white", borderRadius: "10px",}}
            />
            <Typography variant="explanationText">
                Rising EBITDA (Earnings Before Interest, Taxes, Depreciation, and Amortization) trend signifies strengthening operational performance, high profitability, and improved scalability. It indicates a company is generating consistent cash flow from its core operations
            </Typography>
        </Stack>
        <Stack direction="row" spacing={1}>
            <TrendingDownIcon
                sx={{ color: "red", bgcolor: "white", borderRadius: "10px",}}
            />
            <Typography variant="explanationText">
                A downward EBITDA trend indicates declining operational profitability, signaling that a company is struggling to cover core expenses, which often leads to reduced valuation and cash flow strain.
            </Typography>
        </Stack>
    </Stack>
)

function EbitdaGraph({ symbol, fetchVersion, setSymbol, period }) {
    const navigate = useNavigate();
    const [statement, setStatement] = useState(null);
    const [timeRange, setTimeRange] = useState("all");
    const [graphClicked, setGraphClicked] = useState(false);

    const graphRef = useRef(null);

    useEffect(() => {
        async function getStatement() {
            const payload = {symbol: symbol};
            const response = await authenticatedClientWithRetry("/pages/income-statement", payload, () => isActive, navigate, setSymbol);
            if (!isActive) {
                return;
            }
            if (response.status === 204) {
                setStatement([]);
                return;
            }
            const data = await response.json();
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
        if (Array.isArray(statement) && statement.length === 0) return [];

        const filteredReports = filterReports(statement[period === "annually" ? "annualReports" : "quarterlyReports"], timeRange, "fiscalDateEnding");
        console.log("EBITDA: ", filteredReports);
        return filteredReports;
    }, [statement, timeRange, period]);

    const percentChange = useMemo(() => {
        if (reports.length === 0) {
            return NaN;
        }
        const percentChange = getPercentChange(reports, "ebitda");
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
                        title="EBITDA"
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
                                <Tooltip formatter={(value) => formatToUnits(value)}/>
                                <Bar name="EBITDA" dataKey="ebitda" shape={<CustomBar></CustomBar>}  activeBar={<CustomActiveBar></CustomActiveBar>} />
                            </BarChart>
                        </ResponsiveContainer>
                    </Box>
                </GraphCard>
            </Box>
    )
}


export default EbitdaGraph