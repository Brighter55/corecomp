import {
  Area, AreaChart, CartesianGrid, Line, ResponsiveContainer, Tooltip, XAxis, YAxis,
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
  value: "var(--chart-portfolio)",
  benchmarkValue: "var(--chart-bench)",
};

function Dash() {
  return (
    <span
      style={{
        display: "inline-block",
        width: 14,
        borderTop: "2px dashed var(--chart-invested)",
        marginRight: 6,
        verticalAlign: "middle",
      }}
    />
  );
}

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

export default function ValueCard({
  points,
  range,
  onRange,
  onCustom,
  benchmarkLabel,
  insight,
  onInfo,
  onDetails,
  onCsv,
  onSelectBenchmark,
  onTutorial,
}) {
  const first = points[0];
  const last = points[points.length - 1];
  const delta = first && last ? last.value - first.value : 0;
  const benchmarkDelta = first && last ? last.benchmarkValue - first.benchmarkValue : 0;
  const span = first && last
    ? `${formatRangeDate(first.date)} – ${formatRangeDate(last.date)}`
    : "";

  return (
    <article className="card" id="portfolio-value" data-card="value" aria-labelledby="value-title">
      <div className="card-head">
        <h2 className="card-title" id="value-title">
          Portfolio value
          <InfoButton label="About portfolio value" onClick={() => onInfo("value")} />
        </h2>
        <CardMenu label="More portfolio value options" onDetails={onDetails} onCsv={onCsv} />
      </div>

      <BenchRow
        benchmarkLabel={benchmarkLabel}
        onSelect={onSelectBenchmark}
        onTutorial={onTutorial}
      />

      <div className="insight">
        <svg className="od-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M3 17l5-6 4 4 6-8" />
          <path d="M14 7h4v4" />
        </svg>
        <p>{insight}</p>
      </div>

      <div className="tabs-row">
        <TimeframeTabs
          options={RANGES}
          value={range}
          onChange={onRange}
          label="Portfolio value period"
          customValue="custom"
          onCustom={onCustom}
        />
        <div className="range-summary">
          <span>{span}</span>
          <span className={delta >= 0 ? "gain" : "loss"}>
            <Dot color={COLORS.value} />{signedMoney(delta)}
          </span>
          <span className={benchmarkDelta >= 0 ? "gain" : "loss"}>
            <Dot color={COLORS.benchmarkValue} />{signedMoney(benchmarkDelta)}
          </span>
        </div>
      </div>

      <div className="chart-wrap">
        <div className="chart-scroll">
          <div className="chart" style={{ height: 380 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={points} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="valueFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--chart-portfolio)" stopOpacity={0.22} />
                    <stop offset="100%" stopColor="var(--chart-portfolio)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 4" vertical={false} stroke="var(--line)" />
                <XAxis
                  dataKey="date"
                  ticks={monthTicks(points)}
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
                <Line
                  type="monotone"
                  dataKey="invested"
                  name="Invested"
                  stroke="var(--chart-invested)"
                  strokeDasharray="5 5"
                  strokeWidth={2}
                  dot={false}
                  activeDot={false}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  name="Portfolio"
                  stroke="var(--chart-portfolio)"
                  strokeWidth={2.2}
                  fill="url(#valueFill)"
                  dot={false}
                  activeDot={false}
                />
                <Line
                  type="monotone"
                  dataKey="benchmarkValue"
                  name={benchmarkLabel}
                  stroke="var(--chart-bench)"
                  strokeWidth={2.2}
                  dot={false}
                  activeDot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="legend">
        <span><Dot color={COLORS.value} />Portfolio</span>
        <span><Dot color={COLORS.benchmarkValue} />{benchmarkLabel}</span>
        <span><Dash />Invested</span>
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
