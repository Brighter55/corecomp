import { BarChart } from '@mui/x-charts/BarChart';
import GraphTitle from "./GraphTitle.jsx"
import GraphCard from "./GraphCard.jsx"
import Box from '@mui/material/Box';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import {useState, useEffect, useRef} from "react"
import {filterReports, getPercentChange} from "../../helpers/GraphsHelper.js"

const explanation = (
  <Stack spacing={2}>
      <Typography variant="explanationTopic">What is it?</Typography>
      <Typography variant="explanationText">
          Net income is a company's profit after all expenses and taxes have been deducted from its total revenue.
      </Typography>
      <Typography variant="explanationTopic">Calculation</Typography>
      <Typography
          variant="explanationText"
          sx={{ fontFamily: "'Times New Roman', Times, 'Segoe Ui', Arial, sans-serif" }}
      >
          Net Income = Total Revenue – Total Expenses
      </Typography>
      <Typography variant="explanationTopic">Interpretation</Typography>
      <Stack direction="row" spacing={1}>
          <TrendingUpIcon
              sx={{ color: "green", bgcolor: "white", borderRadius: "10px",}}
          />
          <Typography variant="explanationText">
              A positive trend shows the company is improving its financial performance.
          </Typography>
      </Stack>
      <Stack direction="row" spacing={1}>
          <TrendingDownIcon
              sx={{ color: "red", bgcolor: "white", borderRadius: "10px",}}
          />
          <Typography variant="explanationText">
              A negative trend can be a warning sign, even if it remains positive. It suggests the company may be facing challenges in its operations or market.
          </Typography>
      </Stack>
  </Stack>
)


export default function ProfitMarginGraph({ symbol, fetchVersion, setSymbol, period }) {
  const [timeRange, setTimeRange] = useState("all");
  const reports = filterReports(data.period, timeRange);
  const percentChange = getPercentChange(reports, "income"); // TODO: continue here has to parse the data for profit margin
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

  return (
    <Box sx={{ flex: 1 }}>
      <GraphCard ref={graphRef} graphClicked={graphClicked}>
        <GraphTitle
          title="Profit Margin"
          explanation={explanation}
          percentChange={percentChange}
          timeRange={timeRange}
          setTimeRange={setTimeRange}
        />
        <Box onClick={() => {setGraphClicked(true);}} sx={{ width: "100%", flexGrow: 1, overflow: "hidden"}}>
          <BarChart
            dataset={reports}
            xAxis={[{ dataKey: "date" }]}
            series={[{ dataKey: "income", label: "income", color: "red" }]}
          />
        </Box>
      </GraphCard>
    </Box>
  );
}
