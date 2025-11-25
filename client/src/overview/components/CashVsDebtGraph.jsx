import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import styles from "./graph.module.css"
import TimeRanges from "./TimeRanges.jsx"
import {useState, useEffect, useRef} from "react"
import {filterReports, getPercentChange} from "../../helpers/GraphsHelper.js"
import Explanation from "./Explanation.jsx"
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

function CashVsDebtGraph(props) {
    const [timeRange, setTimeRange] = useState("all");
    const reports = filterReports(props.reports, timeRange);
    const cashPercentChange = getPercentChange(reports, "cash");
    const debtPercentChange = getPercentChange(reports, "debt");
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
                Cash and Cash Equivalents At Carrying Value is liquid assets (things a company can easily convert to cash, such as cash on hand, bank accounts, marketable securities like stocks and bonds, and accounts receivable) the company owns.
            </p>
            <p className={styles.explanationText}>
                Debt is money borrowed and owed to others, typically with interest
            </p>
            <h1>Calculation</h1>
            <p className={styles.explanationFormular}>Cash = Cash + Current bank accounts + Short-Term, Liquid Securities</p>
            <p className={styles.explanationFormular}>Debt = Short Term Debt + Long Term Debt</p>
            <h1>Interpretation</h1>
            <ul>
                <li className={styles.explanationText}><TrendingUpIcon sx={{ color: "green", bgcolor: "white", borderRadius: "10px",}} /> Cash Uptrend is when a company is generating more cash than it is spending (positive cash flow) or raising funds through new investments/financing. This is usually a strong positive sign, indicating stability and resources for future growth.</li>
                <li className={styles.explanationText}><TrendingDownIcon sx={{ color: "red", bgcolor: "white", borderRadius: "10px",}} /> Cash Downtrend is when a company is burning through its cash reserves faster than it is generating new cash (negative cash flow). This is often a warning sign of operational or liquidity issues, though it could also be a temporary result of a large strategic investment.</li>
                <li className={styles.explanationText}><TrendingUpIcon sx={{ color: "green", bgcolor: "white", borderRadius: "10px",}}/> Debt Uptrend is wheb a company is taking on more debt. This can be a strategic positive if the money is used to fund profitable expansions, but it becomes a negative if the company cannot manage the increased interest payments or faces difficulty repaying the principal.</li>
                <li className={styles.explanationText}><TrendingDownIcon sx={{ color: "red", bgcolor: "white", borderRadius: "10px",}} /> Debt Downtrend is when a company is paying down its existing debt. This is generally a very positive sign, as it reduces financial risk, lowers interest expenses, and improves long-term financial stability.</li>
            </ul>
        </>
    )

    return (
        <div className={graphClicked ? styles.graphClicked : styles.graph} ref={graphRef}>
            <div className={styles.titleAndTimeRanges}>
                <div className={styles.titleContainer}>
                    <h2>Cash v Debt</h2>
                    <Explanation explanation={explanation} maxWidth={graphClicked ? 900 : null} /> {/*maxWidth is a prop sent to set the maxWidth of the graph*/}
                </div>
                <div className={styles.percentChangeContainer}>
                    <h4 style={{ color: cashPercentChange >= 0 ? "#3A5A40" : "#bc4749", margin: 0 }}>Cash: {cashPercentChange >= 0 ? `+${cashPercentChange}%` : `${cashPercentChange}%`}</h4>
                    <h4 style={{ color: debtPercentChange >= 0 ? "#3A5A40" : "#bc4749", margin: 0 }}>Debt: {debtPercentChange >= 0 ? `+${debtPercentChange}%` : `${debtPercentChange}%`}</h4>
                </div>
                <TimeRanges timeRange={timeRange} setTimeRange={setTimeRange}  menuContainer={graphRef.current}/>
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
        </div>
    )
}


export default CashVsDebtGraph
