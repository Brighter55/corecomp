import { useMemo, useState } from "react";
import { X } from "lucide-react";
import ProductHeader from "../headers/product-header/ProductHeader.jsx";
import GraphCard from "../overview/components/GraphCard.jsx";
import { cn } from "../lib/utils.ts";
import DipColumnChart from "./components/DipColumnChart.jsx";
import WatchlistSidebar from "./components/WatchlistSidebar.jsx";
import { DEFAULT_SMA_WINDOW, SMA_WINDOWS, buildDipRows } from "./dipChartHelpers.js";
import sampleData from "./sample-data/dipSampleData.json";

function DipPage() {
    const [smaWindow, setSmaWindow] = useState(DEFAULT_SMA_WINDOW);
    const [watchlistSymbols, setWatchlistSymbols] = useState(() => [...sampleData.watchlist]);
    const [selectedSymbol, setSelectedSymbol] = useState(null);
    const [expanded, setExpanded] = useState(false);

    const entriesBySymbol = useMemo(
        () => new Map(sampleData.symbols.map((entry) => [entry.symbol, entry])),
        [],
    );

    const watchlist = useMemo(
        () =>
            watchlistSymbols
                .map((symbol) => entriesBySymbol.get(symbol))
                .filter(Boolean),
        [watchlistSymbols, entriesBySymbol],
    );

    const rows = useMemo(
        () => buildDipRows(sampleData.variance[smaWindow]),
        [smaWindow],
    );

    function handleAdd(symbol) {
        setWatchlistSymbols((previous) =>
            previous.includes(symbol) ? previous : [...previous, symbol],
        );
    }

    function handleRemove(symbol) {
        setWatchlistSymbols((previous) => previous.filter((item) => item !== symbol));
        setSelectedSymbol((previous) => (previous === symbol ? null : previous));
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
                            symbols={sampleData.symbols}
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
                                <DipColumnChart rows={rows} />
                            </div>
                        </GraphCard>
                    </div>
                </main>
            </div>
        </div>
    );
}

export default DipPage;
