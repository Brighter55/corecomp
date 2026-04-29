import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useState, useMemo } from "react";
import { filterReports, getPercentChange, formatToUnits } from "../../helpers/GraphsHelper.js";
import GraphTitle from "./GraphTitle.jsx";
import GraphCard from "./GraphCard.jsx";
import NoDataGraph from "./NoDataGraph.jsx";
import { TrendingUp, TrendingDown } from "lucide-react";


const explanation = (
	<div className="space-y-3">
		<p className="text-sm font-bold text-[var(--text-main)]">What is it?</p>
		<p className="text-sm text-[var(--text-main)]">
			Total assets represent everything a company owns, which has future economic value. This includes cash, inventory, property, equipment, and intangible assets like patents.
		</p>
		<p className="text-sm font-bold text-[var(--text-main)]">Calculation</p>
		<p className="text-sm font-mono text-[var(--text-main)]">
			Total Assets = Total Liabilities + Total Shareholder Equity
		</p>
		<p className="text-sm font-bold text-[var(--text-main)]">Interpretation</p>
		<div className="flex items-start gap-2">
			<TrendingUp className="mt-0.5 w-10 rounded-md text-green-600" />
			<p className="text-sm text-[var(--text-main)]">
				A rising total assets trend can indicate expansion, more productive resources, and stronger long-term operating capacity.
			</p>
		</div>
		<div className="flex items-start gap-2">
			<TrendingDown className="mt-0.5 w-10 rounded-md text-red-600" />
			<p className="text-sm text-[var(--text-main)]">
				A declining total assets trend can signal shrinking operations, disposals, or financial stress, depending on the business context.
			</p>
		</div>
	</div>
);

function TotalAssets({ statement, period }) {
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
		return getPercentChange(reports, "totalAssets");
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
					title="Total Assets"
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
				</div>
			</GraphCard>
		</div>
	);
}


export default TotalAssets;
