import { useState } from "react";

import { formatFullDate, formatMoney } from "../analysisView.js";

const STROKE = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
  className: "od-icon",
};

export function InfoIcon() {
  return (
    <svg className="od-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5" />
      <path d="M12 8h.01" />
    </svg>
  );
}

export function ChartIcon() {
  return (
    <svg className="od-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 17l5-6 4 4 6-8" />
      <path d="M14 7h4v4" />
    </svg>
  );
}

export function DotsIcon() {
  return (
    <svg className="od-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <circle cx="5" cy="12" r="1.6" />
      <circle cx="12" cy="12" r="1.6" />
      <circle cx="19" cy="12" r="1.6" />
    </svg>
  );
}

export function CalendarIcon() {
  return (
    <svg className="od-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" aria-hidden="true">
      <rect x="4" y="5" width="16" height="16" rx="2" />
      <path d="M8 3v4M16 3v4M4 10h16" />
    </svg>
  );
}

export function TableIcon() {
  return (
    <svg className="od-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" aria-hidden="true">
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M3 9h18M9 9v11" />
    </svg>
  );
}

export function DownloadIcon() {
  return (
    <svg className="od-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3v12" />
      <path d="m7 10 5 5 5-5" />
      <path d="M5 20h14" />
    </svg>
  );
}

export function XIcon() {
  return (
    <svg className="od-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true">
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

export function TriUpIcon() {
  return (
    <svg className="od-icon" viewBox="0 0 12 12" aria-hidden="true">
      <path d="M6 2.5 9.5 8h-7L6 2.5Z" fill="currentColor" />
    </svg>
  );
}

export function TriDownIcon() {
  return (
    <svg className="od-icon" viewBox="0 0 12 12" aria-hidden="true">
      <path d="M6 9.5 2.5 4h7L6 9.5Z" fill="currentColor" />
    </svg>
  );
}

export function ListIcon() {
  return (
    <svg className="od-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" aria-hidden="true">
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

export function GridIcon() {
  return (
    <svg className="od-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" aria-hidden="true">
      <rect x="4" y="4" width="6" height="6" rx="1" />
      <rect x="14" y="4" width="6" height="6" rx="1" />
      <rect x="4" y="14" width="6" height="6" rx="1" />
      <rect x="14" y="14" width="6" height="6" rx="1" />
    </svg>
  );
}

export function KpiValueIcon() {
  return (
    <svg className="od-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" aria-hidden="true">
      <path d="M5 19v-5M12 19V6M19 19v-9" />
    </svg>
  );
}

export function KpiProfitIcon() {
  return (
    <svg className="od-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 16l5-5 4 3 6-7" />
      <path d="M14 7h5v5" />
    </svg>
  );
}

export function KpiIrrIcon() {
  return (
    <svg className="od-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" aria-hidden="true">
      <path d="M6 18 18 6" />
      <circle cx="7.5" cy="7.5" r="2.3" />
      <circle cx="16.5" cy="16.5" r="2.3" />
    </svg>
  );
}

export function KpiIncomeIcon() {
  return (
    <svg className="od-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 20v-7" />
      <path d="M12 13c0-4 3-7 7-7 0 4-3 7-7 7Z" />
      <path d="M12 15c0-3-2.5-5.5-5.5-5.5 0 3 2.5 5.5 5.5 5.5Z" />
    </svg>
  );
}

export function InfoButton({ label, onClick }) {
  return (
    <button className="info-btn" type="button" onClick={onClick} aria-label={label}>
      <InfoIcon />
    </button>
  );
}

export function CardMenu({ label, onDetails, onCsv }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="card-actions">
      <div className="menu-wrap">
        <button
          className="icon-btn"
          type="button"
          aria-haspopup="true"
          aria-expanded={open}
          aria-label={label}
          onClick={() => setOpen((value) => !value)}
        >
          <DotsIcon />
        </button>
        {open ? (
          <div className="menu" role="menu" onClick={() => setOpen(false)}>
            <button type="button" role="menuitem" onClick={onDetails}>
              <TableIcon /> View details
            </button>
            <button type="button" role="menuitem" onClick={onCsv}>
              <DownloadIcon /> Download CSV
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function BenchRow({ benchmarkLabel, onSelect, compare, onCompare, onTutorial }) {
  return (
    <div className="bench-row">
      <div className="bench-left">
        <span className="bench-label">Benchmarks:</span>
        <span className="chip">
          {benchmarkLabel}
          <button
            className="chip-x"
            type="button"
            onClick={onSelect}
            aria-label={`Change the ${benchmarkLabel} benchmark`}
          >
            <XIcon />
          </button>
        </span>
        <button type="button" className="link-btn" onClick={onSelect}>
          Select
        </button>
        {onCompare ? (
          <button
            type="button"
            className={"link-btn compare-btn" + (compare ? " is-on" : "")}
            aria-pressed={compare}
            onClick={onCompare}
          >
            Compare
          </button>
        ) : null}
      </div>
      {onTutorial ? (
        <button type="button" className="link-btn tutorial-link" onClick={onTutorial}>
          See tutorial
        </button>
      ) : null}
    </div>
  );
}

export function TimeframeTabs({ options, value, onChange, label, customValue, onCustom }) {
  return (
    <div className="tabs" role="group" aria-label={label}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          className={"tab" + (value === option.value ? " is-active" : "")}
          aria-pressed={value === option.value}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
      {onCustom ? (
        <button
          type="button"
          className={"tab icon-tab" + (value === customValue ? " is-active" : "")}
          aria-pressed={value === customValue}
          aria-label="Choose a custom date range"
          onClick={onCustom}
        >
          <CalendarIcon />
        </button>
      ) : null}
    </div>
  );
}

function Dot({ color }) {
  return (
    <span
      className="dot"
      style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: color, marginRight: 6, verticalAlign: "middle" }}
    />
  );
}

export function ChartTip({ active, payload, label, colors }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div
      style={{
        background: "#1F2A22",
        color: "#F4F6F2",
        borderRadius: 8,
        padding: "8px 10px",
        fontSize: 11.5,
        lineHeight: 1.55,
        boxShadow: "0 12px 24px -12px rgba(0,0,0,.55)",
        whiteSpace: "nowrap",
      }}
    >
      <div style={{ color: "rgba(244,246,242,.68)", fontSize: 10.5, marginBottom: 3 }}>
        {formatFullDate(label)}
      </div>
      {payload.map((entry) => (
        <div key={entry.dataKey} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
          <span>
            <Dot color={(colors && colors[entry.dataKey]) || entry.color} />
            {entry.name}
          </span>
          <strong style={{ fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
            {formatMoney(entry.value)}
          </strong>
        </div>
      ))}
    </div>
  );
}

export { STROKE };
