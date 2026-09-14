import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    LabelList,
    ReferenceLine,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import {
    VARIANCE_DOMAIN,
    VARIANCE_TICKS,
    barColorFor,
    formatVariance,
} from "../dipChartHelpers.js";

// Every column is anchored on the zero line, so a negative variance hangs below
// it and a positive one rises above. Recharts' built-in label positions can only
// describe one end of a column, so the value is placed against whichever end is
// furthest from zero: under the column when it is a dip, over it when it is not.
function EndOfColumnLabel(props) {
    const { x, y, width, height, value } = props;

    if (typeof value !== "number") {
        return null;
    }

    const columnTop = Math.min(y, y + height);
    const columnBottom = Math.max(y, y + height);
    const isDip = value < 0;

    return (
        <text
            className="dip-column-label"
            x={x + width / 2}
            y={isDip ? columnBottom + 15 : columnTop - 7}
            textAnchor="middle"
            fill="var(--text-main)"
            fontSize={12}
        >
            {formatVariance(value)}
        </text>
    );
}

function DipColumnChart({ rows }) {
    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={rows} margin={{ top: 24, right: 12, bottom: 8, left: 4 }}>
                <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="var(--main-dry-sage)"
                    opacity={0.25}
                />
                <XAxis
                    dataKey="symbol"
                    type="category"
                    interval={0}
                    stroke="var(--text-main)"
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                />
                <YAxis
                    type="number"
                    domain={VARIANCE_DOMAIN}
                    ticks={VARIANCE_TICKS}
                    interval={0}
                    stroke="var(--text-main)"
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    tickFormatter={formatVariance}
                />
                <ReferenceLine y={0} stroke="var(--main-dry-sage)" strokeDasharray="4 4" />
                <Tooltip
                    cursor={{ fill: "var(--surface-soft)" }}
                    formatter={(value) => [formatVariance(value), "Variance vs SMA"]}
                />
                {/* minPointSize keeps the flat 0% rows visible: Recharts renders
                    nothing for a zero-height rectangle, and the design draws a
                    small mark at the zero line for those. */}
                <Bar
                    dataKey="variance"
                    isAnimationActive={false}
                    maxBarSize={44}
                    minPointSize={1}
                >
                    {rows.map((row) => (
                        <Cell key={row.symbol} fill={barColorFor(row.variance)} />
                    ))}
                    <LabelList dataKey="variance" content={EndOfColumnLabel} />
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
}

export default DipColumnChart;
