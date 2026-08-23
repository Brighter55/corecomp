import { useMemo, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import GraphTitle from "./GraphTitle.jsx";
import GraphCard from "./GraphCard.jsx";
import NoDataGraph from "./NoDataGraph.jsx";
import CustomBar from "./CustomBar.jsx";
import CustomActiveBar from "./CustomActiveBar.jsx";
import { filterReports, getPercentChange, formatToUnits, hasAnyValue } from "../../helpers/GraphsHelper.js";

const defaultDomain = [
  (dataMin) => dataMin * 0.95,
  (dataMax) => dataMax * 1.05,
];

function resolveReports(statement, period, timeRange, xDataKey = "fiscalDateEnding") {
  if (!statement) return [];
  if (Array.isArray(statement)) return [];

  const sourceReports = statement[period === "annually" ? "annualReports" : "quarterlyReports"] ?? [];
  if (!sourceReports.length) return [];
  return filterReports(sourceReports, timeRange, xDataKey);
}

export default function GeneralBarGraph({
  statement,
  period,
  title,
  dataKey,
  xDataKey = "fiscalDateEnding",
  barName,
  explanation,
  yDomain = defaultDomain,
  yTickFormatter,
  tooltipFormatter,
}) {
  const [timeRange, setTimeRange] = useState("all");
  const [graphClicked, setGraphClicked] = useState(false);

  const reports = useMemo(
    () => resolveReports(statement, period, timeRange, xDataKey),
    [statement, period, timeRange, xDataKey]
  );
  const resolvedYDomain = yDomain === null ? undefined : yDomain;
  const resolvedYTickFormatter =
    yTickFormatter === null ? undefined : yTickFormatter ?? formatToUnits;
  const resolvedTooltipFormatter =
    tooltipFormatter === null ? undefined : tooltipFormatter ?? formatToUnits;

  const percentChange = useMemo(() => {
    if (!reports.length) {
      return NaN;
    }
    return getPercentChange(reports, dataKey);
  }, [reports, dataKey]);

  const hasData = useMemo(() => hasAnyValue(reports, dataKey), [reports, dataKey]);

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

  if (!hasData) {
    return <NoDataGraph />;
  }

  return (
    <div className="flex-1">
      <GraphCard graphClicked={graphClicked}>
        <GraphTitle
          title={title}
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
                dataKey={xDataKey}
                interval="equidistantPreserveStart"
                stroke="var(--text-main)"
                tick={{ fontSize: 12 }}
              />
              <YAxis
                tickFormatter={resolvedYTickFormatter}
                stroke="var(--text-main)"
                domain={resolvedYDomain}
              />
              <Tooltip formatter={resolvedTooltipFormatter} />
              <Bar
                name={barName ?? title}
                dataKey={dataKey}
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
