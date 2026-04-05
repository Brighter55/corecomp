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
            Change in inventory measures how much inventory (unsold goods) increased or decreased during the period. It reflects how well the company is managing supply relative to demand.
        </Typography>
        <Typography variant="explanationTopic">Calculation</Typography>
        <Typography
            variant="explanationText"
            sx={{ fontFamily: "'Times New Roman', Times, 'Segoe Ui', Arial, sans-serif" }}
        >
            Change in Inventory = Ending Inventory – Beginning Inventory
        </Typography>
        <Typography variant="explanationTopic">Interpretation</Typography>
        <Stack direction="row" spacing={1}>
            <TrendingUpIcon
                sx={{ color: "green", bgcolor: "white", borderRadius: "10px",}}
            />
            <Typography variant="explanationText">
                Rising inventory can mean the company expects higher demand in the future (preparing stock). However, if sales are not increasing, it may signal weak demand and unsold products building up.
            </Typography>
        </Stack>
        <Stack direction="row" spacing={1}>
            <TrendingDownIcon
                sx={{ color: "red", bgcolor: "white", borderRadius: "10px",}}
            />
            <Typography variant="explanationText">
                Falling inventory usually means strong sales or better inventory management. But if inventory drops too much, the company might not be able to meet demand, leading to lost sales.
            </Typography>
        </Stack>
    </Stack>
)

function ChangeInInventoryGraph({ statement, period }) {
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
        console.log("ChangeInInventoryGraph: ", filteredReports);
        return filteredReports;
    }, [statement, timeRange, period]);

    const percentChange = useMemo(() => {
        if (!reports.length) {
            return NaN;
        }
        const percentChange = getPercentChange(reports, "changeInInventory");
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
                    title="Change in Inventory"
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
                            <Bar name="Change in Inventory" dataKey="changeInInventory" shape={<CustomBar></CustomBar>}  activeBar={<CustomActiveBar></CustomActiveBar>} />
                        </BarChart>
                    </ResponsiveContainer>
                </Box>
            </GraphCard>
        </Box>
    )
}

export default ChangeInInventoryGraph
