import { BarChart, Bar, Rectangle, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import styles from "./graph.module.css"
import CustomBar from "./CustomBar.jsx"
import CustomActiveBar from "./CustomActiveBar.jsx"
import TimeRanges from "./TimeRanges.jsx"
import {useState, useEffect, useRef} from "react"
import {filterReports, getPercentChange} from "../../helpers/GraphsHelper.js"
import Explanation from "./Explanation.jsx"
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';


function NetIncomeGraph(props) {
    const [timeRange, setTimeRange] = useState("all");
    const reports = filterReports(props.reports, timeRange);
    const percentChange = getPercentChange(reports, "netIncome");
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

    function countDigits(value) {
        if (value === 0) {
            return 1;
        }
        return Math.floor(Math.log10(Math.abs(value))) + 1;
    }

    const explanation = (
        <>
            <h1>What is it?</h1>
            <p className={styles.explanationText}>
                Net income is a company's profit after all expenses and taxes have been deducted from its total revenue.
            </p>
            <h1>Calculation</h1>
            <p className={styles.explanationFormular}>Net Income = Total Revenue – Total Expenses</p>
            <h1>Interpretation</h1>
            <ul>
                <li className={styles.explanationText}><TrendingUpIcon sx={{ color: "green", bgcolor: "white", borderRadius: "10px",}} /> A positive trend shows the company is improving its financial performance.</li>
                <li className={styles.explanationText}><TrendingDownIcon sx={{ color: "red", bgcolor: "white", borderRadius: "10px",}}/> A negative trend can be a warning sign, even if it remains positive. It suggests the company may be facing challenges in its operations or market.</li>
            </ul>
        </>
    )

    return (
        <div className={graphClicked ? styles.graphClicked : styles.graph} ref={graphRef}>
            <div className={styles.titleAndTimeRanges}>
                <div className={styles.titleContainer}>
                    <h2>Net Income</h2>
                    <Explanation explanation={explanation} />
                </div>
                <h3 style={{color: percentChange >= 0 ? "#3A5A40" : "#bc4749"}}>{percentChange >= 0 ? `+${percentChange}%` : `${percentChange}%`}</h3>
                <TimeRanges className={styles.timeRanges} timeRange={timeRange} setTimeRange={setTimeRange} menuContainer={graphRef.current}/>
            </div>
            <div onClick={() => {setGraphClicked(true);}} style={{ width: "100%", height: "100%" }}>
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
                        <Bar dataKey="netIncome" shape={<CustomBar></CustomBar>} activeBar={<CustomActiveBar></CustomActiveBar>} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}


export default NetIncomeGraph
