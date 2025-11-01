import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import styles from "./Overview.module.css"
import TimeRanges from "./TimeRanges/TimeRanges.jsx"
import {useState} from "react"
function PricingGraph(props) {
    const [timeRange, setTimeRange] = useState("all");

    function convertToUnix(reports) {
        const UnixReports = reports.map((report) => {
            const dateObject = new Date(report.date);
            const milliseconds = dateObject.getTime();
            const unixDate = Math.floor(milliseconds / 1000);

            return {...report, date: unixDate};
        });
        return UnixReports;
    }

    function getDomain() {
        switch (timeRange) {
            case "YTD": /*startDate is first month of this year, endDate is today's month */
                const endDateUnix = reports[reports.length - 1].date;
                const latestDate = new Date(endDateUnix * 1000);
                const latestDateYear = latestDate.getFullYear();
                const latestDateMonth = latestDate.getMonth();
                const firstMonthReport = reports.find((report) => {
                    const dateUnix = report.date;
                    const date = new Date(dateUnix * 1000);
                    const dateMonth = date.getMonth();
                    const dateYear = date.getFullYear();
                    return dateMonth == 0 && dateYear == latestDateYear;
                });
                const startDateUnix = firstMonthReport.date;
            /*
            case "1Y": /*startDate is one year from today's month, endDate is the last element in the list
                ...
            case "5YD":
                ...
            case "10YD":
                ...
            */
            case "all":
                console.log("undefined");
                return undefined;
        }
        console.log(`[${startDateUnix}, ${endDateUnix}]`);
        return [startDateUnix, endDateUnix];
    }

    const reports = convertToUnix(props.reports);

    return (
        <div className={styles.graph}>
            <div className={styles.titleAndTimeRanges}>
                <h2 className={styles.title}>Adjusted Monthly Pricing</h2>
                <TimeRanges className={styles.timeRanges} timeRange={timeRange} setTimeRange={setTimeRange}/>
            </div>

            <ResponsiveContainer width="100%" height={400}>
                <LineChart
                    data={reports}
                    margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" stroke="#DAD7CD"
                        tick={{fontSize: 12}} domain={getDomain} type="category"
                    />
                    <YAxis stroke="#DAD7CD" />
                    <Tooltip />
                    <Line type="linear" dataKey="adjusted close" stroke="#A3B18A" dot={false} activeDot={false} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    )
}

export default PricingGraph
