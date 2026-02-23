import sampleReports from "../sample-data/sampleData.json"
import { BarChart, Bar, Rectangle, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useState, useRef, useEffect, useMemo } from "react"
import {filterReports, getPercentChange, formatToUnits} from "../../helpers/GraphsHelper.js"
// borrows from overview page
import GraphTitle from "../../overview/components/GraphTitle.jsx"
import { explanation } from "../../overview/components/NetIncomeGraph.jsx"
import CustomBar from "../../overview/components/CustomBar.jsx"
import CustomActiveBar from "../../overview/components/CustomActiveBar.jsx"
// mui components
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';


function SampleIncomeGraph({ key }) {
    const [timeRange, setTimeRange] = useState("all");
    const [graphClicked, setGraphClicked] = useState(false);

    const graphRef = useRef(null);

    const statement = sampleReports;
    console.log(statement);
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

    const reports = useMemo(() => {
        if (!statement) return [];

        const filteredReports = filterReports(statement["annualReports"], timeRange, "fiscalDateEnding");
        console.log(filteredReports);
        return filteredReports;
    }, [timeRange]);

    const percentChange = useMemo(() => {
        if (!reports.length) {
            return null;
        }
        const percentChange = getPercentChange(reports, "netIncome");
        return percentChange;
    }, [reports]);

    return (
        <Stack
            ref={graphRef}
            sx={
                graphClicked ? {
                    position: "fixed",
                    height: "80vh",
                    width: "90vw",
                    top: "10vh",
                    left: "5vw",
                    background: "var(--main-dust-grey)",
                    color: "var(--main-pine-teal)",
                    borderRadius: "10px",
                    zIndex: 3,
                } : {
                    height: "100%",
                    width: {xs: "100%", sm: "80%"},
                    background: "var(--main-dust-grey)",
                    borderRadius: "10px",
                    color: "var(--main-pine-teal)",
                    transition: "width 0.3s ease-in-out",
                }
            }
        >
            <GraphTitle
                title="Net Income"
                explanation={explanation}
                percentChange={percentChange}
                timeRange={timeRange}
                setTimeRange={setTimeRange}
            />
            <Box
                sx={{ width: "100%", height: "100%" }}
                onClick={() => {setGraphClicked(true);}}
            >
                <ResponsiveContainer>
                    <BarChart
                        data={reports}
                        margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                        }}
                    >
                        <CartesianGrid strokeDasharray="" vertical={false} stroke="#A3B18A"/>
                        <XAxis dataKey="fiscalDateEnding" interval="equidistantPreserveStart" stroke="#344E41" tick={{fontSize: 12}} />
                        <YAxis tickFormatter={(value) => formatToUnits(value)} stroke="#344E41" domain={[dataMin => dataMin * 0.95, dataMax => dataMax * 1.05]} />
                        <Tooltip formatter={(value) => formatToUnits(value)} />
                        <Bar name="Net Income" dataKey="netIncome" shape={<CustomBar></CustomBar>}  activeBar={<CustomActiveBar></CustomActiveBar>} />
                    </BarChart>
                </ResponsiveContainer>
            </Box>
        </Stack>
    )
}

export default SampleIncomeGraph
