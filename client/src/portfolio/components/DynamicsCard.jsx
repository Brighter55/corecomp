import {
  Bar, BarChart, CartesianGrid, Cell, LabelList, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";

import { formatPctLabel } from "../analysisView.js";
import { CardMenu, InfoButton, TimeframeTabs } from "./Common.jsx";

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

function renderLabel({ x, y, width, value }) {
  const positive = value >= 0;
  return (
    <text
      x={x + width / 2}
      y={positive ? y - 6 : y + 14}
      textAnchor="middle"
      fontSize={11}
      fontWeight={600}
      fill={positive ? "var(--gain)" : "var(--loss)"}
    >
      {formatPctLabel(value)}
    </text>
  );
}

export default function DynamicsCard({
  months,
  range,
  ranges,
  onRange,
  benchmarkLabel,
  compare,
  onInfo,
  onDetails,
  onCsv,
}) {
  return (
    <article className="card" id="returns-dynamics" data-card="dyn" aria-labelledby="dyn-title">
      <div className="card-head">
        <h2 className="card-title" id="dyn-title">
          Dynamics of portfolio returns
          <InfoButton label="About monthly return dynamics" onClick={() => onInfo("dyn")} />
        </h2>
        <CardMenu label="More monthly returns options" onDetails={onDetails} onCsv={onCsv} />
      </div>

      <div className="tabs-row">
        <TimeframeTabs
          options={ranges}
          value={range}
          onChange={onRange}
          label="Monthly returns period"
        />
      </div>

      <div className="chart-wrap">
        <div className="chart-scroll">
          <div className="chart" id="dyn-chart" style={{ minWidth: 900, height: 340 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={months} margin={{ top: 18, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 4" vertical={false} stroke="var(--line)" />
                <XAxis dataKey="label" tickLine={false} axisLine={false} />
                <YAxis
                  tickFormatter={(value) => `${Math.round(value)}%`}
                  width={52}
                  tickLine={false}
                  axisLine={false}
                  domain={["auto", "auto"]}
                />
                <Tooltip
                  cursor={{ fill: "rgba(26,36,30,.05)" }}
                  content={({ active, payload, label }) => {
                    if (!active || !payload || !payload.length) return null;
                    return (
                      <div
                        style={{
                          background: "#1F2A22",
                          color: "#F4F6F2",
                          borderRadius: 8,
                          padding: "8px 10px",
                          fontSize: 11.5,
                        }}
                      >
                        <div style={{ color: "rgba(244,246,242,.68)", fontSize: 10.5, marginBottom: 3 }}>
                          {label}
                        </div>
                        {payload.map((entry) => (
                          <div key={entry.dataKey} style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
                            <span><Dot color={entry.color} />{entry.name}</span>
                            <strong>{formatPctLabel(entry.value)}</strong>
                          </div>
                        ))}
                      </div>
                    );
                  }}
                />
                <ReferenceLine y={0} stroke="rgba(26,36,30,.32)" />
                <Bar dataKey="pct" name="Portfolio" radius={[4, 4, 0, 0]} maxBarSize={48}>
                  {months.map((month) => (
                    <Cell
                      key={month.key}
                      fill={month.pct >= 0 ? "var(--gain-bar)" : "var(--loss-bar)"}
                    />
                  ))}
                  <LabelList dataKey="pct" content={renderLabel} />
                </Bar>
                {compare ? (
                  <Bar dataKey="benchmarkPct" name={benchmarkLabel} fill="var(--chart-bench)" radius={[4, 4, 0, 0]} maxBarSize={48} />
                ) : null}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="legend">
        <span><Dot color="var(--gain-bar)" />Portfolio</span>
        {compare ? <span><Dot color="var(--chart-bench)" />{benchmarkLabel}</span> : null}
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
