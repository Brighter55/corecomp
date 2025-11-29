import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import styles from "./graph.module.css"
import TimeRanges from "./TimeRanges.jsx"
import {useState, useEffect, useRef} from "react"
import {filterReports, getPercentChange} from "../../helpers/GraphsHelper.js"
import Explanation from "./Explanation.jsx"
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';


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
        <>
            <h1>What is it?</h1>
            <p className={styles.explanationText}>
                A measure of a company's profitability, showing how much profit is generated for each share of stock
            </p>
            <h1>Calculation</h1>
            <p className={styles.explanationFormular}>EPS = Net Income / # of outstanding shares</p>
            <h1>Interpretation</h1>
            <ul>
                <li className={styles.explanationText}><TrendingUpIcon sx={{ color: "green", bgcolor: "white", borderRadius: "10px",}} /> Upward trend in EPS generally signifies growing profitability, which can lead to a higher stock price and increased investor confidence</li>
                <li className={styles.explanationText}><TrendingDownIcon sx={{ color: "red", bgcolor: "white", borderRadius: "10px",}}/> Downward trend in EPS signals declining profits, which often leads to a lower stock price and may indicate financial challenges. </li>
            </ul>
        </>
    )

    return (
        props.period === "quarterly" ? (
            <div className={graphClicked ? styles.graphClicked : styles.graph} ref={graphRef}>
                <div className={styles.titleAndTimeRanges}>
                    <div className={styles.titleContainer}>
                        <h2>Earning per Share</h2>
                        <Explanation explanation={explanation} />
                    </div>
                    <h3 style={{color: percentChange >= 0 ? "#3A5A40" : "#bc4749"}}>{percentChange >= 0 ? `+${percentChange}%` : `${percentChange}%`}</h3>
                    <TimeRanges timeRange={timeRange} setTimeRange={setTimeRange}  menuContainer={graphRef.current}/>
                </div>
                <div onClick={() => {setGraphClicked(true);}} style={{ width: "100%", height: "100%" }}>
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
                </div>
            </div>)
        : (
            <div className={graphClicked ? styles.graphClicked : styles.graph} ref={graphRef}>
                <div className={styles.titleAndTimeRanges}>
                    <div className={styles.titleContainer}>
                        <h2>Earning per Share</h2>
                        <Explanation explanation={explanation} />
                    </div>
                    <h3 style={{color: percentChange >= 0 ? "#3A5A40" : "#bc4749"}}>{percentChange >= 0 ? `+${percentChange}%` : `${percentChange}%`}</h3>
                    <TimeRanges timeRange={timeRange} setTimeRange={setTimeRange} menuContainer={graphRef.current}/>
                </div>
                <div onClick={() => {setGraphClicked(true);}} style={{ width: "100%", height: "100%" }}>
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
                </div>
            </div>)
    )
}

export default EPSGraph
