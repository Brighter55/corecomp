import { type FormEvent, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProductHeader from "../headers/product-header/ProductHeader.jsx";
import SymbolSearch from "../shared/SymbolSearch.jsx";
import SectionHeader from "./components/SectionHeader.tsx";
import Sparkline from "./components/Sparkline.tsx";
import useMoverPageSize from "./useMoverPageSize.ts";
import { authenticatedClient } from "../helpers/api.js";
import { formatToUnits } from "../helpers/GraphsHelper.js";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type SymbolSubmitHandler = (event: FormEvent<HTMLElement> | KeyboardEvent, symbolFromChild: string) => void;

/** One ranked mover, as `/pages/trending` returns it. */
type Mover = {
  symbol: string;
  name: string | null;
  price: number;
  percentChange: number;
  volume: number | null;
  marketCap: number | null;
  spark: number[];
};

function formatPercent(value: number) {
  // The sign is part of the display, not the number: "+1.44%" / "-2.45%".
  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
}

function formatPrice(value: number) {
  // A share price is money to the cent. formatToUnits rounds only on its tier
  // path, so below $1M it passes a raw float -- live data renders "$339.17999".
  return `$${value.toFixed(2)}`;
}

function OverviewPage() {
  const navigate = useNavigate();

  // null means "still loading" -- distinct from [] which means "loaded, but the
  // ranking came back empty".
  const [movers, setMovers] = useState<Mover[] | null>(null);
  const [trendingError, setTrendingError] = useState(false);
  const pageSize = useMoverPageSize();
  // The index of the first card on screen, not a page number. A resize changes
  // how many cards a page holds, and a page number would then point at
  // different cards -- narrowing the window would teleport the reader somewhere
  // unrelated. Anchoring on the first visible card keeps it in view.
  const [startIndex, setStartIndex] = useState(0);
  // Monotonic request counter, as DipPage uses: any in-flight response older
  // than the latest request is discarded rather than written to state.
  const requestRef = useRef(0);

  useEffect(() => {
    const requestId = requestRef.current + 1;
    requestRef.current = requestId;
    let isActive = true;

    const isStale = () => !isActive || requestRef.current !== requestId;

    const fetchMovers = async () => {
      try {
        // `payload` is required to make this a POST -- authenticatedClient
        // sends a GET without one, and the view only accepts POST. Not the
        // retry helper: its 403 branch navigates to /login, which is wrong for
        // a landing page.
        const response = await authenticatedClient({
          endpoint: "/pages/trending",
          payload: {},
        });
        if (isStale()) return;

        if (!response.ok) {
          setTrendingError(true);
          return;
        }

        const body = await response.json();
        if (isStale()) return;

        setMovers(body?.movers ?? []);
        setStartIndex(0);
      } catch {
        if (isStale()) return;
        setTrendingError(true);
      }
    };

    fetchMovers();
    return () => {
      isActive = false;
    };
  }, []);

  const handleSearchSubmit: SymbolSubmitHandler = (event, symbolFromChild) => {
    event.preventDefault();
    const nextSymbol = symbolFromChild.trim();
    if (!nextSymbol) {
      return;
    }
    navigate(`/overview/${encodeURIComponent(nextSymbol)}`);
  };

  const isLoading = movers === null && !trendingError;
  const hasMovers = (movers?.length ?? 0) > 0;

  const total = movers?.length ?? 0;
  // The furthest start that still fills a page. Zero when the list is shorter
  // than one page, which is what makes both arrows disable on a short list.
  const maxStart = Math.max(0, total - pageSize);
  // Clamp rather than trust `startIndex`: widening the viewport raises the page
  // size and can push the last full page past the end of the list. Without this
  // the grid renders empty after a resize.
  const safeStart = Math.min(startIndex, maxStart);
  const visibleMovers = (movers ?? []).slice(safeStart, safeStart + pageSize);
  const canGoBack = safeStart > 0;
  const canGoForward = safeStart < maxStart;
  // An empty ranking hides the section outright -- an empty grid reads as
  // broken. Loading and error keep it, so the page does not jump.
  const showTrending = isLoading || trendingError || hasMovers;

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

          {showTrending && (
            <section className="space-y-6">
              <SectionHeader
                title="Today's movers"
                actions={
                  <>
                    <button
                      type="button"
                      aria-label="Previous trending stocks"
                      onClick={() => setStartIndex(Math.max(0, safeStart - pageSize))}
                      disabled={!canGoBack}
                      className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--line-muted)] text-[var(--text-muted)] transition-colors hover:border-[var(--main-dry-sage)] hover:text-[var(--text-main)] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-[var(--line-muted)] disabled:hover:text-[var(--text-muted)]"
                    >
                      <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      aria-label="Next trending stocks"
                      onClick={() => setStartIndex(Math.min(maxStart, safeStart + pageSize))}
                      disabled={!canGoForward}
                      className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--line-muted)] text-[var(--text-muted)] transition-colors hover:border-[var(--main-dry-sage)] hover:text-[var(--text-main)] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-[var(--line-muted)] disabled:hover:text-[var(--text-muted)]"
                    >
                      <ChevronRight className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </>
                }
              />

              {trendingError ? (
                <p
                  role="alert"
                  className="rounded-2xl border border-[var(--line-muted)] bg-[var(--surface-soft)] px-5 py-4 text-sm text-[var(--text-muted)]"
                >
                  Movers are unavailable right now. Try again in a little while.
                </p>
              ) : isLoading ? (
                <div
                  data-testid="trending-loading"
                  className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4"
                >
                  {Array.from({ length: pageSize }).map((_, index) => (
                    <div
                      key={index}
                      className="h-40 animate-pulse rounded-2xl bg-[rgba(163,177,138,0.25)]"
                    />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                  {visibleMovers.map((mover) => (
                    <article
                      key={mover.symbol}
                      className="flex flex-col justify-between rounded-2xl border border-[var(--line-muted)] bg-[var(--surface-soft)] p-5 backdrop-blur-md transition-colors hover:border-[var(--main-dry-sage)]"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-lg font-bold tracking-tight text-[var(--text-main)]">
                            {mover.symbol}
                          </span>
                          <span
                            className={`rounded px-2 py-0.5 text-[11px] font-bold ${
                              mover.percentChange >= 0
                                ? "text-[var(--change-up)]"
                                : "text-[var(--change-down)]"
                            } bg-[var(--surface-soft)]`}
                          >
                            {formatPercent(mover.percentChange)}
                          </span>
                        </div>
                        <p className="text-xs font-medium text-[var(--text-muted)]">{mover.name}</p>
                        <div className="flex items-end justify-between gap-3">
                          <div>
                            <p className="text-2xl font-bold text-[var(--text-main)]">
                              {formatPrice(mover.price)}
                            </p>
                            <p className="text-[11px] text-[var(--text-muted)]">
                              Vol: {formatToUnits(mover.volume, { prefix: "" })} • Cap:{" "}
                              {formatToUnits(mover.marketCap)}
                            </p>
                          </div>
                          <Sparkline
                            points={mover.spark}
                            positive={mover.percentChange >= 0}
                          />
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          )}
        </main>
      </div>
    </div>
  );
}

export default OverviewPage;
