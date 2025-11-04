import { BarChart, Bar, Rectangle, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import styles from "./Overview.module.css"
import CustomBar from "./CustomBar.jsx"
import CustomActiveBar from "./CustomActiveBar.jsx"
import TimeRanges from "./TimeRanges/TimeRanges.jsx"
import {useState, useEffect} from "react"
import {filterReports, getPercentChange} from "../helpers/GraphsHelper.js"


function CapitalExpendituresGraph(props) {
    const [timeRange, setTimeRange] = useState("all");
    const reports = filterReports(props.reports, timeRange);
    const percentChange = getPercentChange(reports, "capitalExpenditures");

    function countDigits(value) {
        if (value === 0) {
            return 1;
        }
        return Math.floor(Math.log10(Math.abs(value))) + 1;
    }

    return (
        <div className={styles.graph}>
            <div className={styles.titleAndTimeRanges}>
                <h2 className={styles.title}>Capital Expenditures</h2>
                <h3 style={{color: percentChange >= 0 ? "#A3B18A" : "#bc4749"}}>{percentChange >= 0 ? `+${percentChange}%` : `-${percentChange}%`}</h3>
                <TimeRanges className={styles.timeRanges} timeRange={timeRange} setTimeRange={setTimeRange}/>
            </div>
            <ResponsiveContainer width="100%" height={400}>
                <BarChart
                    data={reports}
                    margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" interval="equidistantPreserveStart" stroke="#DAD7CD" tick={{fontSize: 12}} />
                    <YAxis tickFormatter={(value) => {
                        if (countDigits(value) >= 10) {return `${(value / 1000000000).toFixed(2)}B`}
                        if (countDigits(value) >= 7) {return `${(value / 1000000).toFixed(2)}M`}
                        return value
                    }} stroke="#DAD7CD" domain={[dataMin => dataMin * 0.95, dataMax => dataMax * 1.05]}/>
                    <Tooltip formatter={(value) => {
                        if (countDigits(value) >= 10) {return `${value / 1000000000}B`}
                        if (countDigits(value) >= 7) {return `${value / 1000000}M`}
                        return value
                    }}/>
                    <Bar dataKey="capitalExpenditures" shape={<CustomBar></CustomBar>}  activeBar={<CustomActiveBar></CustomActiveBar>} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    )
}

export default CapitalExpendituresGraph
