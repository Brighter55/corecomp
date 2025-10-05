import React from 'react';
import { BarChart, Bar, Rectangle, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import styles from "./Overview.module.css"


function DividendsPayoutGraph(props) {

    function formatXAxis() {
        return props.reports ? props.reports.map((report, index) => {
            if (report.payment_date === "None") {
                return {...report, payment_date: `UnknownDate #${index}`};
            }
            return {...report, payment_date: `${report.payment_date} #${index}`};
        }) : [];
    }

    return (
        <div className={styles.graph}>
            <h2>Dividends Payout per Share</h2>
            <ResponsiveContainer width="100%" height={400}>
                <BarChart
                    data={formatXAxis()}
                    margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="payment_date" interval="equidistantPreserveStart" stroke="#DAD7CD" tick={{fontSize: 12}}/>
                    <YAxis stroke="#DAD7CD"/>
                    <Tooltip />
                    <Bar dataKey="amount" fill="#A3B18A" activeBar={<Rectangle fill="#588157" stroke="#DAD7CD"/>}/>
                </BarChart>
            </ResponsiveContainer>
        </div>
    )
}

export default DividendsPayoutGraph
