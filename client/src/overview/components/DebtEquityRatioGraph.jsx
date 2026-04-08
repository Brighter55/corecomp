import GraphTitle from "./GraphTitle.jsx"
import GraphCard from "./GraphCard.jsx"
import NoDataGraph from "./NoDataGraph.jsx"
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import {useState, useEffect, useRef, useMemo} from "react"
import {filterReports, getPercentChange} from "../../helpers/GraphsHelper.js"
import Skeleton from '@mui/material/Skeleton';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import CustomBar from "./CustomBar.jsx"
import CustomActiveBar from "./CustomActiveBar.jsx"

const explanation = (
  <Stack spacing={2}>
      <Typography variant="explanationTopic">What is it?</Typography>
      <Typography variant="explanationText">
          The debt-to-equity (D/E) ratio measures a company's financial leverage by dividing its total liabilities by shareholder equity. It shows how much debt a company uses to finance assets relative to the value of shareholders' equity. A lower ratio implies less risk, while a higher ratio indicates greater leverage.
      </Typography>
      <Typography variant="explanationTopic">Calculation</Typography>
      <Typography
          variant="explanationText"
          sx={{ fontFamily: "'Times New Roman', Times, 'Segoe Ui', Arial, sans-serif" }}
      >
          Debt/Equity Ratio = Short Term & Long Term Debt / Total Shareholder Equity
      </Typography>
      <Typography variant="explanationTopic">Interpretation</Typography>
      <Stack direction="column" spacing={1}>
          <Typography variant="explanationText">
              High D/E Ratio (&gt; 1.5–2.0): Suggests the company is financing growth heavily through debt. This indicates higher risk, especially during economic downturns, as interest expenses must be paid regardless of earnings.
          </Typography>
          <Typography variant="explanationText">
              Low D/E Ratio (&lt; 1.0): Suggests a more conservative approach with less debt and stronger equity backing, typically seen as more stable.
          </Typography>
          <Typography variant="explanationText">
              Note: The definition of a "good" ratio varies by industry; capital-intensive industries (e.g., manufacturing, utilities) often have higher acceptable ratios (e.g., 2.0 or higher) compared to technology companies.
          </Typography>
      </Stack>
  </Stack>
)


export default function DebtEquityRatioGraph({ statement, period }) {
    const [timeRange, setTimeRange] = useState("all");
    const [graphClicked, setGraphClicked] = useState(false);

    const graphRef = useRef(null);

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
        if (Array.isArray(statement) && statement.length === 0) return [];

        const filteredReports = filterReports(statement[period === "annually" ? "annualReports" : "quarterlyReports"], timeRange, "fiscalDateEnding");
        console.log("DebtEquityRatioGraph: ", filteredReports);
        return filteredReports;
    }, [statement, timeRange, period]);

    const percentChange = useMemo(() => {
        if (!reports.length) {
            return NaN;
        }
        const percentChange = getPercentChange(reports, "DebtEquityRatio");
        return percentChange;
    }, [reports]);

    if (statement === null) {
        return <Skeleton variant="rounded" sx={{ flex: 1, height: "20rem" }}/>;
    }
    if (Array.isArray(statement) && statement.length === 0) {
        return <NoDataGraph />;
    }

    return (
            <Box sx={{ flex: 1 }}>
                <GraphCard ref={graphRef} graphClicked={graphClicked}>
                    <GraphTitle
                        title="Debt/Equity Ratio"
                        explanation={explanation}
                        percentChange={percentChange}
                        timeRange={timeRange}
                        setTimeRange={setTimeRange}
                    />
                    <Box onClick={() => {setGraphClicked(true);}} sx={{ width: "100%", height: "100%" }}>
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
                                <YAxis stroke="#344E41" />
                                <Tooltip />
                                <Bar name="Debt/Equity Ratio" dataKey="DebtEquityRatio" shape={<CustomBar></CustomBar>} activeBar={<CustomActiveBar></CustomActiveBar>}/>
                            </BarChart>
                        </ResponsiveContainer>
                    </Box>
                </GraphCard>
            </Box>
    );
    }
