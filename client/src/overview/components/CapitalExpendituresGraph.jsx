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
        <>
            <h1>What is it?</h1>
            <p className={styles.explanationText}>
                Capital expenditure (CapEx) is the money a company spends on long-term physical assets like property, buildings, and machinery.
            </p>
            <h1>Calculation</h1>
            <p className={styles.explanationFormular}>CapEx = (Ending PP&E - Beginning PP&E) + Depreciation Expense</p>
            <h1>Interpretation</h1>
            <ul>
                <li className={styles.explanationText}><TrendingUpIcon sx={{ color: "green", bgcolor: "white", borderRadius: "10px",}} /> Upward trend often signifies expansion, investment in new technology, or replacement of aging equipment, suggesting the company is growing or trying to increase efficiency</li>
                <li className={styles.explanationText}><TrendingDownIcon sx={{ color: "red", bgcolor: "white", borderRadius: "10px",}}/> Downward trend can mean reduced investment in assets, which could signal market uncertainty, reduced growth prospects, or that the company is in a mature phase.</li>
            </ul>
        </>
    )

    return (
        <div className={graphClicked ? styles.graphClicked : styles.graph} ref={graphRef}>
            <div className={styles.titleAndTimeRanges}>
                <div className={styles.titleContainer}>
                    <h2>Capital Expenditures</h2>
                    <Explanation explanation={explanation} />
                </div>
                <h3 style={{color: percentChange >= 0 ? "#3A5A40" : "#bc4749"}}>{percentChange >= 0 ? `+${percentChange}%` : `${percentChange}%`}</h3>
                <TimeRanges timeRange={timeRange} setTimeRange={setTimeRange} menuContainer={graphRef.current} />
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
            </div>
        </div>
    )
}

export default CapitalExpendituresGraph
