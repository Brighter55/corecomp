import { BarChart, Bar, Rectangle, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import styles from "./graph.module.css"
import TimeRanges from "./TimeRanges.jsx"
import {useState, useEffect, useRef} from "react"
import {filterReports, getPercentChange} from "../../helpers/GraphsHelper.js"
import Explanation from "./Explanation.jsx"
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

function SharesOutstandingGraph(props) {
    const [timeRange, setTimeRange] = useState("all");
    const reports = filterReports(props.reports, timeRange);
    const percentChange = getPercentChange(reports, "shares_outstanding_basic");
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
                Basic shares outstanding are the total shares issued and available for trading in the stock market. This includes shares held by both institutions and individual investors. However, this doesn't include Treasury shares (shares repurchased by the company and held in its treasury).
            </p>
            <h1>Calculation</h1>
            <p className={styles.explanationFormular}>Outstanding Shares = Issued shares - Treasury shares</p>
            <h1>Interpretation</h1>
            <ul>
                <li className={styles.explanationText}><TrendingUpIcon sx={{ color: "green", bgcolor: "white", borderRadius: "10px",}} /> Shares Outstanding increases when a company is issuing and selling new shares to raise their capital</li>
                <li className={styles.explanationText}><TrendingDownIcon sx={{ color: "red", bgcolor: "white", borderRadius: "10px",}}/> Shares Outstanding decreases when a company repurchases its own shares and holds them as treasury stock. The process is called "Share Buybacks"</li>
                <li className={styles.explanationText}>Shares Outstanding stays stable when a company isn’t raising new capital or aggressively buying back shares.</li>
            </ul>
        </>
    )

    return (
        <div className={graphClicked ? styles.graphClicked : styles.graph} ref={graphRef}>
            <div className={styles.titleAndTimeRanges}>
                <div className={styles.titleContainer}>
                    <h2>SharesOutstanding</h2>
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
                        <CartesianGrid strokeDasharray="" vertical={false} stroke="#A3B18A" />
                        <XAxis dataKey="date" interval="equidistantPreserveStart" stroke="#344E41" tick={{fontSize: 12}}/>
                        <YAxis tickFormatter={(value) => {
                            if (countDigits(value) >= 10) {return `${(value / 1000000000).toFixed(2)}B`}
                            if (countDigits(value) >= 7) {return `${(value / 1000000).toFixed(2)}M`}
                            return value
                        }} stroke="#344E41" domain={[dataMin => dataMin * 0.95, dataMax => dataMax * 1.05]}

                        />
                        <Tooltip formatter={(value) => {
                            if (countDigits(value) >= 10) {return `${value / 1000000000}B`}
                            if (countDigits(value) >= 7) {return `${value / 1000000}M`}
                            return value
                        }} />
                        <Bar dataKey="shares_outstanding_basic" fill="#588157" activeBar={<Rectangle fill="#A3B18A"/>}/>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}

export default SharesOutstandingGraph
