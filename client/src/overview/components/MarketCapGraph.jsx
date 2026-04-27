import { useState, useMemo } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import GraphTitle from "./GraphTitle.jsx";
import GraphCard from "./GraphCard.jsx";
import NoDataGraph from "./NoDataGraph.jsx";
import CustomBar from "./CustomBar.jsx";
import CustomActiveBar from "./CustomActiveBar.jsx";
import { filterReports, getPercentChange, formatToUnits } from "../../helpers/GraphsHelper.js";

const explanation = (
  <div className="space-y-3">
    <p className="text-sm font-bold text-[var(--text-main)]">What is it?</p>
    <p className="text-sm text-[var(--text-main)]">
      Market capitalization represents the market&apos;s total valuation of a company and is used to determine a
      company&apos;s size, risk, and growth potential.
    </p>

    <p className="text-sm font-bold text-[var(--text-main)]">Calculation</p>
    <p className="text-sm text-[var(--text-main)]">Market Cap = Share Price * Shares Outstanding</p>

    <p className="text-sm font-bold text-[var(--text-main)]">Interpretation</p>
    <div className="flex items-start gap-2">
      <TrendingUp className="mt-0.5 w-10 text-green-600 rounded-md" />
      <p className="text-sm text-[var(--text-main)]">
        A rising market cap usually means investors are valuing the company more highly, often due to growth
        expectations or stronger fundamentals.
      </p>
    </div>
    <div className="flex items-start gap-2">
      <TrendingDown className="mt-0.5 w-10 rounded text-red-600" />
      <p className="text-sm text-[var(--text-main)]">
        A falling market cap can signal weaker market sentiment, earnings pressure, or broader risk-off conditions.
      </p>
    </div>
  </div>
);


export default function MarketCapGraph({ statement, period }) {
	const [timeRange, setTimeRange] = useState("all");
	const [graphClicked, setGraphClicked] = useState(false);

	const reports = useMemo(() => {
		if (!statement) return [];
		if (Array.isArray(statement) && statement.length === 0) return [];

		const sourceReports = statement[period === "annually" ? "annualReports" : "quarterlyReports"];
		return filterReports(sourceReports, timeRange, "fiscalDateEnding");
	}, [statement, timeRange, period]);

	const percentChange = useMemo(() => {
		if (!reports.length) {
			return NaN;
		}
		return getPercentChange(reports, "marketCap");
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
					title="Market Cap"
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
							<XAxis
								dataKey="fiscalDateEnding"
								interval="equidistantPreserveStart"
								stroke="var(--text-main)"
								tick={{ fontSize: 12 }}
							/>
							<YAxis stroke="var(--text-main)" tickFormatter={(value) => formatToUnits(value)} />
							<Tooltip formatter={(value) => formatToUnits(value)} />
							<Bar
								name="Market Cap"
								dataKey="marketCap"
								shape={<CustomBar />}
								activeBar={<CustomActiveBar />}
							/>
						</BarChart>
					</ResponsiveContainer>
				</div>
			</GraphCard>
		</div>
	);
}
