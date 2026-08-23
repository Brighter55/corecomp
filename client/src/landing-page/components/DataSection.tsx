import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { FileCheck2, FileText, LineChart, Percent, Scale, Wallet } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import SymbolSearch from "../../shared/SymbolSearch.jsx";
import { Card, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { cn } from "../../lib/utils.ts";

type CategoryKey = "income" | "balance-sheet" | "cash-flow" | "metrics" | "price";

type Category = { key: CategoryKey; title: string; subtitle: string; icon: LucideIcon };

const categories: Category[] = [
  { key: "income", title: "Income Statements", subtitle: "Revenue, expenses & profitability", icon: FileText },
  { key: "balance-sheet", title: "Balance Sheets", subtitle: "Assets, liabilities & equity", icon: Scale },
  { key: "cash-flow", title: "Cash Flow Statements", subtitle: "Operating, investing & financing", icon: Wallet },
  { key: "metrics", title: "Financial Metrics", subtitle: "Ratios & key performance measures", icon: Percent },
  { key: "price", title: "Price Data", subtitle: "Market price history", icon: LineChart },
];

const CARD_TITLE: Record<CategoryKey, string> = {
  income: "Net Income Performance",
  "balance-sheet": "Balance Sheets",
  "cash-flow": "Cash Flow Statements",
  metrics: "Financial Metrics",
  price: "Price Data",
};

type SymbolSubmitHandler = (event: FormEvent<HTMLElement> | KeyboardEvent, symbolFromChild: string) => void;

// TODO: replace with the graph image the user will provide.
function GraphPlaceholder({ label }: { label: string }) {
  return (
    <div
      role="img"
      aria-label={`${label} graph`}
      className="flex h-80 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-[var(--line-muted)] bg-[var(--surface-soft)] text-center"
    >
      <FileCheck2 className="h-8 w-8 text-[var(--main-dry-sage)]" />
      <p className="text-sm font-medium text-[var(--text-main)]">{label} graph</p>
      <p className="max-w-xs text-xs text-[var(--text-muted)]">Graph image coming soon.</p>
    </div>
  );
}

function DataSection() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState<CategoryKey>("income");

  const handleSearchSubmit: SymbolSubmitHandler = (event, symbolFromChild) => {
    event.preventDefault();
    const nextSymbol = symbolFromChild.trim();
    if (!nextSymbol) {
      return;
    }
    navigate(`/overview/${encodeURIComponent(nextSymbol)}`);
  };

  return (
    <section id="features" className="space-y-6">
      <div className="space-y-3">
        <h2 className="text-3xl font-bold md:text-4xl">Data you can trust</h2>
        <p className="max-w-2xl text-[var(--text-muted)] md:text-lg">
          Institutional-grade financials with the receipts. Hover any value to see its XBRL tag, filing, and period.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left rail — interactive category tabs */}
        <div role="tablist" aria-label="Financial data categories" className="space-y-2 lg:col-span-4">
          {categories.map((category) => {
            const Icon = category.icon;
            const isActive = activeCategory === category.key;
            return (
              <button
                key={category.key}
                type="button"
                role="tab"
                id={`data-tab-${category.key}`}
                aria-selected={isActive}
                aria-controls="data-panel"
                onClick={() => setActiveCategory(category.key)}
                className={cn(
                  "flex w-full items-start gap-3 rounded-xl border-l-4 px-4 py-3 text-left transition-colors",
                  isActive
                    ? "border-[var(--main-fern)] bg-[var(--surface-soft)]"
                    : "border-transparent hover:border-[var(--line-muted)] hover:bg-[var(--surface-soft)]",
                )}
              >
                <Icon className={cn("mt-0.5 h-5 w-5 shrink-0", isActive ? "text-[var(--main-dry-sage)]" : "text-[var(--text-muted)]")} />
                <span>
                  <span className={cn("block font-semibold", isActive ? "text-[var(--text-main)]" : "text-[var(--text-muted)]")}>
                    {category.title}
                  </span>
                  <span className="block text-sm text-[var(--text-muted)]">{category.subtitle}</span>
                </span>
              </button>
            );
          })}
        </div>

        {/* Right card */}
        <Card className="bg-white/5 backdrop-blur-md lg:col-span-8">
          <CardContent
            role="tabpanel"
            id="data-panel"
            aria-labelledby={`data-tab-${activeCategory}`}
            className="space-y-4 p-5 md:p-6"
          >
            <SymbolSearch
              className="w-full"
              inputClassName="h-12 text-base"
              label="Ticker"
              placeholder="Search any ticker"
              handleSearchSubmit={handleSearchSubmit}
            />

            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-lg font-semibold text-[var(--text-main)]">{CARD_TITLE[activeCategory]}</h3>
              {activeCategory === "income" ? (
                <Badge variant="outline" className="gap-1.5">
                  <FileCheck2 className="h-3.5 w-3.5" />
                  Source: SEC Filings
                </Badge>
              ) : null}
            </div>

            <GraphPlaceholder label={CARD_TITLE[activeCategory]} />
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

export default DataSection;
