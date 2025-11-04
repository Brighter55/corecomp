import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import styles from "./Overview.module.css"
import TimeRanges from "./TimeRanges/TimeRanges.jsx"
import {useState, useEffect} from "react"
import {filterReports} from "../helpers/GraphsHelper.js"

function EPSGraph(props) {
    const [timeRange, setTimeRange] = useState("all");
    const [reports, setReports] = useState(props.reports);

    useEffect(() => {
        setReports(filterReports(props.reports, timeRange));
    }, [props.reports, timeRange]);

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
        return <circle cx={cx} cy={cy} stroke={stroke} payload={payload} value={value} fill={color} r={5}></circle>
    }

    function CustomActiveDot(props) {
        const { cx, cy, stroke, payload, value } = props;
        const color = payload.surprisePercentage >= 0 ? "#588157" : "#bc4749";
        return <circle cx={cx} cy={cy} stroke={stroke} payload={payload} value={value} fill={color} r={8} strokeWidth={1}></circle>
    }

    return (
        props.period === "quarterly" ? (
            <div className={styles.graph}>
                <div className={styles.titleAndTimeRanges}>
                    <h2 className={styles.title}>Earning per Share</h2>
                    <TimeRanges className={styles.timeRanges} timeRange={timeRange} setTimeRange={setTimeRange}/>
                </div>
                <ResponsiveContainer width="100%" height={400}>
                    <LineChart
                    data={reports}
                    margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                    }}
                    >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" stroke="#DAD7CD" interval="equidistantPreserveStart" tick={{fontSize: 12}} />
                    <YAxis tickFormatter={(value) => value.toFixed(2)} stroke="#DAD7CD" domain={[dataMin => dataMin * 0.95, dataMax => dataMax * 1.05]}/>
                    <Tooltip content={<CustomTooltip></CustomTooltip>} />
                    <Legend />
                    <Line type="monotone" dataKey="estimatedEPS" stroke="#DAD7CD" strokeWidth={0} dot={{ fill: "#DAD7CD", fillOpacity: 0.3, r: 5}} activeDot={{ r: 8, strokeWidth: 1}} legendType="circle"/>
                    <Line type="monotone" dataKey="reportedEPS" stroke="#588157" strokeWidth={0} dot={<CustomDot></CustomDot>} activeDot={<CustomActiveDot></CustomActiveDot>} legendType="circle" />
                    </LineChart>
                </ResponsiveContainer>
            </div>)
        : (
            <div className={styles.graph}>
                <div className={styles.titleAndTimeRanges}>
                    <h2 className={styles.title}>Earning per Share</h2>
                    <TimeRanges className={styles.timeRanges} timeRange={timeRange} setTimeRange={setTimeRange}/>
                </div>
                <ResponsiveContainer width="100%" height={400}>
                    <LineChart
                    data={reports}
                    margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                    }}
                    >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" stroke="#DAD7CD" interval="equidistantPreserveStart" tick={{fontSize: 12}} />
                    <YAxis tickFormatter={(value) => value.toFixed(2)} stroke="#DAD7CD" domain={[dataMin => dataMin * 0.95, dataMax => dataMax * 1.05]}/>
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="reportedEPS" stroke="#588157" strokeWidth={0} dot={{ fill: "#588157", r: 5}} activeDot={{ r: 8, fill: "#A3B18A"}} legendType="circle" />
                    </LineChart>
                </ResponsiveContainer>
            </div>)
    )
}

export default EPSGraph
