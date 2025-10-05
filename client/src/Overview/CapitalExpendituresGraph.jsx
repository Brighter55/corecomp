import React from 'react';
import { BarChart, Bar, Rectangle, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import styles from "./Overview.module.css"
import CustomBar from "./CustomBar.jsx"
import CustomActiveBar from "./CustomActiveBar.jsx"


function CapitalExpendituresGraph(props) {

    function countDigits(value) {
        if (value === 0) {
            return 1;
        }
        return Math.floor(Math.log10(Math.abs(value))) + 1;
    }

    return (
        <div className={styles.graph}>
            <h2>Capital Expenditures</h2>
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
                    <XAxis dataKey="date" interval="equidistantPreserveStart" stroke="#DAD7CD" tick={{fontSize: 12}} />
                    <YAxis tickFormatter={(value) => {
                        if (countDigits(value) >= 10) {return `${value / 1000000000}B`}
                        if (countDigits(value) >= 7) {return `${value / 1000000}M`}
                        return value
                    }} stroke="#DAD7CD"/>
                    <Tooltip formatter={(value) => {
                        if (countDigits(value) >= 10) {return `${value / 1000000000}B`}
                        if (countDigits(value) >= 7) {return `${value / 1000000}M`}
                        return value
                    }}/>
                    <Bar dataKey="capitalExpenditures" shape={<CustomBar></CustomBar>}  activeBar={<CustomActiveBar></CustomActiveBar>} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    )
}

export default CapitalExpendituresGraph
