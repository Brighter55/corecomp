import EarningsTile from "./EarningsTile.jsx";
import { cn } from "../../lib/utils.ts";
import { dayOfMonth, flattenTiles, isSameMonth, weekdayHeaders } from "../earningsWindow.js";

// A real day can hold hundreds of symbols and the feed carries no signal to
// rank them, so a cell renders the first few and counts the rest. Alphabetical
// is the only honest order and it is the server's to give.
const CELL_LIMIT = 6;

function MonthCell({ iso, day, inMonth }) {
    const tiles = flattenTiles(day);
    const visible = tiles.slice(0, CELL_LIMIT);
    const overflow = tiles.length - visible.length;

    return (
        <div
            data-testid="month-cell"
            data-date={iso}
            className={cn("min-h-[6.5rem] bg-[var(--bg-main)] p-2", !inMonth && "opacity-40")}
        >
            <p className="mb-2 text-xs font-semibold text-[var(--text-muted)]">{dayOfMonth(iso)}</p>

            {tiles.length > 0 ? (
                <>
                    <div className="grid grid-cols-3 gap-2">
                        {visible.map((tile) => (
                            <EarningsTile key={tile.symbol} tile={tile} size={24} />
                        ))}
                    </div>
                    {overflow > 0 ? (
                        <p
                            data-testid="month-overflow"
                            className="mt-2 text-[11px] font-semibold text-[var(--main-dry-sage)]"
                        >
                            +{overflow} more
                        </p>
                    ) : null}
                </>
            ) : null}
        </div>
    );
}

function MonthlyGrid({ cells, daysByDate, monthAnchor }) {
    return (
        <div className="overflow-hidden rounded-2xl border border-[var(--line-muted)]">
            {/* gap-px over a line-coloured background draws the hairline grid. */}
            <div className="grid grid-cols-5 gap-px bg-[var(--line-muted)]">
                {weekdayHeaders().map((label) => (
                    <div
                        key={label}
                        className="bg-[var(--bg-main)] py-2 text-center text-xs font-bold uppercase tracking-wide text-[var(--text-muted)]"
                    >
                        {label}
                    </div>
                ))}
                {cells.map((iso) => (
                    <MonthCell
                        key={iso}
                        iso={iso}
                        day={daysByDate.get(iso)}
                        inMonth={isSameMonth(iso, monthAnchor)}
                    />
                ))}
            </div>
        </div>
    );
}

export default MonthlyGrid;
