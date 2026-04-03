import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useState, useEffect, useRef, useMemo } from "react";
import { filterReports, getPercentChange, formatToUnits } from "../../helpers/GraphsHelper.js";
import GraphTitle from "./GraphTitle.jsx";
import GraphCard from "./GraphCard.jsx";
import NoDataGraph from "./NoDataGraph.jsx";
// mui
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Skeleton from '@mui/material/Skeleton';


const explanation = (
	<Stack spacing={2}>
		<Typography variant="explanationTopic">What is it?</Typography>
		<Typography variant="explanationText">
			Debt structure shows how a company splits debt obligations between short-term debt and long-term debt.
		</Typography>
		<Typography variant="explanationTopic">Calculation</Typography>
		<Typography
			variant="explanationText"
			sx={{ fontFamily: "'Times New Roman', Times, 'Segoe Ui', Arial, sans-serif" }}
		>
			Total Debt = short-term debt + long-term debt
		</Typography>
		<Typography variant="explanationTopic">Interpretation</Typography>
		<Typography variant="explanationText">
			Large Short-Term Portion: Suggests high liquidity risk, as a significant amount is due soon. If this exceeds cash equivalents, the company may face solvency issues.
		</Typography>
		<Typography variant="explanationText">
			Large Long-Term Portion: Implies a more stable, long-term financing strategy (e.g., bonds), which is less urgent but still creates long-term interest burdens.
		</Typography>
	</Stack>
);


function DebtStructureGraph({ statement, period }) {
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
		return getPercentChange(reports, "shortLongTermDebtTotal");
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
					title="Debt Structure"
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
									const totalDebt = payload?.[0]?.payload?.shortLongTermDebtTotal;
									if (!totalDebt) return label;
									return `${label} (Total Debt: ${formatToUnits(totalDebt)})`;
								}}
							/>
							<Legend />
							<Bar
								name="Short-Term Debt"
								dataKey="shortTermDebt"
								stackId="a"
								fill="#588157"
								activeBar={{ fill: "#A3B18A", stroke: "#DAD7CD", strokeWidth: 2 }}
							/>
							<Bar
								name="Long-Term Debt"
								dataKey="longTermDebt"
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


export default DebtStructureGraph;