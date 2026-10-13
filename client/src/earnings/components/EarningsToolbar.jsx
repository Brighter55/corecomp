import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "../../lib/utils.ts";
import EarningsFilter from "./EarningsFilter.jsx";

const VIEWS = [
    { key: "weekly", label: "Weekly" },
    { key: "monthly", label: "Monthly" },
];

// Shared with the filter button, which sits beside the arrows.
export const NAV_BUTTON =
    "flex h-9 w-9 items-center justify-center rounded-full border border-[var(--line-muted)] text-[var(--text-muted)] transition-colors hover:border-[var(--main-dry-sage)] hover:text-[var(--text-main)]";

function EarningsToolbar({ view, onViewChange, filter, onFilterChange, label, onPrev, onNext }) {
    const unit = view === "monthly" ? "month" : "week";

    return (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
                <button type="button" onClick={onPrev} aria-label={`Previous ${unit}`} className={NAV_BUTTON}>
                    <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                </button>

                <h2
                    aria-live="polite"
                    className="min-w-[12rem] text-center text-lg font-bold tracking-tight text-[var(--text-main)]"
                >
                    {label}
                </h2>

                <button type="button" onClick={onNext} aria-label={`Next ${unit}`} className={NAV_BUTTON}>
                    <ChevronRight className="h-4 w-4" aria-hidden="true" />
                </button>
            </div>

            {/* The filter button sits left of the toggle, and this wrapper
                replaces the radiogroup as the toolbar's right-hand child, so
                the toggle stays flush right. */}
            <div className="flex items-center gap-3 self-start sm:self-auto">
                <EarningsFilter value={filter} onChange={onFilterChange} />

                <div
                    role="radiogroup"
                    aria-label="Calendar view"
                    className="flex gap-1 rounded-full bg-[rgba(218,215,205,0.1)] p-1"
                >
                    {VIEWS.map((entry) => {
                        const isActive = entry.key === view;

                        return (
                            <button
                                key={entry.key}
                                type="button"
                                role="radio"
                                aria-checked={isActive}
                                onClick={() => onViewChange(entry.key)}
                                className={cn(
                                    "rounded-full px-4 py-1.5 text-xs font-semibold tracking-wide transition",
                                    isActive
                                        ? "bg-[var(--main-dry-sage)] text-[var(--bg-main)]"
                                        : "text-[var(--text-muted)] hover:text-[var(--text-main)]",
                                )}
                            >
                                {entry.label}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

export default EarningsToolbar;
