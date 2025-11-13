import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import styles from "./Overview.module.css"
import TimeRanges from "./TimeRanges/TimeRanges.jsx"
import {useState, useEffect} from "react"
import {filterReports, getPercentChange} from "../helpers/GraphsHelper.js"


function PricingGraph(props) {
    const [timeRange, setTimeRange] = useState("all");
    const reports = filterReports(props.reports, timeRange);
    const percentChange = getPercentChange(reports, "adjusted close");
    const [graphClicked, setGraphClicked] = useState(false);

    return (
        <div className={graphClicked ? styles.graphClicked : styles.graph} onClick={() => {setGraphClicked(true);}}>
            <div className={styles.titleAndTimeRanges}>
                <h2 className={styles.title}>Adjusted Monthly Pricing</h2>
                <h3 style={{color: percentChange >= 0 ? "#3A5A40" : "#bc4749"}}>{percentChange >= 0 ? `+${percentChange}%` : `-${percentChange}%`}</h3>
                <TimeRanges className={styles.timeRanges} timeRange={timeRange} setTimeRange={setTimeRange}/>
            </div>

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
                    <XAxis dataKey="date" stroke="#344E41"
                        tick={{fontSize: 12}} interval="equidistantPreserveStart"
                    />
                    <YAxis stroke="#344E41" domain={[dataMin => dataMin * 0.95, dataMax => dataMax * 1.05]}
                        allowDecimals={false}
                    />
                    <Tooltip />
                    <Line type="linear" dataKey="adjusted close" stroke="#588157" dot={false} activeDot={false} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    )
}

export default PricingGraph
