import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import styles from "./Overview.module.css"
import TimeRanges from "./TimeRanges/TimeRanges.jsx"
import {useState, useEffect} from "react"
import {filterReports, getPercentChange} from "../helpers/GraphsHelper.js"

function CashVsDebtGraph(props) {
    const [timeRange, setTimeRange] = useState("all");
    const reports = filterReports(props.reports, timeRange);
    const cashPercentChange = getPercentChange(reports, "cash");
    const debtPercentChange = getPercentChange(reports, "debt");
    const [graphClicked, setGraphClicked] = useState(false);

    function countDigits(value) {
        if (value === 0) {
            return 1;
        }
        return Math.floor(Math.log10(Math.abs(value))) + 1;
    }

    return (
        <div className={graphClicked ? styles.graphClicked : styles.graph} onClick={() => {setGraphClicked(true);}}>
            <div className={styles.titleAndTimeRanges}>
                <h2 className={styles.title}>Cash v Debt</h2>
                <h3 style={{color: cashPercentChange >= 0 ? "#3A5A40" : "#bc4749"}}>Cash: {cashPercentChange >= 0 ? `+${cashPercentChange}%` : `-${cashPercentChange}%`}</h3>
                <h3 style={{color: debtPercentChange >= 0 ? "#3A5A40" : "#bc4749"}}>Debt: {debtPercentChange >= 0 ? `+${debtPercentChange}%` : `-${debtPercentChange}%`}</h3>
                <TimeRanges className={styles.timeRanges} timeRange={timeRange} setTimeRange={setTimeRange}/>
            </div>
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
                    <CartesianGrid  strokeDasharray="" vertical={false} stroke="#A3B18A"/>
                    <XAxis dataKey="date" stroke="#344E41" interval="equidistantPreserveStart" tick={{fontSize: 12}} />
                    <YAxis tickFormatter={(value) => {
                        if (countDigits(value) >= 10) {return `${(value / 1000000000).toFixed(2)}B`}
                        if (countDigits(value) >= 7) {return `${(value / 1000000).toFixed(2)}M`}
                        return value
                    }} stroke="#344E41" domain={[dataMin => dataMin * 0.95, dataMax => dataMax * 1.05]} />
                    <Tooltip formatter={(value) => {
                        if (countDigits(value) >= 10) {return `${value / 1000000000}B`}
                        if (countDigits(value) >= 7) {return `${value / 1000000}M`}
                        return value
                    }}/>
                    <Legend />
                    <Bar dataKey="cash" stackId="a" fill="#588157"  activeBar={{ fill: "#A3B18A", stroke: "#DAD7CD", strokeWidth: 2 }}/>
                    <Bar dataKey="debt" stackId="a" fill="#bc4749" activeBar={{ fill: "#B35C5E", stroke: "#DAD7CD", strokeWidth: 2 }}/> {/*dont have to think about negative value, handle active bar*/}
                </BarChart>
            </ResponsiveContainer>
        </div>
    )
}


export default CashVsDebtGraph
