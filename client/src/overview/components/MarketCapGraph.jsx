import GraphTitle from "./GraphTitle.jsx"
import GraphCard from "./GraphCard.jsx"
import NoDataGraph from "./NoDataGraph.jsx"
import Box from '@mui/material/Box';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import {useState, useEffect, useRef, useMemo} from "react"
import {filterReports, getPercentChange, formatToUnits} from "../../helpers/GraphsHelper.js"
import Skeleton from '@mui/material/Skeleton';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import CustomBar from "./CustomBar.jsx"
import CustomActiveBar from "./CustomActiveBar.jsx"

const explanation = (
  <Stack spacing={2}>
	  <Typography variant="explanationTopic">What is it?</Typography>
	  <Typography variant="explanationText">
		  Market capitalization is the total value of a company based on its stock price and number of shares outstanding.
	  </Typography>
	  <Typography variant="explanationTopic">Calculation</Typography>
	  <Typography
		  variant="explanationText"
		  sx={{ fontFamily: "'Times New Roman', Times, 'Segoe Ui', Arial, sans-serif" }}
	  >
		  Market Cap = Share Price * Shares Outstanding
	  </Typography>
	  <Typography variant="explanationTopic">Interpretation</Typography>
	  <Stack direction="row" spacing={1}>
		  <TrendingUpIcon
			  sx={{ color: "green", bgcolor: "white", borderRadius: "10px",}}
		  />
		  <Typography variant="explanationText">
			  A rising market cap usually means investors are valuing the company more highly, often due to growth expectations or stronger fundamentals.
		  </Typography>
	  </Stack>
	  <Stack direction="row" spacing={1}>
		  <TrendingDownIcon
			  sx={{ color: "red", bgcolor: "white", borderRadius: "10px",}}
		  />
		  <Typography variant="explanationText">
			  A falling market cap can signal weaker market sentiment, earnings pressure, or broader risk-off conditions.
		  </Typography>
	  </Stack>
  </Stack>
)


export default function MarketCapGraph({ statement, period }) {
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
		console.log("MarketCapGraph: ", filteredReports);
		return filteredReports;
	}, [statement, timeRange, period]);

	const percentChange = useMemo(() => {
		if (!reports.length) {
			return NaN;
		}
		const percentChange = getPercentChange(reports, "marketCap");
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
						title="Market Cap"
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
								<YAxis
									stroke="#344E41"
									tickFormatter={(value) => formatToUnits(value)}
								/>
								<Tooltip formatter={(value) => formatToUnits(value)} />
								<Bar name="Market Cap" dataKey="marketCap" shape={<CustomBar></CustomBar>} activeBar={<CustomActiveBar></CustomActiveBar>}/>
							</BarChart>
						</ResponsiveContainer>
					</Box>
				</GraphCard>
			</Box>
	);
}
