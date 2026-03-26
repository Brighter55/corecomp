import GraphTitle from "./GraphTitle.jsx"
import GraphCard from "./GraphCard.jsx"
import NoDataGraph from "./NoDataGraph.jsx"
import Box from '@mui/material/Box';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import {useState, useEffect, useRef, useMemo} from "react"
import {filterReports, getPercentChange} from "../../helpers/GraphsHelper.js"
import { useNavigate } from "react-router-dom";
import { authenticatedClientWithRetry } from "../../helpers/api.js"
import Skeleton from '@mui/material/Skeleton';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import CustomBar from "./CustomBar.jsx"
import CustomActiveBar from "./CustomActiveBar.jsx"

const explanation = (
  <Stack spacing={2}>
	  <Typography variant="explanationTopic">What is it?</Typography>
	  <Typography variant="explanationText">
		  Price-to-Book (P/B) ratio measures a company's market value relative to its book value (total assets minus liabilities). It tells you how much investors are paying for each dollar of a company's net assets.
	  </Typography>
	  <Typography variant="explanationTopic">Calculation</Typography>
	  <Typography
		  variant="explanationText"
		  sx={{ fontFamily: "'Times New Roman', Times, 'Segoe Ui', Arial, sans-serif" }}
	  >
		  P/B Ratio = Market Price per Share / Book Value per Share
	  </Typography>
	  <Typography variant="explanationTopic">Interpretation</Typography>
	  <Stack direction="row" spacing={1}>
		  <TrendingUpIcon
			  sx={{ color: "green", bgcolor: "white", borderRadius: "10px",}}
		  />
		  <Typography variant="explanationText">
			  A rising P/B ratio often suggests that investors are increasingly optimistic about the company's growth prospects and asset quality. They are willing to pay a higher premium for the company's net assets.
		  </Typography>
	  </Stack>
	  <Stack direction="row" spacing={1}>
		  <TrendingDownIcon
			  sx={{ color: "red", bgcolor: "white", borderRadius: "10px",}}
		  />
		  <Typography variant="explanationText">
				A downward trend in a Price-to-Book (P/B) ratio graph generally indicates that a company's stock price is falling relative to its book value, or that shareholders' equity is growing faster than the stock price. This contraction signifies that investors are paying less for each dollar of net assets, often making the stock "cheaper" or better value for asset-based investing.
		  </Typography>
	  </Stack>
  </Stack>
)


export default function PBRatioGraph({ symbol, fetchVersion, setSymbol, period }) {
	const navigate = useNavigate();
	const [statement, setStatement] = useState(null);
	const [timeRange, setTimeRange] = useState("all");
	const [graphClicked, setGraphClicked] = useState(false);

	const graphRef = useRef(null);

	useEffect(() => {
		async function getStatement() {
			const payload = {symbol: symbol, graph: "PBRatio"};
			const response = await authenticatedClientWithRetry("/pages/composite", payload, () => isActive, navigate, setSymbol);
			if (!isActive) {
				return;
			}
			if (response.status === 204) {
				setStatement([]);
				return;
			}
			const data = await response.json();
			setStatement(data);
		}

		let isActive = true;
		getStatement();

		return  () => {
			isActive = false;
		};
	}, [symbol, fetchVersion]);

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
		console.log("PBRatioGraph: ", filteredReports);
		return filteredReports;
	}, [statement, timeRange, period]);

	const percentChange = useMemo(() => {
		if (!reports.length) {
			return NaN;
		}
		const percentChange = getPercentChange(reports, "PBRatio");
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
						title="P/B Ratio"
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
								/>
								<Tooltip
								/>
								<Bar name="P/B Ratio" dataKey="PBRatio" shape={<CustomBar></CustomBar>} activeBar={<CustomActiveBar></CustomActiveBar>}/>
							</BarChart>
						</ResponsiveContainer>
					</Box>
				</GraphCard>
			</Box>
	);
	}
