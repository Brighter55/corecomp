import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import styles from "./Overview.module.css"

function EPSGraph(props) {
    /*CustomTooltip*/
    function CustomTooltip(props) {
        const isVisible = props.active && props.payload && props.payload.length;
        return (
            <div className="custom-tooltip" style={{ visibility: isVisible ? 'visible' : 'hidden' }}>
                {isVisible && (
                    <>
                        <p className="date">{`Year: ${props.label}`}</p>
                        <p className="report">{`${props.payload[0].name}: ${props.payload[0].value}`}</p>
                        <p className="report">{`${props.payload[1].name}: ${props.payload[1].value}`}</p>
                        <p className="report">{`surprisePercentage: ${props.payload[0].payload.surprisePercentage}`}</p>
                    </>
                )}
            </div>
        );
    }

    return (
        <div className={styles.graph}>
            <h2>Earning per Share</h2>
            <ResponsiveContainer width="100%" height={400}>
                <LineChart
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
                <YAxis stroke="#DAD7CD"/>
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="reportedEPS" stroke="#588157" strokeWidth={0} dot={{ fill: "#588157", r: 5}} activeDot={{ r: 8, fill: "#3A5A40"}} legendType="circle" />
                {props.period == "quarterly" ? <Line type="monotone" dataKey="estimatedEPS" stroke="#DAD7CD" strokeWidth={0} dot={{ fill: "#DAD7CD", fillOpacity: 0.3, r: 5}} activeDot={{ r: 8, fillOpacity: 0.3}} legendType="circle"/> : <></>}
                </LineChart>
            </ResponsiveContainer>
        </div>
    )
}

export default EPSGraph
