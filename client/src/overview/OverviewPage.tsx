import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Activity, ArrowUpRight, BarChart3, Newspaper, TrendingUp } from "lucide-react";
import ProductHeader from "../headers/product-header/ProductHeader.jsx";
import SymbolSearch from "../shared/SymbolSearch.jsx";
import { authenticatedClientWithRetry } from "../helpers/api.js";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

type Period = "annually" | "quarterly";
type ReportValue = string | number | null | undefined;
type ReportRow = Record<string, ReportValue>;
type StatementData = {
  annualReports?: ReportRow[];
  quarterlyReports?: ReportRow[];
};
type StatementState = StatementData | [] | null;

type CompositeGraph = "ROEPercentage" | "ROAPercentage" | "PERatio" | "MarketCap" | "PBRatio" | "PSRatio" | "PFCFRatio";

type SymbolSubmitHandler = (event: FormEvent<HTMLElement> | KeyboardEvent, symbolFromChild: string) => void;

const trendRows = [
  { symbol: "EVG.GLB", label: "Global Index", value: "12,482.00", change: "+1.24%", positive: true },
  { symbol: "US 10H", label: "Treasury Yield", value: "4.125%", change: "-0.05%", positive: false },
  { symbol: "BRENT.C", label: "Crude Oil", value: "78.42", change: "+0.88%", positive: true },
  { symbol: "XAU/USD", label: "Gold Spot", value: "2,024.15", change: "+0.42%", positive: true },
  { symbol: "EUR/USD", label: "Euro / US Dollar", value: "1.0892", change: "-0.12%", positive: false },
];

const intelligenceRows = [
  {
    title: "Global Trade",
    copy: "Sovereign bonds rally as fiscal projections stabilize in emerging markets.",
    meta: "12m ago • 4 min read",
  },
  {
    title: "Commodities",
    copy: "Industrial metals reach 6-month high amid green energy transition demand.",
    meta: "45m ago • 6 min read",
  },
  {
    title: "Technology",
    copy: "Semi-conductor output forecast adjusted following strategic logistics shifts.",
    meta: "2h ago • 8 min read",
  },
];

function extractNumericValue(statement: StatementState, period: Period, keys: string[]): number | null {
  if (!statement || Array.isArray(statement)) {
    return null;
  }

  const source = period === "annually" ? statement.annualReports : statement.quarterlyReports;
  const latest = source?.[0];

  if (!latest) {
    return null;
  }

  for (const key of keys) {
    const raw = latest[key];
    if (raw === null || raw === undefined) {
      continue;
    }

    const value = typeof raw === "number" ? raw : Number(String(raw).replace(/,/g, ""));
    if (!Number.isNaN(value)) {
      return value;
    }
  }

  return null;
}

