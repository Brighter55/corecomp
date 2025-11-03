import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import styles from "./Overview.module.css"
import TimeRanges from "./TimeRanges/TimeRanges.jsx"
import {useState, useEffect} from "react"
function PricingGraph(props) {
    const [timeRange, setTimeRange] = useState("all");
    const [reports, setReports] = useState(props.reports);

    useEffect(() => {
        setReports(filterReports);
    }, [props.reports, timeRange]);

    function getStartIndex(year) {
        /*get targetMonth and targetYear from the last element in props.reports*/
        const lastDate = props.reports[props.reports.length - 1].date;
        const lastDateObject = new Date(lastDate);
        const targetMonth = lastDateObject.getMonth();
        const targetYear = lastDateObject.getFullYear() - year;
        // get the startIndex to filter the reports
        const startIndex = props.reports.findIndex((report) => {
            const currentReportDateObject = new Date(report.date);
            const currentReportDateMonth = currentReportDateObject.getMonth();
            const currentReportDateYear = currentReportDateObject.getFullYear();
            return (currentReportDateMonth === targetMonth && currentReportDateYear === targetYear);
        });
        return startIndex;
    }

    function filterReports() {
        let filteredReports;
        switch (timeRange) {
            case "YTD": {
                /*get targetMonth and targetYear from the last element in props.reports*/
                const lastDate = props.reports[props.reports.length - 1].date;
                const lastDateObject = new Date(lastDate);
                const targetMonth = 0;
                const targetYear = lastDateObject.getFullYear();
                console.log(targetMonth, targetYear);
                // get the startIndex to filter the reports
                const startIndex = props.reports.findIndex((report) => {
                    const currentReportDateObject = new Date(report.date);
                    const currentReportDateMonth = currentReportDateObject.getMonth();
                    const currentReportDateYear = currentReportDateObject.getFullYear();
                    return (currentReportDateMonth === targetMonth && currentReportDateYear === targetYear);
                });
                filteredReports = props.reports.slice(startIndex);
                break;
            }
            case "1Y": {
                const startIndex = getStartIndex(1);
                filteredReports = props.reports.slice(startIndex);
                break;
            }
            case "5Y": {
                const startIndex = getStartIndex(5);
                filteredReports = props.reports.slice(startIndex);
                break;
            }
            case "10Y": {
                const startIndex = getStartIndex(10);
                filteredReports = props.reports.slice(startIndex);
                break;
            }
            default:
                console.log("return all (default)");
                return props.reports;
        }
        console.log("return", filteredReports, timeRange);
        return filteredReports;
    }
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
                        tick={{fontSize: 12}} interval="equidistantPreserveStart"
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
