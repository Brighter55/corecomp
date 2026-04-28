import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useState, useMemo } from "react";
import {filterReports, getPercentChange} from "../../helpers/GraphsHelper.js"
import GraphTitle from "./GraphTitle.jsx"
import GraphCard from "./GraphCard.jsx"
import NoDataGraph from "./NoDataGraph.jsx"
// mui
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';

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

function EPSGraph({ statement, period }) {
    const [timeRange, setTimeRange] = useState("all");
    const [graphClicked, setGraphClicked] = useState(false);

    const reports = useMemo(() => {
        if (!statement) return [];
        if (Array.isArray(statement) && statement.length === 0) return [];

        return filterReports(
            statement[period === "annually" ? "annualEarnings" : "quarterlyEarnings"] ?? [],
            timeRange,
            "fiscalDateEnding"
        );
    }, [statement, timeRange, period]);

    const percentChange = useMemo(() => {
        if (reports.length === 0) {
            return NaN;
        }
        const percentChange = getPercentChange(reports, "reportedEPS");
        return percentChange;
    }, [reports]);


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
                        <p style={report}>
                            {payload[0].payload.surprisePercentage >= 0 ? "beat by" : "missed by"}: 
                            <span style={ payload[0].payload.surprisePercentage >= 0 ? {color: "green"} : {color: "red"} }>{parseFloat(payload[0].payload.surprisePercentage).toFixed(2)}%</span>
                        </p>
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

    if (statement === null) {
        return (
            <div className="flex-1">
                <div className="h-80 w-full min-w-[21rem] animate-pulse rounded-[10px] bg-[rgba(163,177,138,0.25)] sm:h-[25rem]" />
            </div>
        );
    }
    if (Array.isArray(statement) && statement.length === 0) {
        return <NoDataGraph />;
    }

    return (
        period === "quarterly" ? (
            <div className="flex-1">
                <GraphCard graphClicked={graphClicked}>
                    <GraphTitle
                        title="Earning per Share"
                        explanation={explanation}
                        percentChange={percentChange}
                        timeRange={timeRange}
                        setTimeRange={setTimeRange}
                        graphClicked={graphClicked}
                        setGraphClicked={setGraphClicked}
                    />
                    <div onClick={() => {setGraphClicked(true);}} className="min-h-0 w-full flex-1">
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
                            <CartesianGrid strokeDasharray="" vertical={false} stroke="var(--main-dry-sage)"/>
                            <XAxis dataKey="fiscalDateEnding" stroke="var(--text-main)" interval="equidistantPreserveStart" tick={{fontSize: 12}} />
                            <YAxis tickFormatter={(value) => `$${value.toFixed(2)}`} stroke="var(--text-main)" domain={[dataMin => dataMin * 0.95, dataMax => dataMax * 1.05]}/>
                            <Tooltip content={<CustomTooltip></CustomTooltip>} />
                            <Legend />
                            <Line name="estimated EPS" type="monotone" dataKey="estimatedEPS" stroke="grey" strokeWidth={0} dot={{ fill: "grey", fillOpacity: 0.3, r: 5}} activeDot={{ r: 8, strokeWidth: 1}} legendType="circle"/>
                            <Line name="reported EPS" type="monotone" dataKey="reportedEPS" stroke="#588157" strokeWidth={0} dot={<CustomDot></CustomDot>} activeDot={<CustomActiveDot></CustomActiveDot>} legendType="circle" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </GraphCard>
            </div>
        ) : (
            <div className="flex-1">
                <GraphCard graphClicked={graphClicked}>
                    <GraphTitle
                        title="Earning per Share"
                        explanation={explanation}
                        percentChange={percentChange}
                        timeRange={timeRange}
                        setTimeRange={setTimeRange}
                        graphClicked={graphClicked}
                        setGraphClicked={setGraphClicked}
                    />
                    <div onClick={() => {setGraphClicked(true);}} className="min-h-0 w-full flex-1">
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
                            <CartesianGrid strokeDasharray="" vertical={false} stroke="var(--main-dry-sage)"/>
                            <XAxis dataKey="fiscalDateEnding" stroke="var(--text-main)" interval="equidistantPreserveStart" tick={{fontSize: 12}} />
                            <YAxis tickFormatter={(value) => `$${value.toFixed(2)}`} stroke="var(--text-main)" domain={[dataMin => dataMin * 0.95, dataMax => dataMax * 1.05]}/>
                            <Tooltip formatter={(value) => `$${value}`}/>
                            <Legend />
                            <Line name="reported EPS" type="monotone" dataKey="reportedEPS" stroke="#588157" strokeWidth={0} dot={{ fill: "#588157", r: 5}} activeDot={{ r: 8, fill: "#A3B18A"}} legendType="circle" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </GraphCard>
            </div>
        )
    )
}

export default EPSGraph
