import TickerBadge from "../../shared/TickerBadge.jsx";
import { cn } from "../../lib/utils.ts";

// The feed carries no ranking, so the estimate is the only extra field and it
// rides in the native tooltip rather than a card of its own.
function tileTooltip(tile) {
    const parts = [];

    if (tile.name) {
        parts.push(tile.name);
    }

    if (tile.estimate !== null && tile.estimate !== undefined) {
        parts.push(`Est. EPS ${tile.estimate}`);
    }

    return parts.length > 0 ? parts.join(" · ") : undefined;
}

function EarningsTile({ tile, size = 40 }) {
    return (
        <div
            data-testid="earnings-tile"
            title={tileTooltip(tile)}
            className="flex min-w-0 flex-col items-center gap-1"
        >
            <TickerBadge symbol={tile.symbol} size={size} />
            <span
                className={cn(
                    "w-full truncate text-center font-semibold uppercase text-[var(--text-main)]",
                    size >= 40 ? "text-xs" : "text-[9px]",
                )}
            >
                {tile.symbol}
            </span>
        </div>
    );
}

export default EarningsTile;
