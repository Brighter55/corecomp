import { useCallback, useEffect, useMemo, useState } from "react";

import ProductHeader from "../headers/product-header/ProductHeader.jsx";
import {
  buildCashflows,
  formatMoney,
  formatPctLabel,
  formatRangeDate,
  holdingsFor,
  incomeMetrics,
  irr,
  monthlyReturns,
  slicePoints,
  toPoints,
} from "./analysisView.js";
import { deleteTransaction, fetchAnalysis, fetchLedger, saveTransaction } from "./portfolioApi.js";
import DynamicsCard from "./components/DynamicsCard.jsx";
import DetailDrawer from "./components/DetailDrawer.jsx";
import {
  AddTransactionDialog,
  BenchmarkDialog,
  CustomRangeDialog,
  InfoDialog,
} from "./components/Dialogs.jsx";
import HoldingsCard from "./components/HoldingsCard.jsx";
import KpiRow from "./components/KpiRow.jsx";
import PerformanceCard from "./components/PerformanceCard.jsx";
import ValueCard from "./components/ValueCard.jsx";
import "./portfolio.css";

const BENCHMARKS = [
  { symbol: "SPY", label: "S&P 500 (SPY)", description: "Large-cap US equities" },
  { symbol: "VOO", label: "S&P 500 (VOO)", description: "Large-cap US equities, lower fee" },
  { symbol: "QQQ", label: "Nasdaq 100 (QQQ)", description: "Large-cap growth and technology" },
  { symbol: "VTI", label: "Total market (VTI)", description: "US total stock market" },
];

const INFO = {
  value:
    "Tracks the market value of your holdings against the selected benchmark. The dashed line is net cash invested, including contributions over time. Hover or tap the chart to inspect a date.",
  profit:
    "Total gain measured against net contributions. The percentage is the simple return on invested capital, and the daily line compares the latest close with the prior session.",
  irr:
    "Internal rate of return, a money-weighted annualized return that accounts for the timing of contributions and withdrawals. The secondary figure is the return on current holdings only.",
  passive:
    "Trailing twelve-month dividend income, shown as a yield on current portfolio value. Growth compares this year with the prior year.",
  perf:
    "Shows the gain or loss in dollars from the start of the selected range. The zero line separates gains from losses.",
  dyn:
    "Monthly total returns. Green bars are positive months and red bars are negative months. Compare overlays the benchmark month by month.",
  holdings:
    "Total return for each holding over the selected period, sorted from best to worst. Switch to the grid view for value and portfolio weight.",
};

const INFO_TITLES = {
  value: "Portfolio value",
  profit: "Total profit",
  irr: "IRR",
  passive: "Passive income",
  perf: "Portfolio performance",
  dyn: "Monthly returns",
  holdings: "Holdings performance",
};