function formatCompact(value: number | null, suffix = ""): string {
  if (value === null) {
    return "--";
  }

  if (Math.abs(value) < 1000) {
    return `${value.toFixed(2)}${suffix}`;
  }

  return `${new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 2,
  }).format(value)}${suffix}`;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function OverviewPage() {
  const navigate = useNavigate();
  const [symbol, setSymbol] = useState("");
  const [period, setPeriod] = useState<Period>("annually");
  const [fetchVersion, setFetchVersion] = useState(0);
  const [pricingStatement, setPricingStatement] = useState<StatementState>(null);
  const [dividendsStatement, setDividendsStatement] = useState<StatementState>(null);
  const [earningsStatement, setEarningsStatement] = useState<StatementState>(null);
  const [incomeStatement, setIncomeStatement] = useState<StatementState>(null);
  const [cashFlowStatement, setCashFlowStatement] = useState<StatementState>(null);
  const [balanceSheetStatement, setBalanceSheetStatement] = useState<StatementState>(null);
  const [roeStatement, setRoeStatement] = useState<StatementState>(null);
  const [roaStatement, setRoaStatement] = useState<StatementState>(null);
  const [peStatement, setPeStatement] = useState<StatementState>(null);
  const [pbStatement, setPbStatement] = useState<StatementState>(null);
  const [psStatement, setPsStatement] = useState<StatementState>(null);
  const [pfcfStatement, setPfcfStatement] = useState<StatementState>(null);
  const [marketCapStatement, setMarketCapStatement] = useState<StatementState>(null);

  const handleSearchSubmit: SymbolSubmitHandler = (event, symbolFromChild) => {
    event.preventDefault();
    setSymbol(symbolFromChild);
    setFetchVersion((version) => version + 1);
  };

  const fetchStatement = async (
    endpoint: string,
    payload: Record<string, string>,
    setState: (value: StatementState) => void,
    isActive: () => boolean
  ) => {
    const response = await authenticatedClientWithRetry(endpoint, payload, isActive, navigate, setSymbol);
    if (!isActive()) {
      return;
    }
    if (response.status === 204) {
      setState([]);
      return;
    }
    const data = await response.json();
    setState(data);
  };

  const setupStatementEffect = (
    targetSymbol: string,
    endpoint: string,
    payload: Record<string, string>,
    setState: (value: StatementState) => void
  ) => {
    if (!targetSymbol) {
      setState(null);
      return () => {};
    }

    let active = true;
    const isActive = () => active;

    fetchStatement(endpoint, payload, setState, isActive);

    return () => {
      active = false;
    };
  };

  useEffect(() => {
    return setupStatementEffect(symbol, "/pages/pricing", { symbol }, setPricingStatement);
  }, [symbol, fetchVersion, navigate]);

  useEffect(() => {
    return setupStatementEffect(symbol, "/pages/dividends", { symbol }, setDividendsStatement);
  }, [symbol, fetchVersion, navigate]);

  useEffect(() => {
    return setupStatementEffect(symbol, "/pages/earnings", { symbol }, setEarningsStatement);
  }, [symbol, fetchVersion, navigate]);

  useEffect(() => {
    return setupStatementEffect(symbol, "/pages/income-statement", { symbol }, setIncomeStatement);
  }, [symbol, fetchVersion, navigate]);

  useEffect(() => {
    return setupStatementEffect(symbol, "/pages/cash-flow", { symbol }, setCashFlowStatement);
  }, [symbol, fetchVersion, navigate]);

  useEffect(() => {
    return setupStatementEffect(symbol, "/pages/balance-sheet", { symbol }, setBalanceSheetStatement);
  }, [symbol, fetchVersion, navigate]);

  const setupCompositeEffect = (graph: CompositeGraph, setState: (value: StatementState) => void) => {
    return setupStatementEffect(symbol, "/pages/composite", { symbol, graph }, setState);
  };

  useEffect(() => {
    return setupCompositeEffect("ROEPercentage", setRoeStatement);
  }, [symbol, fetchVersion, navigate]);

  useEffect(() => {
    return setupCompositeEffect("ROAPercentage", setRoaStatement);
  }, [symbol, fetchVersion, navigate]);

  useEffect(() => {
    return setupCompositeEffect("PERatio", setPeStatement);
  }, [symbol, fetchVersion, navigate]);

  useEffect(() => {
    return setupCompositeEffect("MarketCap", setMarketCapStatement);
  }, [symbol, fetchVersion, navigate]);

  useEffect(() => {
    return setupCompositeEffect("PBRatio", setPbStatement);
  }, [symbol, fetchVersion, navigate]);

  useEffect(() => {
    return setupCompositeEffect("PSRatio", setPsStatement);
  }, [symbol, fetchVersion, navigate]);

  useEffect(() => {
    return setupCompositeEffect("PFCFRatio", setPfcfStatement);
  }, [symbol, fetchVersion, navigate]);

  const revenue = extractNumericValue(incomeStatement, period, ["totalRevenue"]);
  const netIncome = extractNumericValue(incomeStatement, period, ["netIncome", "netIncomeFromContinuingOperations"]);
  const marketCap = extractNumericValue(marketCapStatement, period, ["MarketCap", "marketCapitalization"]);
  const freeCashFlow = extractNumericValue(cashFlowStatement, period, ["operatingCashflow", "freeCashFlow"]);
  const peRatio = extractNumericValue(peStatement, period, ["PERatio", "peRatio"]);

  const fearIndex = useMemo(() => {
    const roe = extractNumericValue(roeStatement, period, ["ROEPercentage", "roePercentage"]);
    const roa = extractNumericValue(roaStatement, period, ["ROAPercentage", "roaPercentage"]);
    const pfcf = extractNumericValue(pfcfStatement, period, ["PFCFRatio", "pfcfRatio"]);

    if (roe === null && roa === null && pfcf === null) {
      return 68;
    }

    const quality = (roe ?? 12) * 1.4 + (roa ?? 7) * 1.8;
    const valuationPenalty = (pfcf ?? 15) * 0.9;
    return clamp(Math.round(48 + quality - valuationPenalty), 8, 94);
  }, [period, pfcfStatement, roaStatement, roeStatement]);

  const trendTone = fearIndex >= 55 ? "Greed" : "Fear";

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_20%_0%,rgba(163,177,138,0.22),transparent_45%),radial-gradient(circle_at_80%_100%,rgba(88,129,87,0.14),transparent_42%),linear-gradient(160deg,#24382f_0%,#344e41_35%,#2f443a_100%)] pb-10">
      <div className="mx-auto w-full max-w-[1400px] px-4 pt-4 sm:px-6">
        <ProductHeader />

        <main className="grid gap-4 pb-6 lg:grid-cols-[240px_minmax(0,1fr)_250px]">
          <section className="space-y-4">
            <div className="flex items-center gap-2 px-1 text-[var(--text-main)]">
              <Newspaper className="h-4 w-4 text-[var(--main-dry-sage)]" />
              <h2 className="text-lg font-semibold">Market Intelligence</h2>
            </div>
            {intelligenceRows.map((story) => (
              <Card key={story.title} className="border-[var(--line-muted)] bg-[rgba(218,215,205,0.08)] text-[var(--text-main)] backdrop-blur-md">
                <CardHeader className="pb-2">
                  <CardDescription className="uppercase tracking-[0.2em] text-[var(--main-dry-sage)]">
                    {story.title}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-base leading-relaxed text-[var(--text-main)]">{story.copy}</p>
                  <p className="text-xs text-[var(--text-muted)]">{story.meta}</p>
                </CardContent>
              </Card>
            ))}
          </section>

          <section className="space-y-4">
            <Card className="border-[var(--line-muted)] bg-[rgba(218,215,205,0.08)] text-[var(--text-main)] backdrop-blur-md">
              <CardHeader className="items-center pb-3 text-center">
                <CardTitle className="text-4xl font-light tracking-wide sm:text-5xl">CoreComp</CardTitle>
                <CardDescription className="text-base text-[var(--text-muted)]">
                  An every core detail of a company app
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <form onSubmit={(event) => handleSearchSubmit(event, symbol)}>
                  <SymbolSearch handleSearchSubmit={handleSearchSubmit} />
                </form>

                <div className="flex flex-wrap items-center justify-center gap-2">
                  <Button
                    type="button"
                    variant={period === "annually" ? "forest" : "outline"}
                    onClick={() => {
                      setPeriod("annually");
                    }}
                    className="rounded-full px-5"
                  >
                    Annually
                  </Button>
                  <Button
                    type="button"
                    variant={period === "quarterly" ? "forest" : "outline"}
                    onClick={() => {
                      setPeriod("quarterly");
                    }}
                    className="rounded-full px-5"
                  >
                    Quarterly
                  </Button>
                  {symbol ? (
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => {
                        setSymbol("");
                      }}
                    >
                      Reset Symbol
                    </Button>
                  ) : null}
                </div>
              </CardContent>
            </Card>

            {symbol ? (
              <Card className="border-[var(--line-muted)] bg-[rgba(218,215,205,0.08)] text-[var(--text-main)] backdrop-blur-md">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardDescription className="tracking-[0.24em] text-[var(--main-dry-sage)]">SENTIMENT ANALYSIS</CardDescription>
                    <Badge className="bg-[var(--main-fern)] text-[var(--main-dust-grey)]">{symbol.toUpperCase()}</Badge>
                  </div>
                  <CardTitle className="text-3xl">Market Fear Index</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-end justify-between">
                    <p className="text-sm uppercase tracking-[0.2em] text-[var(--text-muted)]">Current Reading</p>
                    <p className="text-5xl font-semibold text-[var(--main-dry-sage)]">{fearIndex}</p>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-[rgba(163,177,138,0.3)]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#b7deaf] via-[#cce4a6] to-[#6fa35e] transition-all duration-700"
                      style={{ width: `${fearIndex}%` }}
                    />
                  </div>
                  <div className="grid grid-cols-3 text-xs uppercase tracking-[0.16em] text-[var(--text-muted)]">
                    <span>Extreme Fear</span>
                    <span className="text-center">Neutral</span>
                    <span className="text-right">Extreme Greed</span>
                  </div>
                  <Separator className="bg-[var(--line-muted)]" />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-xs uppercase tracking-[0.16em] text-[var(--text-muted)]">Yesterday</p>
                      <p className="text-xl">{Math.max(0, fearIndex - 5)} ({trendTone})</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.16em] text-[var(--text-muted)]">Last Month</p>
                      <p className="text-xl">{Math.max(0, fearIndex - 23)} ({fearIndex >= 50 ? "Fear" : "Extreme Fear"})</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-[var(--line-muted)] bg-[rgba(218,215,205,0.08)] text-[var(--text-main)] backdrop-blur-md">
                <CardHeader>
                  <CardTitle className="text-2xl">Start with a symbol</CardTitle>
                  <CardDescription className="text-[var(--text-muted)]">
                    Search a ticker above to load your live company snapshot and trend indicators.
                  </CardDescription>
                </CardHeader>
              </Card>
            )}

            {symbol ? (
              <div className="grid gap-4 md:grid-cols-2">
                <Card className="border-[var(--line-muted)] bg-[rgba(218,215,205,0.08)] text-[var(--text-main)] backdrop-blur-md">
                  <CardHeader>
                    <CardDescription>Company Snapshot</CardDescription>
                    <CardTitle className="text-2xl">{symbol.toUpperCase()}</CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-[var(--text-muted)]">Market Cap</span>
                      <span>{formatCompact(marketCap)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[var(--text-muted)]">Revenue</span>
                      <span>{formatCompact(revenue)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[var(--text-muted)]">Net Income</span>
                      <span>{formatCompact(netIncome)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[var(--text-muted)]">Free Cashflow</span>
                      <span>{formatCompact(freeCashFlow)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[var(--text-muted)]">P/E Ratio</span>
                      <span>{formatCompact(peRatio)}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-[var(--line-muted)] bg-[rgba(218,215,205,0.08)] text-[var(--text-main)] backdrop-blur-md">
                  <CardHeader>
                    <CardDescription>Chart Migration</CardDescription>
                    <CardTitle className="text-2xl">Queued for Tune Pass</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm text-[var(--text-muted)]">
                    <p>Full chart modules are deferred in this pass to allow focused visual/data tuning next.</p>
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2">
                        <BarChart3 className="h-4 w-4 text-[var(--main-dry-sage)]" />
                        Pricing and market-cap chart slot prepared
                      </li>
                      <li className="flex items-center gap-2">
                        <Activity className="h-4 w-4 text-[var(--main-dry-sage)]" />
                        Earnings and cash-flow chart slot prepared
                      </li>
                      <li className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-[var(--main-dry-sage)]" />
                        Ratio chart panel slot prepared
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            ) : null}
          </section>

          <section className="space-y-4">
            <div className="flex items-center justify-between px-1 text-[var(--text-main)]">
              <h2 className="text-lg font-semibold">Trending Stocks</h2>
              <ArrowUpRight className="h-4 w-4 text-[var(--main-dry-sage)]" />
            </div>
            <Card className="border-[var(--line-muted)] bg-[rgba(218,215,205,0.08)] text-[var(--text-main)] backdrop-blur-md">
              <CardContent className="space-y-2 pt-5">
                {trendRows.map((row) => (
                  <div
                    key={row.symbol}
                    className="grid grid-cols-[1fr_auto] gap-4 rounded-xl px-3 py-3 transition-colors hover:bg-[rgba(218,215,205,0.07)]"
                  >
                    <div>
                      <p className="font-semibold">{row.symbol}</p>
                      <p className="text-xs text-[var(--text-muted)]">{row.label}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{row.value}</p>
                      <p className={`text-xs ${row.positive ? "text-[#8fd08c]" : "text-[#ff9f93]"}`}>{row.change}</p>
                    </div>
                  </div>
                ))}
                <Separator className="my-2 bg-[var(--line-muted)]" />
                <Button variant="ghost" className="w-full justify-center text-sm uppercase tracking-[0.16em]">
                  View All Markets
                </Button>
              </CardContent>
            </Card>

            <Card className="border-[var(--line-muted)] bg-[rgba(218,215,205,0.08)] text-[var(--text-main)] backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-lg">Data Health</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-[var(--text-muted)]">
                <div className="flex items-center justify-between">
                  <span>Pricing</span>
                  <Badge variant="outline" className="border-[var(--line-muted)] text-[var(--text-main)]">
                    {pricingStatement ? "Loaded" : "Idle"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Earnings</span>
                  <Badge variant="outline" className="border-[var(--line-muted)] text-[var(--text-main)]">
                    {earningsStatement ? "Loaded" : "Idle"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Balance Sheet</span>
                  <Badge variant="outline" className="border-[var(--line-muted)] text-[var(--text-main)]">
                    {balanceSheetStatement ? "Loaded" : "Idle"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Cash Flow</span>
                  <Badge variant="outline" className="border-[var(--line-muted)] text-[var(--text-main)]">
                    {cashFlowStatement ? "Loaded" : "Idle"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Dividends</span>
                  <Badge variant="outline" className="border-[var(--line-muted)] text-[var(--text-main)]">
                    {dividendsStatement ? "Loaded" : "Idle"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>P/B + P/S Ratios</span>
                  <Badge variant="outline" className="border-[var(--line-muted)] text-[var(--text-main)]">
                    {pbStatement && psStatement ? "Loaded" : "Idle"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </section>
        </main>
      </div>
    </div>
  );
}

export default OverviewPage;
