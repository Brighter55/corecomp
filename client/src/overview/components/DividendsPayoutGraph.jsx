import { useState, useRef, useEffect} from "react"
import { BarChart, Bar, Rectangle, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
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

    return (
        <div className={graphClicked ? styles.graphClicked : styles.graph} ref={graphRef}>
            <h2>Dividends Payout per Share</h2>
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
