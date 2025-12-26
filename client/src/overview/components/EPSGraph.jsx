import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
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

function EPSGraph(props) {
    const [timeRange, setTimeRange] = useState("all");
    const reports = filterReports(props.reports, timeRange);
    const percentChange = getPercentChange(reports, "reportedEPS");
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

    /*CustomTooltip*/
    function CustomTooltip(props) {
        const report = {
            color: "black",
        };

        const {active, payload, label} = props;
        const isVisible = active && payload && payload.length;
        return (
            <div style={{ visibility: isVisible ? 'visible' : 'hidden',
                backgroundColor: "white",
                padding: "10px",
            }}>
                {isVisible && (
                    <>
                        <p>{`Year: ${label}`}</p>
                        <p style={report}>{`${payload[1].name}: ${payload[1].value}`}</p>
                        <p style={report}>{`${payload[0].name}: ${payload[0].value}`}</p>
                        <p style={report}>{payload[0].payload.surprisePercentage >= 0 ? "beat by" : "missed by"}: <span style={ payload[0].payload.surprisePercentage >= 0 ? {color: "green"} : {color: "red"} }>{payload[0].payload.surprisePercentage}%</span></p>
                    </>
                )}
            </div>
        );
    }

    function CustomDot(props) {
        const { cx, cy, stroke, payload, value } = props;
        const color = payload.surprisePercentage >= 0 ? "#588157" : "#bc4749";
        return <circle cx={cx} cy={cy} payload={payload} value={value} fill={color} r={5}></circle>
    }

    function CustomActiveDot(props) {
        const { cx, cy, stroke, payload, value } = props;
        const color = payload.surprisePercentage >= 0 ? "#588157" : "#bc4749";
        return <circle cx={cx} cy={cy} stroke={stroke} payload={payload} value={value} fill={color} r={8} strokeWidth={1}></circle>
    }

    const explanation = (
        <Stack spacing={2}>
            <Typography variant="explanationTopic">What is it?</Typography>
            <Typography variant="explanationText">
                A measure of a company's profitability, showing how much profit is generated for each share of stock
            </Typography>
            <Typography variant="explanationTopic">Calculation</Typography>
            <Typography
                variant="explanationText"
                sx={{ fontFamily: "'Times New Roman', Times, 'Segoe Ui', Arial, sans-serif" }}
            >
                EPS = Net Income / # of outstanding shares
            </Typography>
            <Typography variant="explanationTopic">Interpretation</Typography>
            <Stack direction="row" spacing={1}>
                <TrendingUpIcon
                    sx={{ color: "green", bgcolor: "white", borderRadius: "10px",}}
                />
                <Typography variant="explanationText">
                    Upward trend in EPS generally signifies growing profitability, which can lead to a higher stock price and increased investor confidence.
                </Typography>
            </Stack>
            <Stack direction="row" spacing={1}>
                <TrendingDownIcon
                    sx={{ color: "red", bgcolor: "white", borderRadius: "10px",}}
                />
                <Typography variant="explanationText">
                    Downward trend in EPS signals declining profits, which often leads to a lower stock price and may indicate financial challenges.
                </Typography>
            </Stack>
        </Stack>
    )

    return (
        props.period === "quarterly" ? (
            <Box sx={{ flex: 1 }}>
                <GraphCard ref={graphRef} graphClicked={graphClicked}>
                    <GraphTitle
                        title="Earning per Share"
                        explanation={explanation}
                        percentChange={percentChange}
                        timeRange={timeRange}
                        setTimeRange={setTimeRange}
                    />
                    <Box onClick={() => {setGraphClicked(true);}} sx={{ width: "100%", height: "100%" }}>
                        <ResponsiveContainer>
                            <LineChart
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
                            <YAxis tickFormatter={(value) => value.toFixed(2)} stroke="#344E41" domain={[dataMin => dataMin * 0.95, dataMax => dataMax * 1.05]}/>
                            <Tooltip content={<CustomTooltip></CustomTooltip>} />
                            <Legend />
                            <Line type="monotone" dataKey="estimatedEPS" stroke="grey" strokeWidth={0} dot={{ fill: "grey", fillOpacity: 0.3, r: 5}} activeDot={{ r: 8, strokeWidth: 1}} legendType="circle"/>
                            <Line type="monotone" dataKey="reportedEPS" stroke="#588157" strokeWidth={0} dot={<CustomDot></CustomDot>} activeDot={<CustomActiveDot></CustomActiveDot>} legendType="circle" />
                            </LineChart>
                        </ResponsiveContainer>
                    </Box>
                </GraphCard>
            </Box>
            )
        : (
            <Box sx={{ flex: 1 }}>
                <GraphCard ref={graphRef} graphClicked={graphClicked}>
                    <GraphTitle
                        title="Earning per Share"
                        explanation={explanation}
                        percentChange={percentChange}
                        timeRange={timeRange}
                        setTimeRange={setTimeRange}
                    />
                    <Box onClick={() => {setGraphClicked(true);}} sx={{ width: "100%", height: "100%" }}>
                        <ResponsiveContainer>
                            <LineChart
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
                            <YAxis tickFormatter={(value) => value.toFixed(2)} stroke="#344E41" domain={[dataMin => dataMin * 0.95, dataMax => dataMax * 1.05]}/>
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="reportedEPS" stroke="#588157" strokeWidth={0} dot={{ fill: "#588157", r: 5}} activeDot={{ r: 8, fill: "#A3B18A"}} legendType="circle" />
                            </LineChart>
                        </ResponsiveContainer>
                    </Box>
                </GraphCard>
            </Box>
        )
    )
}

export default EPSGraph
