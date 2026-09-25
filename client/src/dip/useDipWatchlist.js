import { useCallback, useEffect, useState } from "react";
import { DEFAULT_WATCHLIST } from "./dipChartHelpers.js";

// Mirrors the corecomp_anonymous_session_id pattern in helpers/api.js: the
// watchlist is per-browser, not per-account, so it survives reloads and works
// for a signed-out visitor who has not spent any quota yet.
const STORAGE_KEY = "corecomp_dip_watchlist";

function readStoredWatchlist() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);

        if (!raw) {
            return DEFAULT_WATCHLIST;
        }

        const parsed = JSON.parse(raw);

        if (!Array.isArray(parsed)) {
            return DEFAULT_WATCHLIST;
        }

        return parsed.filter((symbol) => typeof symbol === "string" && symbol);
    } catch {
        // Unreadable store (private mode, corrupted value): fall back to empty
        // rather than breaking the page.
        return DEFAULT_WATCHLIST;
    }
}

function writeStoredWatchlist(symbols) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(symbols));
    } catch {
        // Blocked or full: the watchlist still works for this session.
    }
}

export function useDipWatchlist() {
    const [symbols, setSymbols] = useState(readStoredWatchlist);

    useEffect(() => {
        writeStoredWatchlist(symbols);
    }, [symbols]);

    const add = useCallback((symbol) => {
        setSymbols((previous) =>
            previous.includes(symbol) ? previous : [...previous, symbol],
        );
    }, []);

    const remove = useCallback((symbol) => {
        setSymbols((previous) => previous.filter((item) => item !== symbol));
    }, []);

    return { symbols, add, remove };
}
