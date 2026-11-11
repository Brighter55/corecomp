import { barScale, formatMoneyWhole, formatPctLabel } from "../analysisView.js";
import { CardMenu, GridIcon, InfoButton, ListIcon, TimeframeTabs } from "./Common.jsx";

const RANGES = [
  { value: "1d", label: "1d" },
  { value: "7d", label: "7d" },
  { value: "1m", label: "1m" },
  { value: "3m", label: "3m" },
  { value: "6m", label: "6m" },
  { value: "ytd", label: "YTD" },
  { value: "1y", label: "1y" },
  { value: "5y", label: "5y" },
  { value: "all", label: "all" },
];

export default function HoldingsCard({
  holdings,
  range,
  onRange,
  view,
  onView,
  onInfo,
  onDetails,
  onCsv,
}) {
  const { max, ticks } = barScale(holdings.map((holding) => holding.ret));

  return (
    <article className="card" id="holdings" data-card="holdings" aria-labelledby="holdings-title">
      <div className="card-head">
        <h2 className="card-title" id="holdings-title">
          Holdings performance
          <InfoButton label="About holdings performance" onClick={() => onInfo("holdings")} />
        </h2>
        <div className="card-actions">
          <div className="segmented" role="group" aria-label="Holdings view">
            <button
              type="button"
              data-view="list"
              aria-pressed={view === "list"}
              className={view === "list" ? "is-active" : ""}
              aria-label="List view"
              onClick={() => onView("list")}
            >
              <ListIcon />
            </button>
            <button
              type="button"
              data-view="grid"
              aria-pressed={view === "grid"}
              className={view === "grid" ? "is-active" : ""}
              aria-label="Grid view"
              onClick={() => onView("grid")}
            >
              <GridIcon />
            </button>
          </div>
          <CardMenu label="More holdings options" onDetails={onDetails} onCsv={onCsv} />
        </div>
      </div>

      <div className="tabs-row">
        <TimeframeTabs
          options={RANGES}
          value={range}
          onChange={onRange}
          label="Holdings performance period"
        />
      </div>

      <div className="bars-plot" id="holdings-bars" hidden={view !== "list"}>
        <div className="bars-lines" aria-hidden="true">
          {ticks.map((tick) => (
            <span key={tick} style={{ left: `${(tick / max) * 100}%` }} />
          ))}
        </div>
        <div className="bars-rows" role="list">
          {holdings.map((holding) => {
            const width = Math.max(0.4, (Math.abs(holding.ret) / max) * 100);
            return (
              <div
                className="bars-row"
                role="listitem"
                key={holding.symbol}
                aria-label={`${holding.symbol}: ${formatPctLabel(holding.ret)} for the selected period`}
              >
                <span className="bars-sym">{holding.symbol}</span>
                <span className="bar-track">
                  <span
                    className={"bar-fill" + (holding.ret < 0 ? " neg" : "")}
                    style={{ width: `${width}%` }}
                  />
                </span>
                <span className={"bars-val " + (holding.ret >= 0 ? "gain" : "loss")}>
                  {formatPctLabel(holding.ret)}
                </span>
              </div>
            );
          })}
        </div>
        <div className="bars-axis" aria-hidden="true">
          <span />
          <div className="axis-scale">
            {ticks.map((tick) => <span key={tick}>{tick}%</span>)}
          </div>
          <span />
        </div>
      </div>

      <div className="holdings-grid" id="holdings-grid" role="list" hidden={view !== "grid"}>
        {holdings.map((holding) => {
          const width = Math.max(0.5, (Math.abs(holding.ret) / max) * 100);
          return (
            <article className="h-tile" role="listitem" key={holding.symbol}>
              <div className="h-tile-head">
                <div>
                  <p className="h-sym">{holding.symbol}</p>
                </div>
                <p className={"h-ret " + (holding.ret >= 0 ? "gain" : "loss")}>
                  {formatPctLabel(holding.ret)}
                </p>
              </div>
              <div className="h-track">
                <span
                  className={holding.ret < 0 ? "neg" : ""}
                  style={{ width: `${width}%` }}
                />
              </div>
              <div className="h-meta">
                <span>{formatMoneyWhole(holding.market_value)}</span>
                <span>{holding.weight.toFixed(1)}% of portfolio</span>
              </div>
            </article>
          );
        })}
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
