import React from 'react';
import { BarChart, Bar, Rectangle, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import styles from "./Overview.module.css"

function NetIncomeGraph(props) {

    return (
        <div className={styles.graph}>
            <h2>Net Income</h2>
            <ResponsiveContainer width="100%" height={400}>
                <BarChart
                    data={props.reports}
                    margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" stroke="#DAD7CD" interval="equidistantPreserveStart" tick={{fontSize: 12}} />
                    <YAxis tickFormatter={(value) => {
                        if (countDigits(value) >= 10) {return `${value / 1000000000}B`}
                        if (countDigits(value) >= 7) {return `${value / 1000000}M`}
                        return value
                    }} stroke="#DAD7CD" />
                    <Tooltip formatter={(value) => {
                        if (countDigits(value) >= 10) {return `${value / 1000000000}B`}
                        if (countDigits(value) >= 7) {return `${value / 1000000}M`}
                        return value
                    }}/>
                    <Bar dataKey="netIncome" fill="#A3B18A" activeBar={<Rectangle fill="#588157" stroke="#DAD7CD" />} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    )
}


export default NetIncomeGraph
