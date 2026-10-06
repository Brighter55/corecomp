import { type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import ProductHeader from "../headers/product-header/ProductHeader.jsx";
import SymbolSearch from "../shared/SymbolSearch.jsx";
import SectionHeader from "./components/SectionHeader.tsx";
import Sparkline from "./components/Sparkline.tsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type SymbolSubmitHandler = (event: FormEvent<HTMLElement> | KeyboardEvent, symbolFromChild: string) => void;

// Placeholder content for the design pass. Swap for real data once the section
// layouts are signed off.
// `spark` is a raw price series — Sparkline normalises it into the viewBox, so
// these arrays are the only part that gets replaced when real data arrives.
const trendRows = [
  {
    symbol: "NVDA",
    label: "NVIDIA Corporation",
    value: "$128.84",
    change: "+3.48%",
    positive: true,
    volCap: "Vol: 48.2M • Cap: $3.16T",
    spark: [126.1, 126.85, 126.6, 127.9, 127.55, 128.84],
  },
  {
    symbol: "AAPL",
    label: "Apple Inc.",
    value: "$224.23",
    change: "+1.12%",
    positive: true,
    volCap: "Vol: 52.8M • Cap: $3.44T",
    spark: [219.4, 218.1, 220.75, 220.1, 222.6, 224.23],
  },
  {
    symbol: "TSLA",
    label: "Tesla, Inc.",
    value: "$246.30",
    change: "-2.45%",
    positive: false,
    volCap: "Vol: 79.1M • Cap: $785.4B",
    spark: [252.8, 251.1, 252.3, 247.9, 249.2, 246.3],
  },
  {
    symbol: "MSFT",
    label: "Microsoft Corporation",
    value: "$448.90",
    change: "+1.85%",
    positive: true,
    volCap: "Vol: 22.4M • Cap: $3.33T",
    spark: [440.2, 443.1, 441.5, 446.8, 445.2, 448.9],
  },
];

const newsCategories = ["All", "Macro", "Commodities", "Technology"];
const activeCategory = "All";

const newsRows = [
  {
    category: "Global Trade",
    title: "Sovereign bonds rally as fiscal projections stabilize in emerging markets",
    copy: "Treasury yield compression accelerates across regional hubs following coordinated monetary stance signals and moderated debt servicing outlooks.",
    meta: "12m ago • 4 min read",
    source: "Reuters",
    tag: "$BOND",
  },
  {
    category: "Commodities",
    title: "Industrial metals reach 6-month high amid green energy transition demand",
    copy: "Refined copper stockpiles test multi-year troughs while strategic electrification buildouts in grid networks stimulate contract delivery volumes.",
    meta: "38m ago • 3 min read",
    source: "Bloomberg",
    tag: "$COPX",
  },
  {
    category: "Technology",
    title: "Semiconductor output forecast adjusted following strategic logistics shifts",
    copy: "Foundry utilization trends point toward robust silicon packaging capacity expansion, easing near-term component backlog bottlenecks.",
    meta: "1h ago • 5 min read",
    source: "Financial Times",
    tag: "$SOXX",
  },
];

function OverviewPage() {
  const navigate = useNavigate();

  const handleSearchSubmit: SymbolSubmitHandler = (event, symbolFromChild) => {
    event.preventDefault();
    const nextSymbol = symbolFromChild.trim();
    if (!nextSymbol) {
      return;
    }
    navigate(`/overview/${encodeURIComponent(nextSymbol)}`);
  };

  return (
    <div className="min-h-screen pb-10">
      <ProductHeader />
      <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-6">
        <main className="space-y-12 pb-6">
          <section className="pt-20">
            <Card className="border-0">
              <CardHeader className="items-center pb-3 text-center">
                <CardTitle className="font-bold tracking-wide text-5xl sm:text-7xl">CoreComp</CardTitle>
                <CardDescription className="text-base text-[var(--text-muted)]">
                  An every core detail of a company app
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <SymbolSearch
                  className="mx-auto w-full max-w-md"
                  inputClassName="h-16 text-base"
                  label="Symbol"
                  placeholder="Symbol"
                  handleSearchSubmit={handleSearchSubmit}
                />
              </CardContent>
            </Card>
          </section>

          <section className="space-y-6">
            <SectionHeader
              title="Trending Stocks"
              actions={
                <>
                  <button
                    type="button"
                    aria-label="Previous trending stocks"
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--line-muted)] text-[var(--text-muted)] transition-colors hover:border-[var(--main-dry-sage)] hover:text-[var(--text-main)]"
                  >
                    <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    aria-label="Next trending stocks"
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--line-muted)] text-[var(--text-muted)] transition-colors hover:border-[var(--main-dry-sage)] hover:text-[var(--text-main)]"
                  >
                    <ChevronRight className="h-4 w-4" aria-hidden="true" />
                  </button>
                </>
              }
            />
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              {trendRows.map((row) => (
                <article
                  key={row.symbol}
                  className="flex flex-col justify-between rounded-2xl border border-[var(--line-muted)] bg-[var(--surface-soft)] p-5 backdrop-blur-md transition-colors hover:border-[var(--main-dry-sage)]"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-lg font-bold tracking-tight text-[var(--text-main)]">
                        {row.symbol}
                      </span>
                      <span
                        className={`rounded px-2 py-0.5 text-[11px] font-bold ${
                          row.positive
                            ? "text-[var(--change-up)]"
                            : "text-[var(--change-down)]"
                        } bg-[var(--surface-soft)]`}
                      >
                        {row.change}
                      </span>
                    </div>
                    <p className="text-xs font-medium text-[var(--text-muted)]">{row.label}</p>
                    <div className="flex items-end justify-between gap-3">
                      <div>
                        <p className="text-2xl font-bold text-[var(--text-main)]">{row.value}</p>
                        <p className="text-[11px] text-[var(--text-muted)]">{row.volCap}</p>
                      </div>
                      <Sparkline points={row.spark} positive={row.positive} />
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="space-y-6">
            <SectionHeader
              title="Market News"
              filters={
                <div className="flex flex-wrap items-center gap-2">
                  {newsCategories.map((category) => (
                    <button
                      key={category}
                      type="button"
                      aria-pressed={category === activeCategory}
                      className={
                        category === activeCategory
                          ? "rounded-full bg-[var(--main-hunter-green)] px-3 py-1 text-xs font-semibold text-white"
                          : "rounded-full border border-[var(--line-muted)] px-3 py-1 text-xs font-semibold text-[var(--text-muted)] transition-colors hover:text-[var(--text-main)]"
                      }
                    >
                      {category}
                    </button>
                  ))}
                </div>
              }
              actions={
                <a
                  href="#all-news"
                  className="flex items-center gap-1 text-xs font-semibold text-[var(--text-main)] transition-colors hover:text-[var(--main-dry-sage)]"
                >
                  View all news
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </a>
              }
            />
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {newsRows.map((story) => (
                <article
                  key={story.title}
                  className="flex flex-col justify-between rounded-2xl border border-[var(--line-muted)] bg-[var(--surface-soft)] p-6 backdrop-blur-md transition-colors hover:border-[var(--main-dry-sage)]"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="rounded border border-[var(--line-muted)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">
                        {story.category}
                      </span>
                      <span className="text-[11px] text-[var(--text-muted)]">{story.meta}</span>
                    </div>
                    <h3 className="text-base font-bold text-[var(--text-main)]">{story.title}</h3>
                    <p className="text-xs leading-relaxed text-[var(--text-muted)]">{story.copy}</p>
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-[var(--line-muted)] pt-4 text-xs text-[var(--text-muted)]">
                    <span className="font-medium text-[var(--text-main)]">{story.source}</span>
                    <span className="rounded bg-[var(--surface-soft)] px-2 py-0.5 text-[11px] font-semibold text-[var(--text-main)]">
                      {story.tag}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

export default OverviewPage;
