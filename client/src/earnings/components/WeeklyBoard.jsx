import EarningsTile from "./EarningsTile.jsx";
import { dayLabel } from "../earningsWindow.js";

// The server sends only these three values and in this order, so a heading is
// chosen by value while the groups themselves keep the array's order. An
// unknown value degrades to its raw name rather than vanishing.
const SESSION_LABELS = {
    before_open: "Before Open",
    after_close: "After Close",
    unannounced: "Unannounced",
};

function WeeklyBoard({ cells, daysByDate }) {
    return (
        <div data-testid="weekly-board" className="grid grid-cols-1 gap-4 md:grid-cols-5">
            {cells.map((iso) => {
                const sessions = daysByDate.get(iso)?.sessions ?? [];

                return (
                    <section
                        key={iso}
                        aria-label={dayLabel(iso)}
                        className="rounded-2xl border border-[var(--line-muted)] bg-[var(--surface-soft)] p-4"
                    >
                        <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-[var(--text-main)]">
                            {dayLabel(iso)}
                        </h3>

                        {sessions.length === 0 ? (
                            <p className="text-xs text-[var(--text-muted)]">No earnings</p>
                        ) : (
                            <div className="space-y-4">
                                {/* Array order is display order; the server owns it. */}
                                {sessions.map((group) => (
                                    <div key={group.session}>
                                        <h4 className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                                            {SESSION_LABELS[group.session] ?? group.session}
                                        </h4>
                                        <div className="grid grid-cols-2 gap-3">
                                            {group.tiles.map((tile) => (
                                                <EarningsTile key={tile.symbol} tile={tile} />
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                );
            })}
        </div>
    );
}

export default WeeklyBoard;
