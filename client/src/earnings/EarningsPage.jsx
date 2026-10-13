import { useEffect, useMemo, useRef, useState } from "react";
import ProductHeader from "../headers/product-header/ProductHeader.jsx";
import Footer from "../shared/Footer.tsx";
import { authenticatedClient } from "../helpers/api.js";
import EarningsToolbar from "./components/EarningsToolbar.jsx";
import WeeklyBoard from "./components/WeeklyBoard.jsx";
import MonthlyGrid from "./components/MonthlyGrid.jsx";
import { applyFilter } from "./earningsFilter.js";
import {
    addDays,
    daysByDate,
    monthLabel,
    monthlyWindow,
    shiftMonths,
    todayIso,
    weekdayCells,
    weeklyLabel,
    weeklyWindow,
} from "./earningsWindow.js";

const UNAVAILABLE_MESSAGE = "Earnings data is unavailable right now. Try again in a moment.";

function EarningsPage() {
    const [view, setView] = useState("weekly");
    // Client-side only: the filter narrows the tiles already fetched, so it is
    // deliberately absent from the fetch effect's dependencies below.
    const [filter, setFilter] = useState("all");
    // Any date inside the shown window: the week's Monday comes from it in the
    // weekly view, the month from it in the monthly view.
    const [anchor, setAnchor] = useState(todayIso);
    const [data, setData] = useState(null);
    // Starts true: the first paint happens before the fetch effect runs, and a
    // false start would flash the empty state ahead of the skeleton.
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const requestRef = useRef(0);

    const activeWindow = useMemo(
        () => (view === "monthly" ? monthlyWindow(anchor) : weeklyWindow(anchor)),
        [view, anchor],
    );

    useEffect(() => {
        // Monotonic request counter, as DipPage uses: a response older than the
        // latest request is discarded rather than written to state.
        const requestId = requestRef.current + 1;
        requestRef.current = requestId;
        setLoading(true);
        setError(null);

        (async () => {
            try {
                // Always a payload, so this posts with X-Anonymous-Session and
                // credentials. Not the retry helper: its 403 branch navigates
                // away, which is wrong for a calendar the visitor can page.
                const response = await authenticatedClient({
                    endpoint: "/pages/earnings-calendar",
                    payload: { start: activeWindow.start, days: activeWindow.days },
                });

                const body = await response.json().catch(() => null);

                if (requestRef.current !== requestId) {
                    return;
                }

                if (!response.ok) {
                    setData(null);
                    setError(UNAVAILABLE_MESSAGE);
                    return;
                }

                setData(body);
            } catch {
                if (requestRef.current === requestId) {
                    setData(null);
                    setError(UNAVAILABLE_MESSAGE);
                }
            } finally {
                if (requestRef.current === requestId) {
                    setLoading(false);
                }
            }
        })();
    }, [activeWindow.start, activeWindow.days]);

    // Filtered once, here, so both boards see the same set: the weekly board's
    // emptied groups vanish and the monthly grid's cap and overflow count the
    // filtered tiles without either board holding a second copy of the rules.
    const visibleDays = useMemo(() => applyFilter(data?.days, filter), [data, filter]);
    const lookup = useMemo(() => daysByDate(visibleDays), [visibleDays]);
    const cells = useMemo(
        () => weekdayCells(activeWindow.start, activeWindow.days),
        [activeWindow.start, activeWindow.days],
    );
    const label = view === "monthly" ? monthLabel(anchor) : weeklyLabel(activeWindow);

    function handlePrev() {
        setAnchor((current) => (view === "monthly" ? shiftMonths(current, -1) : addDays(current, -7)));
    }

    function handleNext() {
        setAnchor((current) => (view === "monthly" ? shiftMonths(current, 1) : addDays(current, 7)));
    }

    function renderBody() {
        if (loading) {
            return (
                <div data-testid="earnings-loading" className="grid grid-cols-1 gap-4 md:grid-cols-5">
                    {Array.from({ length: 5 }).map((_, index) => (
                        <div
                            key={index}
                            className="h-72 animate-pulse rounded-2xl bg-[rgba(163,177,138,0.25)]"
                        />
                    ))}
                </div>
            );
        }

        if (error) {
            return (
                <p
                    role="alert"
                    className="rounded-2xl border border-[var(--line-muted)] bg-[var(--surface-soft)] px-5 py-4 text-sm text-[var(--main-dry-sage)]"
                >
                    {error}
                </p>
            );
        }

        if ((data?.days?.length ?? 0) === 0) {
            return (
                <p data-testid="earnings-empty" className="text-sm text-[var(--text-muted)]">
                    No earnings scheduled in this window.
                </p>
            );
        }

        if (visibleDays.length === 0) {
            return (
                <p data-testid="earnings-filter-empty" className="text-sm text-[var(--text-muted)]">
                    No stocks match this filter.
                </p>
            );
        }

        return view === "monthly" ? (
            <MonthlyGrid cells={cells} daysByDate={lookup} monthAnchor={anchor} />
        ) : (
            <WeeklyBoard cells={cells} daysByDate={lookup} />
        );
    }

    return (
        <div className="min-h-screen pb-10">
            <ProductHeader />

            <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-6">
                <main className="space-y-8">
                    <h1 className="text-center font-serif text-4xl font-bold tracking-tight text-[var(--text-main)] sm:text-5xl">
                        Earnings Calendar
                    </h1>

                    <EarningsToolbar
                        view={view}
                        onViewChange={setView}
                        filter={filter}
                        onFilterChange={setFilter}
                        label={label}
                        onPrev={handlePrev}
                        onNext={handleNext}
                    />

                    {!loading && data?.asOf ? (
                        <p className="text-center text-xs text-[var(--text-muted)]">
                            Updated as of {data.asOf}
                        </p>
                    ) : null}

                    {renderBody()}
                </main>

                {/* Footer carries its own spacing but no top gap. */}
                <div className="mt-16">
                    <Footer />
                </div>
            </div>
        </div>
    );
}

export default EarningsPage;
