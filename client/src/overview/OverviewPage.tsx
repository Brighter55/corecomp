import { type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowUpRight, Newspaper } from "lucide-react";
import ProductHeader from "../headers/product-header/ProductHeader.jsx";
import SymbolSearch from "../shared/SymbolSearch.jsx";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

type SymbolSubmitHandler = (event: FormEvent<HTMLElement> | KeyboardEvent, symbolFromChild: string) => void;

const trendRows = [
  { symbol: "-", label: "Coming up soon...", value: "-", change: "", positive: true },
  { symbol: "-", label: "Coming up soon...", value: "-", change: "", positive: true },
  { symbol: "-", label: "Coming up soon...", value: "-", change: "", positive: true },
  { symbol: "-", label: "Coming up soon...", value: "-", change: "", positive: true },
  { symbol: "-", label: "Coming up soon...", value: "-", change: "", positive: true },
];

const intelligenceRows = [
  {
    title: "Coming up soon...",
    copy: "Coming up soon...",
    meta: "Coming up soon...",
  },
  {
    title: "Coming up soon...",
    copy: "Coming up soon...",
    meta: "Coming up soon...",
  },
  {
    title: "Coming up soon...",
    copy: "Coming up soon...",
    meta: "Coming up soon...",
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

          <section className="space-y-4 pt-20">
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
          </section>
        </main>
      </div>
    </div>
  );
}

export default OverviewPage;
