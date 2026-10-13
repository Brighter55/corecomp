import { useState } from "react";
import { Filter } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "../../components/ui/popover";
import { cn } from "../../lib/utils.ts";
import { NAV_BUTTON } from "./buttonStyles.js";
import { FILTERS } from "../earningsFilter.js";

// The filter button and its popup. It reuses NAV_BUTTON so it reads as a
// sibling of the week arrows, and the popup mirrors the view toggle's radio
// pattern rather than pulling in a second radio implementation.
function EarningsFilter({ value, onChange }) {
    const [open, setOpen] = useState(false);
    const isActive = value !== "all";

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <button
                    type="button"
                    aria-label="Filter stocks"
                    // Filled while a filter is on, so the active state is visible
                    // after the popup closes, not only while it is open.
                    className={cn(
                        NAV_BUTTON,
                        isActive &&
                            "border-[var(--main-dry-sage)] bg-[var(--main-dry-sage)] text-[var(--bg-main)]",
                    )}
                >
                    <Filter className="h-4 w-4" aria-hidden="true" />
                </button>
            </PopoverTrigger>
            <PopoverContent align="end" sideOffset={8} className="w-56 p-1.5">
                <div role="radiogroup" aria-label="Filter stocks" className="flex flex-col gap-1">
                    {FILTERS.map((entry) => {
                        const isSelected = entry.key === value;

                        return (
                            <button
                                key={entry.key}
                                type="button"
                                role="radio"
                                aria-checked={isSelected}
                                onClick={() => {
                                    onChange(entry.key);
                                    setOpen(false);
                                }}
                                className={cn(
                                    "rounded-full px-3 py-1.5 text-left text-xs font-semibold tracking-wide transition",
                                    isSelected
                                        ? "bg-[var(--main-dry-sage)] text-[var(--bg-main)]"
                                        : "text-[var(--text-muted)] hover:bg-[var(--surface-soft)] hover:text-[var(--text-main)]",
                                )}
                            >
                                {entry.label}
                            </button>
                        );
                    })}
                </div>
            </PopoverContent>
        </Popover>
    );
}

export default EarningsFilter;
