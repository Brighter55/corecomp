import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useState, useMemo } from "react";
import { filterReports, getPercentChange, formatToUnits } from "../../helpers/GraphsHelper.js";
import GraphTitle from "./GraphTitle.jsx";
import GraphCard from "./GraphCard.jsx";
import NoDataGraph from "./NoDataGraph.jsx";


const explanation = (
	<div className="space-y-3">
		<p className="text-sm font-bold text-[var(--text-main)]">What is it?</p>
		<p className="text-sm text-[var(--text-main)]">
			Debt structure shows how a company splits debt obligations between short-term debt and long-term debt.
		</p>
		<p className="text-sm font-bold text-[var(--text-main)]">Calculation</p>
		<p className="text-sm font-mono text-[var(--text-main)]">
			Total Debt = short-term debt + long-term debt
		</p>
		<p className="text-sm font-bold text-[var(--text-main)]">Interpretation</p>
		<p className="text-sm text-[var(--text-main)]">
			Large Short-Term Portion: Suggests high liquidity risk, as a significant amount is due soon. If this exceeds cash equivalents, the company may face solvency issues.
		</p>
		<p className="text-sm text-[var(--text-main)]">
			Large Long-Term Portion: Implies a more stable, long-term financing strategy (e.g., bonds), which is less urgent but still creates long-term interest burdens.
		</p>
	</div>
);


function DebtStructureGraph({ statement, period }) {
	const [timeRange, setTimeRange] = useState("all");
	const [graphClicked, setGraphClicked] = useState(false);

	const reports = useMemo(() => {
		if (!statement) return [];
		if (Array.isArray(statement) && statement.length === 0) return [];

		return filterReports(
			statement[period === "annually" ? "annualReports" : "quarterlyReports"] ?? [],
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
		return (
			<div className="flex-1">
				<div className="h-80 w-full min-w-[21rem] animate-pulse rounded-[10px] bg-[rgba(163,177,138,0.25)] sm:h-[25rem]" />
			</div>
		);
	}
	if (Array.isArray(statement) && statement.length === 0) {
		return <NoDataGraph />;
	}

	return (
		<div className="flex-1">
			<GraphCard graphClicked={graphClicked}>
				<GraphTitle
					title="Debt Structure"
					explanation={explanation}
					percentChange={percentChange}
					timeRange={timeRange}
					setTimeRange={setTimeRange}
					graphClicked={graphClicked}
					setGraphClicked={setGraphClicked}
				/>
				<div
					onClick={() => {
						setGraphClicked(true);
					}}
					className="min-h-0 w-full flex-1"
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
							<CartesianGrid strokeDasharray="" vertical={false} stroke="var(--main-dry-sage)" />
							<XAxis dataKey="fiscalDateEnding" interval="equidistantPreserveStart" stroke="var(--text-main)" tick={{ fontSize: 12 }} />
							<YAxis
								tickFormatter={(value) => formatToUnits(value)}
								stroke="var(--text-main)"
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
				</div>
			</GraphCard>
		</div>
	);
}


export default DebtStructureGraph;