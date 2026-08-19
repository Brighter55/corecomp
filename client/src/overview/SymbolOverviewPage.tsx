import { useEffect, useMemo, useState, type ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import ProductHeader from "../headers/product-header/ProductHeader.jsx";
import { authenticatedClientWithRetry } from "../helpers/api.js";
import { StockHeaderProvider } from "./StockHeaderContext.jsx";
import {
  CapitalExpendituresGraph,
  CashFlowTrifectaGraph,
  CashVsDebtGraph,
  CashflowFromFinancingGraph,
  CashflowFromInvestmentGraph,
  ChangeInInventoryGraph,
  CostOfRevenueGraph,
  CurrentRatioGraph,
  DebtStructureGraph,
  DebtEquityRatioGraph,
  DepreciationAndAmortizationGraph,
  DividendPayoutCommonStockGraph,
  DividendsPayoutGraph,
  EPSGraph,
  EbitdaGraph,
  EbitGraph,
  FreeCashflowGraph,
  GrossProfitGraph,
  MarketCapGraph,
  NetIncomeFromContinuingOperationsGraph,
  NetIncomeGraph,
  NetIncomeVsOcfGraph,
  OperatingCashflowGraph,
  OperatingExpensesGraph,
  PBRatioGraph,
  PERatioGraph,
  PFCFRatioGraph,
  PSRatioGraph,
  PricingGraph,
  ProfitMarginGraph,
  QuickRatioGraph,
  REarningsVsCStockGraph,
  ROEGraph,
  ResearchAndDevelopmentGraph,
  ReturnOnAssetsGraph,
  SharesOutstandingGraph,
  TotalAssetsGraph,
  TotalRevenueGraph,
} from "./index.js";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

type Period = "annually" | "quarterly";
type ReportValue = string | number | null | undefined;
type ReportRow = Record<string, ReportValue>;
type StatementData = {
  annualReports?: ReportRow[];
  quarterlyReports?: ReportRow[];
};
type StatementState = StatementData | [] | null;
type CompositeGraph = "ROEPercentage" | "ROAPercentage" | "PERatio" | "MarketCap" | "PBRatio" | "PSRatio" | "PFCFRatio";

type HeroState = {
  name?: string;
  price?: string | number;
} | null;

type InfoState = Record<string, string | number | null | undefined> | null;

function GraphGrid({ children }: { children: ReactNode }) {
  return <div className="grid gap-4 lg:grid-cols-2">{children}</div>;
}

function formatValue(value: string | number | null | undefined) {
  if (value === 0) {
    return "0";
  }
  return value ?? "--";
}

function SymbolOverviewPage() {
  const navigate = useNavigate();
  const { symbol } = useParams();
  const [routeSymbol, setRouteSymbol] = useState("");
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

  const [heroData, setHeroData] = useState<HeroState>(null);
  const [infoData, setInfoData] = useState<InfoState>(null);

  const decodedSymbol = useMemo(() => {
    if (!symbol) {
      return "";
    }
    try {
      return decodeURIComponent(symbol);
    } catch {
      return symbol;
    }
  }, [symbol]);

  useEffect(() => {
    setRouteSymbol(decodedSymbol.trim());
    setFetchVersion((version) => version + 1);
  }, [decodedSymbol]);

  useEffect(() => {
    if (!routeSymbol) {
      setPricingStatement(null);
      return;
    }
    let isActive = true;
    const fetchData = async () => {
      const response = await authenticatedClientWithRetry("/pages/pricing", { symbol: routeSymbol }, () => isActive, navigate, setRouteSymbol);
      if (!isActive) {
        return;
      }
      if (response.status === 204) {
        setPricingStatement([]);
        return;
      }
      const data = await response.json();
      setPricingStatement(data);
    };
    fetchData();
    return () => {
      isActive = false;
    };
  }, [routeSymbol, fetchVersion]);

  useEffect(() => {
    if (!routeSymbol) {
      setDividendsStatement(null);
      return;
    }
    let isActive = true;
    const fetchData = async () => {
      const response = await authenticatedClientWithRetry("/pages/dividends", { symbol: routeSymbol }, () => isActive, navigate, setRouteSymbol);
      if (!isActive) {
        return;
      }
      if (response.status === 204) {
        setDividendsStatement([]);
        return;
      }
      const data = await response.json();
      setDividendsStatement(data);
    };
    fetchData();
    return () => {
      isActive = false;
    };
  }, [routeSymbol, fetchVersion]);

  useEffect(() => {
    if (!routeSymbol) {
      setEarningsStatement(null);
      return;
    }
    let isActive = true;
    const fetchData = async () => {
      const response = await authenticatedClientWithRetry("/pages/earnings", { symbol: routeSymbol }, () => isActive, navigate, setRouteSymbol);
      if (!isActive) {
        return;
      }
      if (response.status === 204) {
        setEarningsStatement([]);
        return;
      }
      const data = await response.json();
      setEarningsStatement(data);
    };
    fetchData();
    return () => {
      isActive = false;
    };
  }, [routeSymbol, fetchVersion]);

  useEffect(() => {
    if (!routeSymbol) {
      setIncomeStatement(null);
      return;
    }
    let isActive = true;
    const fetchData = async () => {
      const response = await authenticatedClientWithRetry("/pages/income-statement", { symbol: routeSymbol }, () => isActive, navigate, setRouteSymbol);
      if (!isActive) {
        return;
      }
      if (response.status === 204) {
        setIncomeStatement([]);
        return;
      }
      const data = await response.json();
      setIncomeStatement(data);
    };
    fetchData();
    return () => {
      isActive = false;
    };
  }, [routeSymbol, fetchVersion]);

  useEffect(() => {
    if (!routeSymbol) {
      setCashFlowStatement(null);
      return;
    }
    let isActive = true;
    const fetchData = async () => {
      const response = await authenticatedClientWithRetry("/pages/cash-flow", { symbol: routeSymbol }, () => isActive, navigate, setRouteSymbol);
      if (!isActive) {
        return;
      }
      if (response.status === 204) {
        setCashFlowStatement([]);
        return;
      }
      const data = await response.json();
      setCashFlowStatement(data);
    };
    fetchData();
    return () => {
      isActive = false;
    };
  }, [routeSymbol, fetchVersion]);

  useEffect(() => {
    if (!routeSymbol) {
      setBalanceSheetStatement(null);
      return;
    }
    let isActive = true;
    const fetchData = async () => {
      const response = await authenticatedClientWithRetry("/pages/balance-sheet", { symbol: routeSymbol }, () => isActive, navigate, setRouteSymbol);
      if (!isActive) {
        return;
      }
      if (response.status === 204) {
        setBalanceSheetStatement([]);
        return;
      }
      const data = await response.json();
      setBalanceSheetStatement(data);
    };
    fetchData();
    return () => {
      isActive = false;
    };
  }, [routeSymbol, fetchVersion]);

  const fetchComposite = (
    graph: CompositeGraph,
    setState: (value: StatementState) => void
  ) => {
    if (!routeSymbol) {
      setState(null);
      return () => {};
    }
    let isActive = true;
    const fetchData = async () => {
      const response = await authenticatedClientWithRetry("/pages/composite", { symbol: routeSymbol, graph }, () => isActive, navigate, setRouteSymbol);
      if (!isActive) {
        return;
      }
      if (response.status === 204) {
        setState([]);
        return;
      }
      const data = await response.json();
      setState(data);
    };
    fetchData();
    return () => {
      isActive = false;
    };
  };

  useEffect(() => {
    return fetchComposite("ROEPercentage", setRoeStatement);
  }, [routeSymbol, fetchVersion]);

  useEffect(() => {
    return fetchComposite("ROAPercentage", setRoaStatement);
  }, [routeSymbol, fetchVersion]);

  useEffect(() => {
    return fetchComposite("PERatio", setPeStatement);
  }, [routeSymbol, fetchVersion]);

  useEffect(() => {
    return fetchComposite("PBRatio", setPbStatement);
  }, [routeSymbol, fetchVersion]);

  useEffect(() => {
    return fetchComposite("PSRatio", setPsStatement);
  }, [routeSymbol, fetchVersion]);

  useEffect(() => {
    return fetchComposite("PFCFRatio", setPfcfStatement);
  }, [routeSymbol, fetchVersion]);

  useEffect(() => {
    return fetchComposite("MarketCap", setMarketCapStatement);
  }, [routeSymbol, fetchVersion]);

  useEffect(() => {
    if (!routeSymbol) {
      setHeroData(null);
      return;
    }
    let isActive = true;
    const fetchData = async () => {
      const response = await authenticatedClientWithRetry("/pages/current-price", { symbol: routeSymbol }, () => isActive, navigate, setRouteSymbol);
      if (!isActive) {
        return;
      }
      if (response.status === 204) {
        setHeroData(null);
        return;
      }
      const data = await response.json();
      setHeroData(data);
    };
    fetchData();
    return () => {
      isActive = false;
    };
  }, [routeSymbol, fetchVersion]);

  useEffect(() => {
    if (!routeSymbol) {
      setInfoData(null);
      return;
    }
    let isActive = true;
    const fetchData = async () => {
      const response = await authenticatedClientWithRetry("/pages/info", { symbol: routeSymbol }, () => isActive, navigate, setRouteSymbol);
      if (!isActive) {
        return;
      }
      if (response.status === 204) {
        setInfoData(null);
        return;
      }
      const data = await response.json();
      setInfoData(data);
    };
    fetchData();
    return () => {
      isActive = false;
    };
  }, [routeSymbol, fetchVersion]);

  const logoUrl = routeSymbol
    ? `https://img.logo.dev/ticker/${routeSymbol}?token=${import.meta.env.VITE_LOGO_DEV_PUBLISHABLE_KEY}&size=450`
    : "";

  const aboutRows = [
    { label: "Sector", value: infoData?.sector },
    { label: "Industry", value: infoData?.industry },
    { label: "Country", value: infoData?.country },
    { label: "Exchange", value: infoData?.exchange },
    { label: "Fiscal Year End", value: infoData?.fiscalYearEnd },
  ];

  const sections = [
    {
      title: "Valuation",
      rows: [
        { label: "Market Cap", value: infoData?.marketCapitalization },
        { label: "Shares Outstanding", value: infoData?.sharesOutstanding },
        { label: "PE Ratio", value: infoData?.peRatio },
        { label: "Price To Sales Ratio TTM", value: infoData?.priceToSalesRatioTtm },
        { label: "Price To Book Ratio", value: infoData?.priceToBookRatio },
        { label: "EV To Revenue", value: infoData?.evToRevenue },
        { label: "EV To EBITDA", value: infoData?.evToEbitda },
      ],
    },
    {
      title: "Price and Moving Average",
      rows: [
        { label: "52 Week High", value: infoData?.fiftyTwoWeekHigh },
        { label: "52 Week Low", value: infoData?.fiftyTwoWeekLow },
        { label: "50 Day Moving Average", value: infoData?.fiftyDayMovingAverage },
        { label: "200 Day Moving Average", value: infoData?.twoHundredDayMovingAverage },
      ],
    },
    {
      title: "Profitability",
      rows: [
        { label: "EBITDA", value: infoData?.ebitda },
        { label: "Diluted EPS TTM", value: infoData?.dilutedEpsTtm },
        { label: "Profit Margin", value: infoData?.profitMargin },
        { label: "Operating Margin TTM", value: infoData?.operatingMarginTtm },
        { label: "Return On Assets TTM", value: infoData?.returnOnAssetsTtm },
        { label: "Return On Equity TTM", value: infoData?.returnOnEquityTtm },
      ],
    },
    {
      title: "Growth",
      rows: [
        { label: "Quarterly Earnings Growth YoY", value: infoData?.quarterlyEarningsGrowthYoy },
        { label: "Quarterly Revenue Growth YoY", value: infoData?.quarterlyRevenueGrowthYoy },
      ],
    },
    {
      title: "Profit",
      rows: [
        { label: "Revenue TTM", value: infoData?.revenueTtm },
        { label: "Gross Profit TTM", value: infoData?.grossProfitTtm },
        { label: "Revenue Per Share TTM", value: infoData?.revenuePerShareTtm },
      ],
    },
    {
      title: "Dividends",
      rows: [
        { label: "Dividend Per Share", value: infoData?.dividendPerShare },
        { label: "Dividend Yield", value: infoData?.dividendYield },
        { label: "Dividend Date", value: infoData?.dividendDate },
        { label: "Ex Dividend Date", value: infoData?.exDividendDate },
      ],
    },
  ];

  return (
    <div className="min-h-screen pb-10">
      <ProductHeader />
      <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-6">
        
        <main className="space-y-6 pb-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Button variant="ghost" className="w-fit" onClick={() => navigate("/overview")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <div className="flex flex-wrap items-center gap-3">
              <Badge className="bg-[rgba(218,215,205,0.2)] text-[var(--text-main)]">{routeSymbol || "NO SYMBOL"}</Badge>
            </div>
          </div>

          <Card className="border-[var(--line-muted)] bg-[rgba(218,215,205,0.08)] text-[var(--text-main)] backdrop-blur-md">
            <CardHeader>
              <CardTitle className="text-3xl">{routeSymbol.toUpperCase() || "NO SYMBOL"}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-8">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={`${routeSymbol} logo`}
                  className="h-28 w-28 rounded-full border border-[var(--line-muted)] object-cover sm:h-44 sm:w-44 md:h-52 md:w-52"
                />
              ) : null}
              <div className="space-y-2">
                <p className="text-lg font-semibold sm:text-3xl">
                  {routeSymbol.toUpperCase()} | {heroData?.name ?? "Loading company name..."}
                </p>
                <p className="text-3xl font-semibold sm:text-5xl">
                  {formatValue(heroData?.price)}
                  <span className="ml-2 text-sm uppercase tracking-[0.12em] sm:text-xl">USD</span>
                </p>
              </div>
            </CardContent>
          </Card>

          <section className="space-y-4">
            <h2 className="text-3xl font-semibold text-[var(--text-main)]">About</h2>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {aboutRows.map((row) => {
                const value = formatValue(row.value);
                return (
                  <div key={row.label} className="rounded-md border border-[var(--line-muted)] bg-[rgba(218,215,205,0.08)] p-3 backdrop-blur-md">
                    <p className="text-xs uppercase tracking-[0.14em] text-[var(--text-muted)]">{row.label}</p>
                    <p className="break-words text-sm font-medium text-[var(--text-main)]">{value}</p>
                  </div>
                );
              })}
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              {sections.map((section) => (
                <Card key={section.title} className="border-[var(--line-muted)] bg-[rgba(218,215,205,0.08)] text-[var(--text-main)] backdrop-blur-md">
                  <CardHeader>
                    <CardTitle className="text-center text-xl">{section.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {section.rows.map((row) => (
                      <div
                        key={row.label}
                        className="flex items-start justify-between gap-4 border-b border-[var(--line-muted)] pb-2 text-sm sm:text-base"
                      >
                        <p className="text-[var(--text-main)]">{row.label}</p>
                        <p className="text-right font-medium text-[var(--text-main)]">{formatValue(row.value)}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          <div className="flex justify-end">
            <div className="inline-flex mx-auto rounded-lg border border-[var(--line-muted)] bg-[rgba(218,215,205,0.08)] p-1">
              <Button
                type="button"
                variant={period === "annually" ? "default" : "ghost"}
                className={period === "annually" ? "bg-[var(--main-dry-sage)] text-[#1f2d24]" : "text-[var(--text-main)]"}
                onClick={() => setPeriod("annually")}
              >
                Annually
              </Button>
              <Button
                type="button"
                variant={period === "quarterly" ? "default" : "ghost"}
                className={period === "quarterly" ? "bg-[var(--main-dry-sage)] text-[#1f2d24]" : "text-[var(--text-main)]"}
                onClick={() => setPeriod("quarterly")}
              >
                Quarterly
              </Button>
            </div>
          </div>

          <StockHeaderProvider symbol={routeSymbol} logoUrl={logoUrl}>
            <Accordion type="multiple" defaultValue={["income"]} className="space-y-4">
            <AccordionItem value="pricing" className="rounded-xl border border-[var(--line-muted)] bg-[rgba(218,215,205,0.08)] px-4">
              <AccordionTrigger className="text-xl text-[var(--text-main)] hover:no-underline">Pricing</AccordionTrigger>
              <AccordionContent>
                <GraphGrid>
                  <PricingGraph statement={pricingStatement} period={period} />
                  <MarketCapGraph statement={marketCapStatement} period={period} />
                </GraphGrid>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="earnings" className="rounded-xl border border-[var(--line-muted)] bg-[rgba(218,215,205,0.08)] px-4">
              <AccordionTrigger className="text-xl text-[var(--text-main)] hover:no-underline">Earnings History</AccordionTrigger>
              <AccordionContent>
                <GraphGrid>
                  <EPSGraph statement={earningsStatement} period={period} />
                </GraphGrid>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="income" className="rounded-xl border border-[var(--line-muted)] bg-[rgba(218,215,205,0.08)] px-4">
              <AccordionTrigger className="text-xl text-[var(--text-main)] hover:no-underline">Income Statement</AccordionTrigger>
              <AccordionContent>
                <GraphGrid>
                  <TotalRevenueGraph statement={incomeStatement} period={period} />
                  <NetIncomeGraph statement={incomeStatement} period={period} />
                  <NetIncomeFromContinuingOperationsGraph statement={incomeStatement} period={period} />
                  <GrossProfitGraph statement={incomeStatement} period={period} />
                  <CostOfRevenueGraph statement={incomeStatement} period={period} />
                  <ResearchAndDevelopmentGraph statement={incomeStatement} period={period} />
                  <OperatingExpensesGraph statement={incomeStatement} period={period} />
                  <EbitGraph statement={incomeStatement} period={period} />
                  <EbitdaGraph statement={incomeStatement} period={period} />
                </GraphGrid>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="cash-flow" className="rounded-xl border border-[var(--line-muted)] bg-[rgba(218,215,205,0.08)] px-4">
              <AccordionTrigger className="text-xl text-[var(--text-main)] hover:no-underline">Cash Flow Statement</AccordionTrigger>
              <AccordionContent>
                <GraphGrid>
                  <OperatingCashflowGraph statement={cashFlowStatement} period={period} />
                  <CapitalExpendituresGraph statement={cashFlowStatement} period={period} />
                  <FreeCashflowGraph statement={cashFlowStatement} period={period} />
                  <CashflowFromInvestmentGraph statement={cashFlowStatement} period={period} />
                  <CashflowFromFinancingGraph statement={cashFlowStatement} period={period} />
                  <CashFlowTrifectaGraph statement={cashFlowStatement} period={period} />
                  <DepreciationAndAmortizationGraph statement={cashFlowStatement} period={period} />
                  <DividendPayoutCommonStockGraph statement={cashFlowStatement} period={period} />
                  <ChangeInInventoryGraph statement={cashFlowStatement} period={period} />
                  <NetIncomeVsOcfGraph statement={cashFlowStatement} period={period} />
                </GraphGrid>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="balance-sheet" className="rounded-xl border border-[var(--line-muted)] bg-[rgba(218,215,205,0.08)] px-4">
              <AccordionTrigger className="text-xl text-[var(--text-main)] hover:no-underline">Balance Sheet</AccordionTrigger>
              <AccordionContent>
                <GraphGrid>
                  <TotalAssetsGraph statement={balanceSheetStatement} period={period} />
                  <SharesOutstandingGraph statement={balanceSheetStatement} period={period} />
                  <CashVsDebtGraph statement={balanceSheetStatement} period={period} />
                  <DebtStructureGraph statement={balanceSheetStatement} period={period} />
                  <REarningsVsCStockGraph statement={balanceSheetStatement} period={period} />
                </GraphGrid>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="dividends" className="rounded-xl border border-[var(--line-muted)] bg-[rgba(218,215,205,0.08)] px-4">
              <AccordionTrigger className="text-xl text-[var(--text-main)] hover:no-underline">Dividends</AccordionTrigger>
              <AccordionContent>
                <GraphGrid>
                  <DividendsPayoutGraph statement={dividendsStatement} period={period} />
                </GraphGrid>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="profitability-ratios" className="rounded-xl border border-[var(--line-muted)] bg-[rgba(218,215,205,0.08)] px-4">
              <AccordionTrigger className="text-xl text-[var(--text-main)] hover:no-underline">Profitability Ratios</AccordionTrigger>
              <AccordionContent>
                <GraphGrid>
                  <ROEGraph statement={roeStatement} period={period} />
                  <ReturnOnAssetsGraph statement={roaStatement} period={period} />
                  <ProfitMarginGraph statement={incomeStatement} period={period} />
                </GraphGrid>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="price-ratios" className="rounded-xl border border-[var(--line-muted)] bg-[rgba(218,215,205,0.08)] px-4">
              <AccordionTrigger className="text-xl text-[var(--text-main)] hover:no-underline">Price Ratios</AccordionTrigger>
              <AccordionContent>
                <GraphGrid>
                  <PERatioGraph statement={peStatement} period={period} />
                  <PBRatioGraph statement={pbStatement} period={period} />
                  <PSRatioGraph statement={psStatement} period={period} />
                  <PFCFRatioGraph statement={pfcfStatement} period={period} />
                </GraphGrid>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="other-ratios" className="rounded-xl border border-[var(--line-muted)] bg-[rgba(218,215,205,0.08)] px-4">
              <AccordionTrigger className="text-xl text-[var(--text-main)] hover:no-underline">Other Ratios</AccordionTrigger>
              <AccordionContent>
                <GraphGrid>
                  <CurrentRatioGraph statement={balanceSheetStatement} period={period} />
                  <QuickRatioGraph statement={balanceSheetStatement} period={period} />
                  <DebtEquityRatioGraph statement={balanceSheetStatement} period={period} />
                </GraphGrid>
              </AccordionContent>
            </AccordionItem>
            
            </Accordion>
          </StockHeaderProvider>
        </main>
      </div>
    </div>
  );
}

export default SymbolOverviewPage;
