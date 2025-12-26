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


function CapitalExpendituresGraph(props) {
    const [timeRange, setTimeRange] = useState("all");
    const reports = filterReports(props.reports, timeRange);
    const percentChange = getPercentChange(reports, "capitalExpenditures");
    const [graphClicked, setGraphClicked] = useState(false);

    const graphRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (graphRef.current && !graphRef.current.contains(event.target)) {
                console.log("click outside");
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
                Capital expenditure (CapEx) is the money a company spends on long-term physical assets like property, buildings, and machinery.
            </Typography>
            <Typography variant="explanationTopic">Calculation</Typography>
            <Typography
                variant="explanationText"
                sx={{ fontFamily: "'Times New Roman', Times, 'Segoe Ui', Arial, sans-serif" }}
            >
                CapEx = (Ending PP&E - Beginning PP&E) + Depreciation Expense
            </Typography>
            <Typography variant="explanationTopic">Interpretation</Typography>
            <Stack direction="row" spacing={1}>
                <TrendingUpIcon
                    sx={{ color: "green", bgcolor: "white", borderRadius: "10px",}}
                />
                <Typography variant="explanationText">
                    Upward trend often signifies expansion, investment in new technology, or replacement of aging equipment, suggesting the company is growing or trying to increase efficiency
                </Typography>
            </Stack>
            <Stack direction="row" spacing={1}>
                <TrendingDownIcon
                    sx={{ color: "red", bgcolor: "white", borderRadius: "10px",}}
                />
                <Typography variant="explanationText">
                    Downward trend can mean reduced investment in assets, which could signal market uncertainty, reduced growth prospects, or that the company is in a mature phase.
                </Typography>
            </Stack>
        </Stack>
    )

    return (
        <Box sx={{ flex: 1 }}>
            <GraphCard ref={graphRef} graphClicked={graphClicked}>
                <GraphTitle
                    title="Capital Expenditures"
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
                            <CartesianGrid  strokeDasharray="" vertical={false} stroke="#A3B18A" />
                            <XAxis dataKey="date" interval="equidistantPreserveStart" stroke="#344E41" tick={{fontSize: 12}} />
                            <YAxis tickFormatter={(value) => {
                                if (countDigits(value) >= 10) {return `${(value / 1000000000).toFixed(2)}B`}
                                if (countDigits(value) >= 7) {return `${(value / 1000000).toFixed(2)}M`}
                                return value
                            }} stroke="#344E41" domain={[dataMin => dataMin * 0.95, dataMax => dataMax * 1.05]}/>
                            <Tooltip formatter={(value) => {
                                if (countDigits(value) >= 10) {return `${value / 1000000000}B`}
                                if (countDigits(value) >= 7) {return `${value / 1000000}M`}
                                return value
                            }}/>
                            <Bar dataKey="capitalExpenditures" shape={<CustomBar></CustomBar>}  activeBar={<CustomActiveBar></CustomActiveBar>} />
                        </BarChart>
                    </ResponsiveContainer>
                </Box>
            </GraphCard>
        </Box>
    )
}

export default CapitalExpendituresGraph
