const VIEW_W = 96;
const VIEW_H = 40;
/** Inset so the stroke and the end dot are not clipped at the edges. */
const PAD_X = 2;
const PAD_Y = 4;

type SparklineProps = {
  /** Raw values at any scale — the component owns the scaling. */
  points: number[];
  positive: boolean;
};

/**
 * A decorative inline-SVG line chart for the trending cards.
 *
 * Takes raw values rather than pre-computed coordinates so that swapping the
 * placeholder data for a real price series is a data change only — the
 * normalisation, the theming and the tests all stay as they are.
 */
function Sparkline({ points, positive }: SparklineProps) {
  if (points.length < 2) {
    return null;
  }

  const min = Math.min(...points);
  const max = Math.max(...points);
  const span = max - min;

  const x = (index: number) => PAD_X + (index * (VIEW_W - PAD_X * 2)) / (points.length - 1);
  // Screen y grows downward, so the largest value lands at the smallest y.
  // A flat series has span 0; without the guard every y would be NaN.
  const y = (value: number) =>
    span === 0 ? VIEW_H / 2 : PAD_Y + ((max - value) * (VIEW_H - PAD_Y * 2)) / span;

  const coords = points.map((value, index) => `${x(index)},${y(value)}`).join(" ");
  const lastX = x(points.length - 1);
  const lastY = y(points[points.length - 1]);

  // `[color:...]` is a Tailwind data-type hint: without it, stroke-[var(--x)]
  // is ambiguous between stroke-width and stroke-colour. It also emits a real
  // `stroke:` declaration, which resolves var() reliably — a raw SVG
  // presentation attribute does not.
  const strokeClass = positive
    ? "stroke-[color:var(--change-up)]"
    : "stroke-[color:var(--change-down)]";
  const fillClass = positive ? "fill-[var(--change-up)]" : "fill-[var(--change-down)]";

  return (
    <svg
      aria-hidden="true"
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      className="h-10 w-24 shrink-0 overflow-visible"
    >
      <polyline
        points={coords}
        fill="none"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={strokeClass}
      />
      <circle cx={lastX} cy={lastY} r={3} className={fillClass} />
    </svg>
  );
}

export default Sparkline;
