const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const moneyWhole = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export function formatMoney(value) {
  const number = Number(value);
  return Number.isFinite(number) ? money.format(number) : "—";
}

export function formatMoneyWhole(value) {
  const number = Number(value);
  return Number.isFinite(number) ? moneyWhole.format(number) : "—";
}

export function signedMoney(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return "—";
  return (number < 0 ? "-" : "+") + money.format(Math.abs(number));
}

export function formatPct(value, digits = 2) {
  const number = Number(value);
  if (!Number.isFinite(number)) return "—";
  return (number >= 0 ? "+" : "") + number.toFixed(digits) + "%";
}

export function formatPctLabel(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return "—";
  return (number > 0 ? "+" : "") + (Math.abs(number) < 1 ? number.toFixed(2) : number.toFixed(1)) + "%";
}

export function shiftDays(iso, days) {
  const day = new Date(iso + "T00:00:00Z");
  day.setUTCDate(day.getUTCDate() + days);
  return day.toISOString().slice(0, 10);
}

export function formatRangeDate(iso) {
  const day = new Date(iso + "T00:00:00Z");
  return MONTHS[day.getUTCMonth()] + " " + day.getUTCDate() + ", " + String(day.getUTCFullYear()).slice(2);
}

export function formatFullDate(iso) {
  const day = new Date(iso + "T00:00:00Z");
  return MONTHS[day.getUTCMonth()] + " " + day.getUTCDate() + ", " + day.getUTCFullYear();
}

export function formatMonth(key) {
  return MONTHS[Number(key.slice(5, 7)) - 1] + " " + key.slice(2, 4);
}

export function formatAxisMonth(iso) {
  const month = formatMonth(iso.slice(0, 7));
  return month.slice(0, 3) + " '" + month.slice(4);
}

export function monthTicks(points, max = 12) {
  const seen = new Set();
  const ticks = [];
  for (const point of points) {
    const key = point.date.slice(0, 7);
    if (seen.has(key)) continue;
    seen.add(key);
    ticks.push(point.date);
  }
  if (ticks.length <= max) return ticks;
  const step = Math.ceil(ticks.length / max);
  return ticks.filter((_, index) => index % step === 0);
}

export function compactNumber(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return "";
  if (Math.abs(number) >= 1000) {
    const thousands = number / 1000;
    return (Math.abs(thousands) >= 100 ? thousands.toFixed(0) : thousands.toFixed(0)) + "K";
  }
  return String(Math.round(number));
}

export function toPoints(series) {
  if (!series || !Array.isArray(series.dates)) return [];
  return series.dates.map((date, index) => ({
    date,
    value: series.value[index],
    invested: series.invested[index],
    dividends: series.dividends[index],
    benchmarkValue: series.benchmark_value[index],
    benchmarkDividends: series.benchmark_dividends[index],
  }));
}

export function profitOf(point) {
  return point.value + point.dividends - point.invested;
}

export function benchmarkProfitOf(point) {
  return point.benchmarkValue + point.benchmarkDividends - point.invested;
}

export function rangeStart(range, points, custom) {
  if (!points.length) return null;
  const first = points[0].date;
  const last = points[points.length - 1].date;
  if (range === "all") return first;
  if (range === "custom") return (custom && custom.from) || first;
  if (range === "ytd") return last.slice(0, 4) + "-01-01";
  const days = {
    "1d": 1, "7d": 7, "1m": 30, "3m": 91, "6m": 182, "1y": 365, "5y": 1825,
  }[range];
  return days ? shiftDays(last, -days) : first;
}

export function slicePoints(points, range, custom) {
  const start = rangeStart(range, points, custom);
  if (!start) return [];
  const end = range === "custom" && custom && custom.to ? custom.to : null;
  return points.filter((point) => point.date >= start && (!end || point.date <= end));
}

export function valueAt(points, iso, key) {
  let value = 0;
  for (const point of points) {
    if (point.date <= iso) value = point[key];
    else break;
  }
  return value;
}

