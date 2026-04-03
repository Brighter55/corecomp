import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useState, useEffect, useRef, useMemo } from "react";
import { filterReports, getPercentChange, formatToUnits } from "../../helpers/GraphsHelper.js";
import GraphTitle from "./GraphTitle.jsx";
import GraphCard from "./GraphCard.jsx";
import NoDataGraph from "./NoDataGraph.jsx";
// mui
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Skeleton from '@mui/material/Skeleton';


const explanation = (
	<Stack spacing={2}>
		<Typography variant="explanationTopic">What is it?</Typography>
		<Typography variant="explanationText">
			Total assets represent everything a company owns, which has future economic value. This includes cash, inventory, property, equipment, and intangible assets like patents.
		</Typography>
		<Typography variant="explanationTopic">Calculation</Typography>
		<Typography
			variant="explanationText"
			sx={{ fontFamily: "'Times New Roman', Times, 'Segoe Ui', Arial, sans-serif" }}
		>
			Total Assets = Total Liabilities + Total Shareholder Equity
		</Typography>
		<Typography variant="explanationTopic">Interpretation</Typography>
		<Stack direction="row" spacing={1}>
			<TrendingUpIcon
				sx={{ color: "green", bgcolor: "white", borderRadius: "10px" }}
			/>
			<Typography variant="explanationText">
				A rising total assets trend can indicate expansion, more productive resources, and stronger long-term operating capacity.
			</Typography>
		</Stack>
		<Stack direction="row" spacing={1}>
			<TrendingDownIcon
				sx={{ color: "red", bgcolor: "white", borderRadius: "10px" }}
			/>
			<Typography variant="explanationText">
				A declining total assets trend can signal shrinking operations, disposals, or financial stress, depending on the business context.
			</Typography>
		</Stack>
	</Stack>
);


function TotalAssets({ statement, period }) {
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

		return filterReports(
			statement[period === "annually" ? "annualReports" : "quarterlyReports"],
			timeRange,
			"fiscalDateEnding",
		);
	}, [statement, timeRange, period]);

	const percentChange = useMemo(() => {
		if (reports.length === 0) {
			return NaN;
		}
		return getPercentChange(reports, "totalAssets");
	}, [reports]);

	if (statement === null) {
		return <Skeleton variant="rounded" sx={{ flex: 1, height: "20rem" }} />;
	}
	if (Array.isArray(statement) && statement.length === 0) {
		return <NoDataGraph />;
	}

	return (
		<Box sx={{ flex: 1 }}>
			<GraphCard ref={graphRef} graphClicked={graphClicked}>
				<GraphTitle
					title="Total Assets"
					explanation={explanation}
					percentChange={percentChange}
					timeRange={timeRange}
					setTimeRange={setTimeRange}
				/>
				<Box onClick={() => { setGraphClicked(true); }} sx={{ width: "100%", height: "100%" }}>
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
							<CartesianGrid strokeDasharray="" vertical={false} stroke="#A3B18A" />
							<XAxis dataKey="fiscalDateEnding" interval="equidistantPreserveStart" stroke="#344E41" tick={{ fontSize: 12 }} />
							<YAxis
								tickFormatter={(value) => formatToUnits(value)}
								stroke="#344E41"
								domain={[dataMin => dataMin * 0.95, dataMax => dataMax * 1.05]}
							/>
							<Tooltip
								formatter={(value) => formatToUnits(value)}
								labelFormatter={(label, payload) => {
									const totalAssets = payload?.[0]?.payload?.totalAssets;
									if (!totalAssets) return label;
									return `${label} (Total Assets: ${formatToUnits(totalAssets)})`;
								}}
							/>
							<Legend />
							<Bar
								name="Total Shareholder Equity"
								dataKey="totalShareholderEquity"
								stackId="a"
								fill="#588157"
								activeBar={{ fill: "#A3B18A", stroke: "#DAD7CD", strokeWidth: 2 }}
							/>
							<Bar
								name="Total Liabilities"
								dataKey="totalLiabilities"
								stackId="a"
								fill="#bc4749"
								activeBar={{ fill: "#B35C5E", stroke: "#DAD7CD", strokeWidth: 2 }}
							/>
						</BarChart>
					</ResponsiveContainer>
				</Box>
			</GraphCard>
		</Box>
	);
}


export default TotalAssets;
