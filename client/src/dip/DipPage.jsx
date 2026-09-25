import { useEffect, useMemo, useRef, useState } from "react";
import { X } from "lucide-react";
import ProductHeader from "../headers/product-header/ProductHeader.jsx";
import GraphCard from "../overview/components/GraphCard.jsx";
import { cn } from "../lib/utils.ts";
import { authenticatedClient } from "../helpers/api.js";
import DipColumnChart from "./components/DipColumnChart.jsx";
import WatchlistSidebar from "./components/WatchlistSidebar.jsx";
import { useDipWatchlist } from "./useDipWatchlist.js";
import {
    DEFAULT_SMA_WINDOW,
    SMA_WINDOWS,
    buildDipRows,
    buildSymbolEntries,
    buildVarianceByWindow,
} from "./dipChartHelpers.js";

const QUOTA_MESSAGE =
    "You've used all 5 free symbols for this month. Sign in for unlimited access.";
const UNAVAILABLE_MESSAGE = "Dip data is unavailable right now. Try again in a moment.";

function DipPage() {
    const [smaWindow, setSmaWindow] = useState(DEFAULT_SMA_WINDOW);
    const { symbols: watchlistSymbols, add, remove } = useDipWatchlist();
    const [selectedSymbol, setSelectedSymbol] = useState(null);
    const [expanded, setExpanded] = useState(false);
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const requestRef = useRef(0);

    useEffect(() => {
        // An empty watchlist short-circuits without a request, so a visitor who
        // has added nothing spends none of their 5 free symbols.
        if (watchlistSymbols.length === 0) {
            requestRef.current += 1;
            setResults([]);
            setLoading(false);
            setError(null);
            return;
        }

        const requestId = requestRef.current + 1;
        requestRef.current = requestId;
        setLoading(true);
        setError(null);

        (async () => {
            try {
                // Deliberately authenticatedClient, not authenticatedClientWithRetry:
                // the retry helper sleeps 60s on a 503 and recurses, and its 403
                // branch navigates away from the page mid-interaction.
                const response = await authenticatedClient({
                    endpoint: "/pages/dip",
                    payload: { symbols: watchlistSymbols },
                });

                const data = await response.json().catch(() => null);

                if (requestRef.current !== requestId) {
                    return;
                }

                if (!response.ok) {
                    const detail = data && typeof data === "object" ? data.detail : null;
                    setResults([]);
                    setError(detail === "quota_exceeded" ? QUOTA_MESSAGE : UNAVAILABLE_MESSAGE);
                    return;
                }

                setResults(Array.isArray(data?.results) ? data.results : []);
            } catch {
                if (requestRef.current === requestId) {
                    setResults([]);
                    setError(UNAVAILABLE_MESSAGE);
                }
            } finally {
                if (requestRef.current === requestId) {
                    setLoading(false);
                }
            }
        })();
    }, [watchlistSymbols]);

    const entriesBySymbol = useMemo(
        () => new Map(buildSymbolEntries(results).map((entry) => [entry.symbol, entry])),
        [results],
    );

    // Driven by the watchlist, not by the response, so a ticker still shows (and
    // can still be removed) while the request is in flight or after it failed.
    const watchlist = useMemo(
        () =>
            watchlistSymbols.map(
                (symbol) => entriesBySymbol.get(symbol) ?? { symbol, name: symbol },
            ),
        [watchlistSymbols, entriesBySymbol],
    );

    // Recomputing from the already-fetched results is what makes the 50/200
    // toggle free: both windows arrive in one response, so switching never
    // re-meters the visitor.
    const rows = useMemo(
        () => buildDipRows(buildVarianceByWindow(results, smaWindow)),
        [results, smaWindow],
    );

    function handleAdd(symbol) {
        add(symbol);
    }

    function handleRemove(symbol) {
        remove(symbol);
        setSelectedSymbol((previous) => (previous === symbol ? null : previous));
    }

    // Note the states below avoid role="status": the sidebar already uses it for
    // its notices, and two live regions under the same role is ambiguous both for
    // screen readers and for tests querying by role.
    function renderChartBody() {
        if (loading) {
            return (
                <p className="text-sm text-[var(--text-muted)]" data-testid="dip-loading">
                    Loading dip data…
                </p>
            );
        }

        if (error) {
            return (
                <p role="alert" className="text-sm text-[var(--main-dry-sage)]">
                    {error}
                </p>
            );
        }

        if (watchlistSymbols.length === 0) {
            return (
                <p className="text-sm text-[var(--text-muted)]" data-testid="dip-empty">
                    Add a ticker to your watchlist to see how far it has dipped below
                    its moving average.
                </p>
            );
        }

        if (rows.length === 0) {
            return (
                <p className="text-sm text-[var(--text-muted)]" data-testid="dip-empty">
                    No moving-average data for your watchlist yet.
                </p>
            );
        }

        return <DipColumnChart rows={rows} />;
    }

    return (
        <div className="min-h-screen pb-10">
            <ProductHeader />

            <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-6">
                <main className="space-y-8">
                    <h1 className="text-center font-serif text-4xl font-bold tracking-tight text-[var(--text-main)] sm:text-5xl">
                        Dip Finder
                    </h1>

                    <div className="grid gap-6 lg:grid-cols-[18rem_minmax(0,1fr)]">
                        <WatchlistSidebar
                            items={watchlist}
                            selectedSymbol={selectedSymbol}
                            onSelect={setSelectedSymbol}
                            onAdd={handleAdd}
                            onRemove={handleRemove}
                        />

                        {/* No backdrop-blur anywhere above GraphCard: backdrop-filter would
                            become a containing block for its position:fixed fullscreen
                            overlay and break click-to-expand. */}
                        <GraphCard
                            graphClicked={expanded}
                            defaultClassName="h-[26rem] w-full min-w-[21rem] sm:h-[32rem]"
                            className="p-5"
                        >
                            <div className="flex flex-wrap items-start justify-between gap-4">
                                <div>
                                    <h2 className="text-xl font-bold text-[var(--text-main)]">
                                        Price vs {smaWindow}d SMA
                                    </h2>
                                    <p className="text-sm text-[var(--text-muted)]">
                                        Variance from {smaWindow}-day simple moving average
                                    </p>
                                </div>

                                <div className="flex items-center gap-2">
                                    <div
                                        role="radiogroup"
                                        aria-label="Moving average window"
                                        className="flex gap-1 rounded-full bg-[rgba(218,215,205,0.1)] p-1"
                                    >
                                        {SMA_WINDOWS.map((window) => {
                                            const isActive = window.key === smaWindow;

                                            return (
                                                <button
                                                    key={window.key}
                                                    type="button"
                                                    role="radio"
                                                    aria-checked={isActive}
                                                    onClick={() => setSmaWindow(window.key)}
                                                    className={cn(
                                                        "rounded-full px-3 py-1.5 text-xs font-semibold tracking-wide transition",
                                                        isActive
                                                            ? "bg-[var(--main-dry-sage)] text-[var(--bg-main)]"
                                                            : "text-[var(--text-muted)] hover:text-[var(--text-main)]",
                                                    )}
                                                >
                                                    {window.label}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {expanded ? (
                                        <button
                                            type="button"
                                            onClick={() => setExpanded(false)}
                                            aria-label="Close graph"
                                            className="rounded-full p-2 text-[var(--text-muted)] transition hover:bg-[var(--surface-soft)] hover:text-[var(--text-main)]"
                                        >
                                            <X className="h-5 w-5" />
                                        </button>
                                    ) : null}
                                </div>
                            </div>

                            <div
                                className="mt-4 min-h-0 w-full flex-1"
                                data-testid="dip-chart-body"
                                onClick={() => setExpanded(true)}
                            >
                                {renderChartBody()}
                            </div>
                        </GraphCard>
                    </div>
                </main>
            </div>
        </div>
    );
}

export default DipPage;
