import { useState } from "react"
import { BarChart, Bar, Rectangle, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import styles from "./Overview.module.css"


function DividendsPayoutGraph(props) {
    const [graphClicked, setGraphClicked] = useState(false);

    function formatXAxis() {
        return props.reports ? props.reports.map((report, index) => {
            if (report.payment_date === "None") {
                return {...report, payment_date: `UnknownDate #${index}`};
            }
            return {...report, payment_date: `${report.payment_date} #${index}`};
        }) : [];
    }

    return (
        <div className={graphClicked ? styles.graphClicked : styles.graph} onClick={() => {setGraphClicked(true);}}>
            <h2>Dividends Payout per Share</h2>
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
    )
}

export default DividendsPayoutGraph
