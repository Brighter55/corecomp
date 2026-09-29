import { useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { cn } from "../../lib/utils.ts";
import { authenticatedClient } from "../../helpers/api.js";
import { companyLogoUrl } from "../../shared/companyLogoUrl.js";
import { filterSymbols, findSymbolEntry } from "../dipChartHelpers.js";

const DEBOUNCE_MS = 300;

// The symbol-search endpoint returns DB rows, but a live row is still normalised
// here so that filterSymbols and the two render sites can rely on a real string.
function normalizeSuggestion(entry) {
    if (!entry || typeof entry !== "object") {
        return null;
    }

    const symbol = typeof entry.symbol === "string" ? entry.symbol.trim().toUpperCase() : "";

    if (!symbol) {
        return null;
    }

    return { symbol, name: String(entry.name ?? symbol) };
}

function TickerBadge({ symbol }) {
    const [logoFailed, setLogoFailed] = useState(false);

    // Rows are keyed by symbol, so a recycled badge must clear a previous failure.
    useEffect(() => {
        setLogoFailed(false);
    }, [symbol]);

    const logoUrl = companyLogoUrl(symbol, 80);

    if (logoUrl && !logoFailed) {
        return (
            <img
                src={logoUrl}
                // The ticker is spelled out right next to this, so describing the
                // image would only make a screen reader say the symbol twice.
                alt=""
                onError={() => setLogoFailed(true)}
                className="h-10 w-10 shrink-0 rounded-full bg-[rgba(218,215,205,0.15)] object-cover"
            />
        );
    }

    return (
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[rgba(218,215,205,0.15)] text-[10px] font-semibold tracking-wide text-[var(--text-main)]">
            {symbol}
        </span>
    );
}

function WatchlistSidebar({ items, selectedSymbol, onSelect, onAdd, onRemove }) {
    const [query, setQuery] = useState("");
    const [notice, setNotice] = useState(null);
    const [suggestions, setSuggestions] = useState([]);

    // Same debounce + sequence-guard shape as shared/SymbolSearch.jsx: the
    // requestId check stops a slow early response from overwriting a later one.
    const debounceRef = useRef(null);
    const requestRef = useRef(0);

    useEffect(() => {
        const trimmed = query.trim();

        if (!trimmed) {
            requestRef.current += 1;
            setSuggestions([]);
            return undefined;
        }

        const requestId = requestRef.current + 1;
        requestRef.current = requestId;

        debounceRef.current = window.setTimeout(async () => {
            try {
                // AllowAny on the server, so typing costs no quota.
                const response = await authenticatedClient({
                    endpoint: "/pages/symbol-search",
                    payload: { symbol: trimmed },
                });

                const data = await response.json();

                if (requestRef.current !== requestId) {
                    return;
                }

                if (!response.ok) {
                    setSuggestions([]);
                    return;
                }

                setSuggestions(
                    Array.isArray(data) ? data.map(normalizeSuggestion).filter(Boolean) : [],
                );
            } catch {
                if (requestRef.current === requestId) {
                    setSuggestions([]);
                }
            }
        }, DEBOUNCE_MS);

        return () => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
        };
    }, [query]);

    const held = items.map((item) => item.symbol);
    const matches = filterSymbols(suggestions, query, held);

    function commit(rawSymbol) {
        const entry = findSymbolEntry(suggestions, rawSymbol);

        if (!entry) {
            setNotice(`No match for "${rawSymbol.trim().toUpperCase()}" in our symbol list`);
            return;
        }

        if (held.includes(entry.symbol)) {
            setNotice(`${entry.symbol} is already in your watchlist`);
            return;
        }

        onAdd(entry.symbol);
        setQuery("");
        setNotice(null);
    }

    function handleKeyDown(event) {
        if (event.key === "Enter") {
            event.preventDefault();
            // Prefer the first suggestion so Enter behaves like the dropdown,
            // and fall back to the raw text so the notice still fires on a miss.
            commit(matches.length > 0 ? matches[0].symbol : query);
            return;
        }

        if (event.key === "Escape") {
            setQuery("");
            setNotice(null);
        }
    }

    return (
        <aside className="flex w-full shrink-0 flex-col gap-6 rounded-3xl bg-[rgba(218,215,205,0.06)] p-5 lg:w-72">
            <div>
                {/* The icon is positioned against this wrapper, so it must contain
                    the input and nothing else. The results list and notice are
                    siblings below it — inside the same box they would grow it and
                    drag `top-1/2` down into the rows. */}
                <div className="relative">
                    <label htmlFor="dip-ticker-search" className="sr-only">
                        Search ticker
                    </label>
                    <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
                    <input
                        id="dip-ticker-search"
                        type="text"
                        value={query}
                        onChange={(event) => {
                            setQuery(event.target.value);
                            setNotice(null);
                        }}
                        onKeyDown={handleKeyDown}
                        placeholder="Search Ticker..."
                        aria-label="Search ticker"
                        autoComplete="off"
                        className="h-12 w-full rounded-full border border-transparent bg-[rgba(218,215,205,0.12)] pl-11 pr-4 text-sm text-[var(--text-main)] outline-none transition placeholder:text-[var(--text-muted)] focus:border-[var(--main-fern)]"
                    />
                </div>

                {query.trim() ? (
                    <ul
                        role="listbox"
                        aria-label="Ticker suggestions"
                        className="mt-2 max-h-56 overflow-auto rounded-2xl bg-[var(--bg-main)] p-1 no-scrollbar"
                    >
                        {matches.map((entry) => (
                            <li key={entry.symbol}>
                                <button
                                    type="button"
                                    role="option"
                                    aria-selected={false}
                                    onClick={() => commit(entry.symbol)}
                                    className="w-full rounded-xl px-3 py-2 text-left transition hover:bg-[var(--surface-soft)]"
                                >
                                    <span className="block text-sm font-semibold text-[var(--text-main)]">
                                        {entry.symbol}
                                    </span>
                                    <span className="block truncate text-xs text-[var(--text-muted)]">
                                        {entry.name}
                                    </span>
                                </button>
                            </li>
                        ))}
                        {matches.length === 0 ? (
                            <li className="px-3 py-2 text-xs text-[var(--text-muted)]">
                                No matching symbols.
                            </li>
                        ) : null}
                    </ul>
                ) : null}

                {notice ? (
                    <p role="status" className="mt-2 px-1 text-xs text-[var(--main-dry-sage)]">
                        {notice}
                    </p>
                ) : null}
            </div>

            {items.length > 0 ? (
                <ul className="flex flex-col gap-1">
                    {items.map((item) => {
                        const isSelected = item.symbol === selectedSymbol;

                        return (
                            <li key={item.symbol}>
                                <div
                                    className={cn(
                                        "group flex items-center gap-3 rounded-full py-2 pl-2 pr-3 transition",
                                        isSelected
                                            ? "bg-[rgba(218,215,205,0.16)]"
                                            : "hover:bg-[var(--surface-soft)]",
                                    )}
                                >
                                    <button
                                        type="button"
                                        onClick={() => onSelect(item.symbol)}
                                        aria-current={isSelected ? "true" : undefined}
                                        className="flex min-w-0 flex-1 items-center gap-3 text-left"
                                    >
                                        <TickerBadge symbol={item.symbol} />
                                        <span className="min-w-0">
                                            <span className="block text-sm font-bold uppercase text-[var(--text-main)]">
                                                {item.symbol}
                                            </span>
                                            <span className="block truncate text-xs text-[var(--text-muted)]">
                                                {item.name}
                                            </span>
                                        </span>
                                    </button>

                                    {/* Always visible: the design reveals this on hover, which
                                        is unusable on touch and unreachable in tests. */}
                                    <button
                                        type="button"
                                        onClick={() => onRemove(item.symbol)}
                                        aria-label={`Remove ${item.symbol} from watchlist`}
                                        className="shrink-0 rounded-full p-1 text-[var(--text-muted)] transition hover:bg-[var(--surface-soft)] hover:text-[var(--text-main)]"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            ) : (
                <p className="px-1 text-xs text-[var(--text-muted)]">
                    Your watchlist is empty. Search above to add a ticker.
                </p>
            )}
        </aside>
    );
}

export default WatchlistSidebar;
