import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import styles from "./Overview.module.css"

function EPSGraph(props) {
    return (
        <div className={styles.graph}>
            <h2>Earning Per Share</h2>
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
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="reportedEPS" stroke="None" dot={{fill: "#A3B18A", r: 6}} activeDot={{ r: 6, fill: "#588157" }}/>
                    <Line type="monotone" dataKey="estimatedEPS" stroke="None" dot={{stroke: "grey", fill: "None", r: 6}} activeDot={{ r: 6, strokeWidth: 2 }}/>
                </LineChart>
            </ResponsiveContainer>
        </div>
    )
}

export default EPSGraph
