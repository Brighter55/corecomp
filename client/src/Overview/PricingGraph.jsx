    import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import styles from "./Overview.module.css"
function PricingGraph(props) {
    return (
        <div className={styles.graph}>
            <h2>Adjusted Monthly Pricing</h2>
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
                    <XAxis dataKey="date" interval="equidistantPreserveStart" stroke="#DAD7CD" tick={{fontSize: 12}} />
                    <YAxis stroke="#DAD7CD" />
                    <Tooltip />
                    <Line type="linear" dataKey="adjusted close" stroke="#A3B18A" dot={false} activeDot={false} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    )
}

export default PricingGraph