export function monthlyReturns(points, range) {
  if (points.length < 2) return [];
  const byMonth = new Map();
  for (const point of points) byMonth.set(point.date.slice(0, 7), point);
  const keys = [...byMonth.keys()].sort();

  let selected = keys;
  if (range === "12m") selected = keys.slice(-12);
  else if (/^\d{4}$/.test(range || "")) selected = keys.filter((key) => key.startsWith(range));

  const result = [];
  for (const key of selected) {
    const index = keys.indexOf(key);
    const previousKey = index > 0 ? keys[index - 1] : null;
    const end = byMonth.get(key);
    const start = previousKey ? byMonth.get(previousKey) : points[0];
    if (!start || !start.value) continue;
    const dividendDelta = end.dividends - start.dividends;
    const benchmarkDelta = end.benchmarkDividends - start.benchmarkDividends;
    result.push({
      key,
      label: formatMonth(key),
      pct: ((end.value + dividendDelta) / start.value - 1) * 100,
      benchmarkPct: start.benchmarkValue
        ? ((end.benchmarkValue + benchmarkDelta) / start.benchmarkValue - 1) * 100
        : 0,
    });
  }
  return result;
}

export function incomeMetrics(points) {
  if (!points.length) return { annual: 0, yieldPct: null, growthPct: null };
  const last = points[points.length - 1];
  const oneYearAgo = shiftDays(last.date, -365);
  const twoYearsAgo = shiftDays(last.date, -730);
  const trailingFrom = valueAt(points, oneYearAgo, "dividends");
  const priorFrom = valueAt(points, twoYearsAgo, "dividends");
  const annual = last.dividends - trailingFrom;
  const prior = trailingFrom - priorFrom;
  return {
    annual,
    yieldPct: last.value ? (annual / last.value) * 100 : null,
    growthPct: prior ? (annual / prior - 1) * 100 : null,
  };
}

export function buildCashflows(ledger, terminalValue, terminalDate) {
  const rows = ledger
    .filter((tx) => tx.kind === "BUY" || tx.kind === "SELL")
    .map((tx) => ({
      date: tx.trade_date,
      amount: tx.kind === "BUY" ? -Number(tx.amount) : Number(tx.amount),
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
  if (!rows.length) return [];
  rows.push({ date: terminalDate, amount: Number(terminalValue) });
  return rows;
}

export function irr(cashflows) {
  if (cashflows.length < 2) return null;
  const origin = new Date(cashflows[0].date + "T00:00:00Z").getTime();
  const years = (iso) =>
    (new Date(iso + "T00:00:00Z").getTime() - origin) / (365 * 86400000);
  const npv = (rate) =>
    cashflows.reduce(
      (sum, flow) => sum + flow.amount / Math.pow(1 + rate, years(flow.date)),
      0,
    );

  let low = -0.9999;
  let high = 100;
  let npvLow = npv(low);
  const npvHigh = npv(high);
  if (!Number.isFinite(npvLow) || !Number.isFinite(npvHigh)) return null;
  if (npvLow * npvHigh > 0) return null;

  for (let step = 0; step < 200; step += 1) {
    const mid = (low + high) / 2;
    const value = npv(mid);
    if (Math.abs(value) < 1e-6) return mid * 100;
    if (npvLow * value <= 0) high = mid;
    else {
      low = mid;
      npvLow = value;
    }
  }
  return ((low + high) / 2) * 100;
}

export function holdingsFor(positions, period) {
  const rows = (positions || []).map((position) => ({
    ...position,
    ret:
      (position.period_returns && position.period_returns[period] != null)
        ? position.period_returns[period]
        : (position.return_pct != null ? position.return_pct : 0),
  }));
  rows.sort((a, b) => b.ret - a.ret);
  const total = rows.reduce((sum, row) => sum + (row.market_value || 0), 0);
  return rows.map((row) => ({
    ...row,
    weight: total ? (row.market_value / total) * 100 : 0,
  }));
}

export function barScale(values) {
  const maxAbs = Math.max(0, ...values.map((value) => Math.abs(Number(value) || 0)));
  const step = maxAbs <= 25 ? 5 : maxAbs <= 100 ? 25 : 50;
  const max = Math.max(step, Math.ceil(maxAbs / step) * step);
  const ticks = [];
  for (let value = 0; value <= max; value += step) ticks.push(value);
  return { max, ticks };
}