function downloadCsv(name, rows) {
  if (!rows.length) return;
  const header = Object.keys(rows[0]);
  const body = rows.map((row) =>
    header.map((key) => JSON.stringify(row[key] ?? "")).join(","),
  );
  const blob = new Blob([[header.join(","), ...body].join("\n")], {
    type: "text/csv;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  URL.revokeObjectURL(url);
}

export default function PortfolioPage() {
  const [ledger, setLedger] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");

  const [benchmark, setBenchmark] = useState("SPY");
  const [valueRange, setValueRange] = useState("1y");
  const [perfRange, setPerfRange] = useState("1y");
  const [dynRange, setDynRange] = useState("12m");
  const [holdingsRange, setHoldingsRange] = useState("all");
  const [custom, setCustom] = useState(null);
  const [compare, setCompare] = useState(false);
  const [view, setView] = useState("list");

  const [benchOpen, setBenchOpen] = useState(false);
  const [customOpen, setCustomOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [infoKey, setInfoKey] = useState(null);
  const [drawer, setDrawer] = useState(null);
  const [saveError, setSaveError] = useState("");

  const load = useCallback(async () => {
    setStatus("loading");
    setError("");
    try {
      const [rows, data] = await Promise.all([
        fetchLedger(),
        fetchAnalysis({ benchmark }),
      ]);
      setLedger(Array.isArray(rows) ? rows : []);
      setAnalysis(data);
      setStatus("ready");
    } catch (err) {
      setError(err.message || "Could not load your portfolio.");
      setStatus("error");
    }
  }, [benchmark]);

  useEffect(() => {
    load();
  }, [load]);

  const points = useMemo(
    () => (analysis ? toPoints(analysis.series) : []),
    [analysis],
  );
  const summary = analysis?.summary || {};
  const positions = useMemo(() => analysis?.positions || [], [analysis]);

  const last = points[points.length - 1];
  const previous = points[points.length - 2];
  const todayChange = last && previous ? last.value - previous.value : 0;
  const todayPct = previous && previous.value ? (todayChange / previous.value) * 100 : 0;

  const income = useMemo(() => incomeMetrics(points), [points]);
  const cashflows = useMemo(
    () =>
      buildCashflows(
        ledger,
        last ? last.value + last.dividends : 0,
        last ? last.date : new Date().toISOString().slice(0, 10),
      ),
    [ledger, last],
  );
  const irrValue = useMemo(() => irr(cashflows), [cashflows]);

  const visibleValue = useMemo(() => {
    const sliced = slicePoints(points, valueRange, custom);
    return sliced.length ? sliced : points;
  }, [points, valueRange, custom]);

  const visiblePerf = useMemo(() => {
    const sliced = slicePoints(points, perfRange, custom);
    return sliced.length ? sliced : points;
  }, [points, perfRange, custom]);

  const months = useMemo(() => monthlyReturns(points, dynRange), [points, dynRange]);

  const dynRanges = useMemo(() => {
    const years = [...new Set(points.map((point) => point.date.slice(0, 4)))].sort().reverse();
    return [
      { value: "all", label: "all" },
      { value: "12m", label: "12m" },
      ...years.map((year) => ({ value: year, label: year })),
    ];
  }, [points]);

  const holdings = useMemo(
    () => holdingsFor(positions, holdingsRange),
    [positions, holdingsRange],
  );

  const benchmarkLabel =
    (BENCHMARKS.find((option) => option.symbol === benchmark) || {}).label || benchmark;

  const insight = useMemo(() => {
    if (!visibleValue.length) return "Add a transaction to start tracking this portfolio.";
    const first = visibleValue[0];
    const latest = visibleValue[visibleValue.length - 1];
    const portfolioGain =
      latest.value + latest.dividends - (first.value + first.dividends);
    const benchmarkGain =
      latest.benchmarkValue + latest.benchmarkDividends -
      (first.benchmarkValue + first.benchmarkDividends);
    const difference = portfolioGain - benchmarkGain;
    const percent = first.value ? (Math.abs(difference) / first.value) * 100 : 0;
    return `Portfolio is ${difference >= 0 ? "ahead of" : "behind"} ${benchmarkLabel} by ${formatMoney(Math.abs(difference))} (${percent.toFixed(2)}%) over the selected period.`;
  }, [visibleValue, benchmarkLabel]);

  const kpis = {
    value: summary.value || 0,
    invested: summary.invested || 0,
    profit: summary.profit || 0,
    returnPct: summary.return_pct,
    todayChange,
    todayPct,
    irr: irrValue,
    holdingsReturn: summary.return_pct,
    incomePct: income.yieldPct,
    annualIncome: income.annual,
    incomeGrowth: income.growthPct,
  };

  const drawerContent = useMemo(() => {
    if (!drawer) return null;
    if (drawer === "value") {
      return {
        title: "Portfolio value",
        kicker: "Chart details",
        subtitle: `${visibleValue.length} sessions`,
        columns: [
          { key: "date", label: "Date" },
          { key: "value", label: "Portfolio", render: (row) => formatMoney(row.value), csv: (row) => row.value },
          { key: "benchmarkValue", label: "Benchmark", render: (row) => formatMoney(row.benchmarkValue), csv: (row) => row.benchmarkValue },
          { key: "invested", label: "Invested", render: (row) => formatMoney(row.invested), csv: (row) => row.invested },
        ],
        rows: visibleValue,
        csv: visibleValue.map((row) => ({
          date: row.date,
          portfolio: row.value,
          benchmark: row.benchmarkValue,
          invested: row.invested,
        })),
      };
    }
    if (drawer === "perf") {
      return {
        title: "Portfolio performance",
        kicker: "Chart details",
        subtitle: formatRangeDate(visiblePerf[0]?.date) + " – " + formatRangeDate(visiblePerf[visiblePerf.length - 1]?.date),
        columns: [
          { key: "date", label: "Date" },
          { key: "profit", label: "Portfolio", render: (row) => formatMoney(row.value + row.dividends - row.invested), csv: (row) => row.value + row.dividends - row.invested },
          { key: "benchmarkProfit", label: "Benchmark", render: (row) => formatMoney(row.benchmarkValue + row.benchmarkDividends - row.invested), csv: (row) => row.benchmarkValue + row.benchmarkDividends - row.invested },
        ],
        rows: visiblePerf,
        csv: visiblePerf.map((row) => ({
          date: row.date,
          portfolio_profit: row.value + row.dividends - row.invested,
          benchmark_profit: row.benchmarkValue + row.benchmarkDividends - row.invested,
        })),
      };
    }
    if (drawer === "dyn") {
      return {
        title: "Monthly returns",
        kicker: "Chart details",
        subtitle: `${months.length} months`,
        columns: [
          { key: "label", label: "Month" },
          { key: "pct", label: "Portfolio", render: (row) => formatPctLabel(row.pct) },
          { key: "benchmarkPct", label: "Benchmark", render: (row) => formatPctLabel(row.benchmarkPct) },
        ],
        rows: months,
        csv: months.map((row) => ({
          month: row.key,
          portfolio: row.pct,
          benchmark: row.benchmarkPct,
        })),
      };
    }
    return {
      title: "All holdings",
      kicker: "Holdings",
      subtitle: `${holdings.length} positions`,
      columns: [
        { key: "symbol", label: "Symbol", strong: true },
        { key: "market_value", label: "Value", render: (row) => formatMoney(row.market_value) },
        { key: "weight", label: "Weight", render: (row) => row.weight.toFixed(1) + "%" },
        { key: "units", label: "Units", render: (row) => row.units },
        { key: "ret", label: "Return", render: (row) => formatPctLabel(row.ret) },
      ],
      rows: holdings,
      csv: holdings.map((row) => ({
        symbol: row.symbol,
        value: row.market_value,
        weight: row.weight.toFixed(2),
        units: row.units,
        return_pct: row.ret,
      })),
    };
  }, [drawer, visibleValue, visiblePerf, months, holdings]);

  async function handleSave(payload) {
    setSaveError("");
    try {
      await saveTransaction(payload);
      setAddOpen(false);
      await load();
    } catch (err) {
      setSaveError(err.message || "Could not save that trade.");
    }
  }

  async function handleDelete(id) {
    try {
      await deleteTransaction(id);
      await load();
    } catch (err) {
      setError(err.message || "Could not delete that trade.");
    }
  }

  return (
    <div className="portfolio-page">
      <ProductHeader />
      <main id="main">
        <div className="shell">
          <section className="page-head" id="overview" aria-labelledby="page-title">
            <div>
              <p className="eyebrow">Portfolio analysis</p>
              <h1 id="page-title">Core Portfolio</h1>
              <p className="page-meta">
                <span>Growth &amp; income</span>
                <span className="dot-sep" aria-hidden="true">•</span>
                <span>USD</span>
              </p>
              <button
                className="btn btn-primary"
                type="button"
                style={{ marginTop: 12 }}
                onClick={() => setAddOpen(true)}
              >
                Add transaction
              </button>
            </div>
            <div className="head-value">
              <p className="head-label">Total value</p>
              <p className="head-total">{formatMoney(summary.value || 0)}</p>
              <p className={"head-change " + (todayChange >= 0 ? "gain" : "loss")}>
                {todayChange >= 0 ? "▲" : "▼"}
                <span>
                  {formatMoney(Math.abs(todayChange))} ({Math.abs(todayPct).toFixed(2)}%) today
                </span>
              </p>
            </div>
          </section>

          {status === "loading" ? (
            <div className="insight"><p>Loading your portfolio…</p></div>
          ) : null}

          {status === "error" ? (
            <div className="insight"><p>{error}</p></div>
          ) : null}

          {status === "ready" ? (
            <>
              <KpiRow kpis={kpis} onInfo={setInfoKey} />

              {positions.length === 0 ? (
                <article className="card">
                  <div className="card-head">
                    <h2 className="card-title">No holdings yet</h2>
                  </div>
                  <p style={{ marginTop: 12, fontSize: 13.5, color: "var(--ink-soft)" }}>
                    Add your first trade to see portfolio value, profit, monthly returns
                    and holdings performance. Dollars and a date are enough. Shares and
                    price are optional.
                  </p>
                  <div className="card-foot">
                    <button className="foot-btn" type="button" onClick={() => setAddOpen(true)}>
                      Add transaction <span className="arrow" aria-hidden="true">→</span>
                    </button>
                  </div>
                </article>
              ) : (
                <>
                  <ValueCard
                    points={visibleValue}
                    range={valueRange}
                    onRange={setValueRange}
                    onCustom={() => setCustomOpen(true)}
                    custom={custom}
                    benchmarkLabel={benchmarkLabel}
                    insight={insight}
                    onInfo={setInfoKey}
                    onDetails={() => setDrawer("value")}
                    onCsv={() => downloadCsv("portfolio-value.csv", drawerCsv("value"))}
                    onSelectBenchmark={() => setBenchOpen(true)}
                    onTutorial={() => setInfoKey("value")}
                  />

                  <PerformanceCard
                    points={visiblePerf}
                    range={perfRange}
                    onRange={setPerfRange}
                    benchmarkLabel={benchmarkLabel}
                    compare={compare}
                    onCompare={() => setCompare((value) => !value)}
                    onInfo={setInfoKey}
                    onDetails={() => setDrawer("perf")}
                    onCsv={() => downloadCsv("portfolio-performance.csv", drawerCsv("perf"))}
                    onSelectBenchmark={() => setBenchOpen(true)}
                  />

                  <DynamicsCard
                    months={months}
                    range={dynRange}
                    ranges={dynRanges}
                    onRange={setDynRange}
                    benchmarkLabel={benchmarkLabel}
                    compare={compare}
                    onInfo={setInfoKey}
                    onDetails={() => setDrawer("dyn")}
                    onCsv={() => downloadCsv("portfolio-monthly-returns.csv", drawerCsv("dyn"))}
                  />

                  <HoldingsCard
                    holdings={holdings}
                    range={holdingsRange}
                    onRange={setHoldingsRange}
                    view={view}
                    onView={setView}
                    onInfo={setInfoKey}
                    onDetails={() => setDrawer("holdings")}
                    onCsv={() => downloadCsv("portfolio-holdings.csv", drawerCsv("holdings"))}
                  />
                </>
              )}

              <article className="card" aria-label="Transactions">
                <div className="card-head">
                  <h2 className="card-title">Transactions</h2>
                </div>
                <div className="drawer-body" style={{ maxHeight: 360 }}>
                  {ledger.length === 0 ? (
                    <p style={{ padding: "12px 0", fontSize: 13, color: "var(--muted)" }}>
                      No trades recorded yet.
                    </p>
                  ) : (
                    <table>
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Symbol</th>
                          <th>Type</th>
                          <th>Amount</th>
                          <th> </th>
                        </tr>
                      </thead>
                      <tbody>
                        {ledger.map((tx) => (
                          <tr key={tx.id}>
                            <td>{tx.trade_date}</td>
                            <td className="cell-strong">{tx.symbol}</td>
                            <td>{tx.kind}</td>
                            <td>{formatMoney(tx.amount)}</td>
                            <td style={{ textAlign: "right" }}>
                              <button
                                className="link-btn"
                                type="button"
                                onClick={() => handleDelete(tx.id)}
                              >
                                Remove
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </article>
            </>
          ) : null}
        </div>
      </main>

      <BenchmarkDialog
        open={benchOpen}
        value={benchmark}
        options={BENCHMARKS}
        onApply={(symbol) => {
          setBenchmark(symbol);
          setBenchOpen(false);
        }}
        onClose={() => setBenchOpen(false)}
      />

      <CustomRangeDialog
        open={customOpen}
        value={custom}
        onApply={(range) => {
          setCustom(range);
          setValueRange("custom");
          setCustomOpen(false);
        }}
        onClose={() => setCustomOpen(false)}
      />

      <InfoDialog
        open={Boolean(infoKey)}
        title={INFO_TITLES[infoKey] || ""}
        body={INFO[infoKey] || ""}
        onClose={() => setInfoKey(null)}
      />

      <AddTransactionDialog
        open={addOpen}
        onSave={handleSave}
        onClose={() => {
          setAddOpen(false);
          setSaveError("");
        }}
        error={saveError}
      />

      <DetailDrawer
        open={Boolean(drawer)}
        title={drawerContent?.title}
        kicker={drawerContent?.kicker}
        subtitle={drawerContent?.subtitle}
        columns={drawerContent?.columns || []}
        rows={drawerContent?.rows || []}
        onCsv={() => drawerContent && downloadCsv(`portfolio-${drawer}.csv`, drawerContent.csv)}
        onClose={() => setDrawer(null)}
      />
    </div>
  );

  function drawerCsv(key) {
    if (key === "value") {
      return visibleValue.map((row) => ({
        date: row.date,
        portfolio: row.value,
        benchmark: row.benchmarkValue,
        invested: row.invested,
      }));
    }
    if (key === "perf") {
      return visiblePerf.map((row) => ({
        date: row.date,
        portfolio_profit: row.value + row.dividends - row.invested,
        benchmark_profit: row.benchmarkValue + row.benchmarkDividends - row.invested,
      }));
    }
    if (key === "dyn") {
      return months.map((row) => ({
        month: row.key,
        portfolio: row.pct,
        benchmark: row.benchmarkPct,
      }));
    }
    return holdings.map((row) => ({
      symbol: row.symbol,
      value: row.market_value,
      weight: row.weight.toFixed(2),
      units: row.units,
      return_pct: row.ret,
    }));
  }
}
