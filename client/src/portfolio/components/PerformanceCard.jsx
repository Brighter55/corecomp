import {
  Area, AreaChart, CartesianGrid, Line, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";

import {
  compactNumber, formatAxisMonth, formatRangeDate, monthTicks, signedMoney,
} from "../analysisView.js";
import { BenchRow, CardMenu, ChartTip, InfoButton, TimeframeTabs } from "./Common.jsx";

const RANGES = [
  { value: "7d", label: "7d" },
  { value: "1m", label: "1m" },
  { value: "3m", label: "3m" },
  { value: "6m", label: "6m" },
  { value: "ytd", label: "YTD" },
  { value: "1y", label: "1y" },
  { value: "5y", label: "5y" },
  { value: "all", label: "all" },
];

const COLORS = {
  profit: "var(--chart-perf)",
  benchmarkProfit: "var(--chart-bench)",
};

function Dot({ color }) {
  return (
    <span
      style={{
        display: "inline-block",
        width: 9,
        height: 9,
        borderRadius: "50%",
        background: color,
        marginRight: 6,
        verticalAlign: "middle",
      }}
    />
  );
}

export default function PerformanceCard({
  points,
  range,
  onRange,
  benchmarkLabel,
  compare,
  onCompare,
  onInfo,
  onDetails,
  onCsv,
  onSelectBenchmark,
}) {
  const data = points.map((point) => ({
    ...point,
    profit: point.value + point.dividends - point.invested,
    benchmarkProfit: point.benchmarkValue + point.benchmarkDividends - point.invested,
  }));
  const first = data[0];
  const last = data[data.length - 1];
  const profit = last ? last.profit : 0;
  const change = first && last ? profit - first.profit : 0;
  const changePct = first && first.profit ? (change / Math.abs(first.profit)) * 100 : 0;
  const span = first && last
    ? `${formatRangeDate(first.date)} – ${formatRangeDate(last.date)}`
    : "";

  return (
    <article className="card" id="portfolio-performance" data-card="perf" aria-labelledby="perf-title">
      <div className="card-head">
        <h2 className="card-title" id="perf-title">
          Portfolio performance
          <InfoButton label="About portfolio performance" onClick={() => onInfo("perf")} />
        </h2>
        <CardMenu label="More portfolio performance options" onDetails={onDetails} onCsv={onCsv} />
      </div>

      <BenchRow
        benchmarkLabel={benchmarkLabel}
        onSelect={onSelectBenchmark}
        compare={compare}
        onCompare={onCompare}
      />

      <div className="tabs-row">
        <TimeframeTabs
          options={RANGES}
          value={range}
          onChange={onRange}
          label="Portfolio performance period"
        />
        <div className="range-summary">
          <span>{span}</span>
          <span className={change >= 0 ? "gain" : "loss"}>
            <Dot color={COLORS.profit} />{signedMoney(change)}
            {first ? ` (${changePct >= 0 ? "▲" : "▼"} ${Math.abs(changePct).toFixed(2)}%)` : ""}
          </span>
        </div>
      </div>

      <div className="chart-wrap">
        <div className="chart-scroll">
          <div className="chart" style={{ height: 380 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="perfFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--chart-perf)" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="var(--chart-perf)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 4" vertical={false} stroke="var(--line)" />
                <XAxis
                  dataKey="date"
                  ticks={monthTicks(data)}
                  interval={0}
                  tickFormatter={formatAxisMonth}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tickFormatter={compactNumber}
                  width={58}
                  tickLine={false}
                  axisLine={false}
                  domain={["auto", "auto"]}
                />
                <Tooltip content={<ChartTip colors={COLORS} />} />
                <ReferenceLine y={0} stroke="rgba(26,36,30,.32)" />
                <Area
                  type="monotone"
                  dataKey="profit"
                  name="Portfolio"
                  stroke="var(--chart-perf)"
                  strokeWidth={2.2}
                  fill="url(#perfFill)"
                  baseValue={0}
                  dot={false}
                  activeDot={false}
                />
                {compare ? (
                  <Line
                    type="monotone"
                    dataKey="benchmarkProfit"
                    name={benchmarkLabel}
                    stroke="var(--chart-bench)"
                    strokeWidth={2}
                    dot={false}
                    activeDot={false}
                  />
                ) : null}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="legend">
        <span><Dot color={COLORS.profit} />Portfolio</span>
        {compare ? <span><Dot color={COLORS.benchmarkProfit} />{benchmarkLabel}</span> : null}
      </div>

      <div className="card-foot">
        <button className="foot-btn" type="button" onClick={onDetails}>
          <svg className="od-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" aria-hidden="true">
            <rect x="3" y="4" width="18" height="16" rx="2" />
            <path d="M3 9h18M9 9v11" />
          </svg>
          View details
          <span className="arrow" aria-hidden="true">→</span>
        </button>
      </div>
    </article>
  );
}
