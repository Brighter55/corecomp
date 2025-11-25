import { useState, useRef, useEffect} from "react"
import { BarChart, Bar, Rectangle, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Explanation from "./Explanation.jsx"
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
// styles
import styles from "./graph.module.css"


function DividendsPayoutGraph(props) {
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

    function formatXAxis() {
        return props.reports ? props.reports.map((report, index) => {
            if (report.payment_date === "None") {
                return {...report, payment_date: `UnknownDate #${index}`};
            }
            return {...report, payment_date: `${report.payment_date} #${index}`};
        }) : [];
    }

    const explanation = (
        <>
            <h1>What is it?</h1>
            <p className={styles.explanationText}>
                A dividend payout is the distribution of a portion of a company's earnings to its shareholders. Companies use dividends to reward investors, typically in cash, on a quarterly basis, though some pay monthly or annually. The amount received by a shareholder depends on the number of shares owned and the dividend declared per share.
            </p>
            <h1>Interpretation</h1>
            <ul>
                <li className={styles.explanationText}><TrendingUpIcon sx={{ color: "green", bgcolor: "white", borderRadius: "10px",}} /> A steady or increasing DPS suggests a company is generating strong profits and has the cash flow to distribute to its shareholders.</li>
                <li className={styles.explanationText}><TrendingDownIcon sx={{ color: "red", bgcolor: "white", borderRadius: "10px",}}/> A lower DPS might mean the company is prioritizing reinvesting its earnings back into the business to fuel future growth</li>
                <li className={styles.explanationText}>A history of consistent or growing DPS can indicate a reliable income source.</li>
                <li className={styles.explanationText}>A significant reduction or elimination of dividends can be a warning sign to financial hardship, declining profits, or a change in management's priorities.</li>
            </ul>
        </>
    )

    return (
        <div className={graphClicked ? styles.graphClicked : styles.graph} ref={graphRef}>
            <div className={styles.titleContainer}>
                <h2>Dividends Payout per Share</h2>
                <Explanation explanation={explanation} />
            </div>
            <div onClick={() => {setGraphClicked(true);}} style={{ width: "100%", height: "100%" }}>
                <ResponsiveContainer>
                    <BarChart
                        data={formatXAxis()}
                        margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                        }}
                    >
                        <CartesianGrid strokeDasharray="" vertical={false} stroke="#A3B18A" />
                        <XAxis dataKey="payment_date" interval="equidistantPreserveStart" stroke="#344E41" tick={{fontSize: 12}}/>
                        <YAxis stroke="#344E41"/>
                        <Tooltip />
                        <Bar dataKey="amount" fill="#588157" activeBar={<Rectangle fill="#A3B18A"/>}/>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}

export default DividendsPayoutGraph
