import { useState } from "react";
import { CircleHelp } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

function Explanation({ explanation, maxWidth = 500 }) {
    const [open, setOpen] = useState(false);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <button
                    type="button"
                    aria-label="Show explanation"
                    className="inline-flex h-7 w-7 items-center justify-center rounded-full text-[var(--main-pine-teal)] transition-colors hover:bg-[rgba(88,129,87,0.12)]"
                >
                    <CircleHelp className="h-4 w-4 text-[var(--text-main)]" />
                </button>
            </PopoverTrigger>
            <PopoverContent
                align="center"
                sideOffset={8}
                className="p-4"
                style={{ maxWidth: `${maxWidth}px`, width: "auto", backgroundColor: "var(--bg-main)" }}
            >
                {explanation}
            </PopoverContent>
        </Popover>
    );
}

export default Explanation;
