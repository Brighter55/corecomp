import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import CustomBar from "./CustomBar.jsx"
import CustomActiveBar from "./CustomActiveBar.jsx"
import {useState, useEffect, useRef, useMemo} from "react"
import {filterReports, getPercentChange, formatToUnits} from "../../helpers/GraphsHelper.js"
import GraphTitle from "./GraphTitle.jsx"
import GraphCard from "./GraphCard.jsx"
import NoDataGraph from "./NoDataGraph.jsx"
import { authenticatedClientWithRetry } from "../../helpers/api.js"
import { useNavigate } from "react-router-dom";
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
            Free Cash Flow (FCF) is the cash a company has left over after paying for its day-to-day operations and the essential investments (capital expenditures) needed to maintain and grow the business. It is essentially the "extra" money a company can use for things like paying dividends, buying back stock, paying off debt, or making acquisitions without disrupting its ongoing operations.
        </Typography>
        <Typography variant="explanationTopic">Calculation</Typography>
        <Typography
            variant="explanationText"
            sx={{ fontFamily: "'Times New Roman', Times, 'Segoe Ui', Arial, sans-serif" }}
        >
            FCF = Operating Cash Flow - Capital Expenditures
        </Typography>
        <Typography variant="explanationTopic">Interpretation</Typography>
        <Stack direction="row" spacing={1}>
            <TrendingUpIcon
                sx={{ color: "green", bgcolor: "white", borderRadius: "10px",}}
            />
            <Typography variant="explanationText">
                Upward trend in FCF generally signals a strong, healthy, and efficiently managed business.
            </Typography>
        </Stack>
        <Stack direction="row" spacing={1}>
            <TrendingDownIcon
                sx={{ color: "red", bgcolor: "white", borderRadius: "10px",}}
            />
            <Typography variant="explanationText">
                Downward trend in FCF could signify that the company may be struggling to generate enough cash from operations to cover its basic expenses and investments.
            </Typography>
        </Stack>
        <Typography variant="explanationText">
            Temporary Dips in Growth Companies: Rapidly expanding companies may temporarily show low or negative FCF as they heavily invest in capital expenditures, such as building new factories or technology infrastructure. In these cases, investors should focus on the long-term strategy and whether the investments are expected to generate high returns in the future.
        </Typography>
    </Stack>
)


function FreeCashflowGraph({ symbol, fetchVersion, setSymbol, period }) {
    const navigate = useNavigate();
    const [statement, setStatement] = useState(null);
    const [timeRange, setTimeRange] = useState("all");
    const [graphClicked, setGraphClicked] = useState(false);

    const graphRef = useRef(null);

    useEffect(() => {
        async function getStatement() {
            const payload = {symbol: symbol};
            const response = await authenticatedClientWithRetry("/pages/cash-flow", payload, () => isActive, navigate, setSymbol);
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
        console.log("FreeCashflowGraph: ", filteredReports);
        return filteredReports;
    }, [statement, timeRange, period]);

    const percentChange = useMemo(() => {
        if (!reports.length) {
            return NaN;
        }
        const percentChange = getPercentChange(reports, "freeCashFlow");
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
                        title="Free Cash Flow"
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
                                <Bar name="Free Cash Flow" dataKey="freeCashFlow" shape={<CustomBar></CustomBar>}  activeBar={<CustomActiveBar></CustomActiveBar>} />
                            </BarChart>
                        </ResponsiveContainer>
                    </Box>
                </GraphCard>
            </Box>
    )
}


export default FreeCashflowGraph
