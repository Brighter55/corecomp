import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import TimeRanges from "./TimeRanges.jsx";
import Explanation from "./Explanation.jsx";
import { useStockHeader } from "../StockHeaderContext.jsx";


function GraphTitle({ title, explanation, percentChange, timeRange, setTimeRange, graphClicked, setGraphClicked }) {
    const { symbol, logoUrl } = useStockHeader();
    const [logoFailed, setLogoFailed] = useState(false);

    useEffect(() => {
        setLogoFailed(false);
    }, [logoUrl]);

    const symbolText = useMemo(() => {
        if (!symbol) return "N/A";
        return symbol.toUpperCase();
    }, [symbol]);

    const symbolChip = useMemo(() => {
        const clean = symbolText.replace(/[^A-Z0-9]/g, "");
        return clean.slice(0, 2) || "NA";
    }, [symbolText]);

    const percentText = (percentChange === null || isNaN(percentChange))
        ? "N/A"
        : (percentChange >= 0 ? `+${percentChange}%` : `${percentChange}%`);

    const percentColor = (percentChange === null || isNaN(percentChange))
        ? "#666"
        : (percentChange >= 0 ? "#588157" : "#bc4749");

    return (
        <div className="flex flex-wrap items-center gap-3 px-2 pt-2 sm:flex-nowrap">
            <div className="flex min-w-[8.5rem] items-center gap-2 sm:min-w-[10.5rem]">
                {logoUrl && !logoFailed ? (
                    <img
                        src={logoUrl}
                        alt={`${symbolText} logo`}
                        className="h-9 w-9 rounded-full border border-[var(--line-muted)] object-cover"
                        onError={() => setLogoFailed(true)}
                    />
                ) : (
                    <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--line-muted)] bg-[rgba(218,215,205,0.16)] text-xs font-semibold text-[var(--main-pine-teal)]">
                        {symbolChip}
                    </div>
                )}
                <p className="text-sm font-semibold tracking-[0.08em] text-[var(--text-main)]">
                    {symbolText}
                </p>
            </div>

            <div className="flex min-w-0 flex-1 items-center justify-center gap-2 text-center">
                <h3 className="text-lg font-semibold text-[var(--text-main)]">{title}</h3>
                <Explanation explanation={explanation} />
            </div>

            <div className="ml-auto flex items-center gap-2">
                <p className="text-lg font-semibold" style={{ color: percentColor }}>
                    {percentText}
                </p>
                <TimeRanges timeRange={timeRange} setTimeRange={setTimeRange} />
                {graphClicked && (
                    <button
                        type="button"
                        aria-label="Close graph"
                        onClick={() => setGraphClicked(false)}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-full text-[var(--text-main)] transition-colors hover:bg-[var(--main-brick)]"
                    >
                        <X className="h-5 w-5" />
                    </button>
                )}
            </div>
        </div>
    );
}



export default GraphTitle;
