import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import styles from "./graph.module.css"
import TimeRanges from "./TimeRanges.jsx"
import {useState, useEffect, useRef} from "react"
import {filterReports, getPercentChange} from "../../helpers/GraphsHelper.js"
import Explanation from "./Explanation.jsx"
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

function PricingGraph(props) {
    const [timeRange, setTimeRange] = useState("all");
    const reports = filterReports(props.reports, timeRange);
    const percentChange = getPercentChange(reports, "adjusted close");
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

    const explanation = (
        <>
            <h1>What is it?</h1>
            <p className={styles.explanationText}>
                Adjusted monthly pricing represents a company's stock price after accounting for corporate actions like stock splits and dividends, making historical prices comparable to current prices.
            </p>
            <h1>Examples</h1>
            <p className={styles.explanationText}>Dividends: When a company pays a cash dividend, the stock price typically drops by the dividend amount on the ex-dividend date. The adjusted price accounts for this by subtracting the dividend amount from the closing prices on and before the ex-dividend date, making the pre-dividend prices comparable to the post-dividend prices.</p>
            <p className={styles.explanationText}>Stock Splits: If a company has a 2-for-1 stock split, the share price immediately halves. To prevent a misleading vertical drop on the chart, all historical prices before the split date are divided by two when calculating the adjusted price.</p>
            <h1>Interpretation</h1>
            <ul>
                <li className={styles.explanationText}><TrendingUpIcon sx={{ color: "green", bgcolor: "white", borderRadius: "10px",}} /> An upward trend in the adjusted price means the stock's value has genuinely increased.</li>
                <li className={styles.explanationText}><TrendingDownIcon sx={{ color: "red", bgcolor: "white", borderRadius: "10px",}}/> A downward trend in the adjusted price suggests the stock's value has decreased.</li>
            </ul>
        </>
    )

    return (
        <div className={graphClicked ? styles.graphClicked : styles.graph} ref={graphRef}>
            <div className={styles.titleAndTimeRanges}>
                <div className={styles.titleContainer}>
                    <h2>Adjusted Monthly Pricing</h2>
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
        </div>
    )
}

export default PricingGraph
