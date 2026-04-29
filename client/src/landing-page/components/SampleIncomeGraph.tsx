import { useEffect, useMemo, useRef, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import sampleReports from "../sample-data/sampleData.json";
import { filterReports, formatToUnits, getPercentChange } from "../../helpers/GraphsHelper.js";
import CustomBar from "../../overview/components/CustomBar.jsx";
import CustomActiveBar from "../../overview/components/CustomActiveBar.jsx";
import { Button } from "../../components/ui/button";

type TimeRange = "all" | "YTD" | "1Y" | "5Y" | "10Y";

type AnnualReport = {
  fiscalDateEnding: string;
  netIncome: string;
};

type ReportPayload = {
  annualReports: AnnualReport[];
};

const timeRanges: TimeRange[] = ["all", "YTD", "1Y", "5Y", "10Y"];

function SampleIncomeGraph() {
  const [timeRange, setTimeRange] = useState<TimeRange>("all");
  const [graphClicked, setGraphClicked] = useState(false);
  const graphRef = useRef<HTMLDivElement | null>(null);

  const statement = sampleReports as ReportPayload;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (graphRef.current && !graphRef.current.contains(event.target as Node)) {
        setGraphClicked(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const reports = useMemo(() => {
    if (!statement?.annualReports?.length) {
      return [];
    }

    return filterReports(statement.annualReports, timeRange, "fiscalDateEnding");
  }, [statement, timeRange]);

  const percentChange = useMemo(() => {
    if (!reports.length) {
      return null;
    }

    return getPercentChange(reports, "netIncome");
  }, [reports]);

  return (
    <div
      ref={graphRef}
      className={`rounded-xl bg-[var(--main-dust-grey)] text-[var(--main-pine-teal)] transition-all ${
        graphClicked
          ? "fixed left-[5vw] top-[10vh] z-30 h-[80vh] w-[90vw]"
          : "h-full w-full sm:w-[80%]"
      }`}
    >
      <div className="flex flex-wrap items-center gap-3 border-b border-black/10 p-3">
        <h3 className="text-lg font-semibold">Net Income</h3>
        <p className={`text-sm ${percentChange === null || Number.isNaN(percentChange) ? "text-gray-500" : percentChange >= 0 ? "text-[var(--main-hunter-green)]" : "text-[var(--main-brick)]"}`}>
          {percentChange === null || Number.isNaN(percentChange)
            ? "N/A"
            : percentChange >= 0
              ? `+${percentChange}%`
              : `${percentChange}%`}
        </p>
        <div className="ml-auto flex flex-wrap gap-1">
          {timeRanges.map((range) => {
            return (
              <Button
                key={range}
                size="sm"
                variant={range === timeRange ? "forest" : "outline"}
                onClick={() => {
                  setTimeRange(range);
                }}
              >
                {range}
              </Button>
            );
          })}
        </div>
      </div>
      <div
        className="h-[17rem] w-full p-2 md:h-[24rem]"
        onClick={() => {
          setGraphClicked(true);
        }}
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
            <CartesianGrid strokeDasharray="" vertical={false} stroke="#A3B18A" />
            <XAxis dataKey="fiscalDateEnding" interval="equidistantPreserveStart" stroke="#344E41" tick={{ fontSize: 12 }} />
            <YAxis
              tickFormatter={(value) => formatToUnits(value)}
              stroke="#344E41"
              domain={[(dataMin: number) => dataMin * 0.95, (dataMax: number) => dataMax * 1.05]}
            />
            <Tooltip formatter={(value) => formatToUnits(String(value))} />
            <Bar name="Net Income" dataKey="netIncome" shape={<CustomBar />} activeBar={<CustomActiveBar />} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default SampleIncomeGraph;
