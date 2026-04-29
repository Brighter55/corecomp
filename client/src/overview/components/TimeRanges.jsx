import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

function TimeRanges({ timeRange, setTimeRange }) {
    return (
        <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="h-9 w-[84px] border-[var(--line-muted)] bg-[var(--line-muted)] px-2 text-sm font-medium text-[--text-main]">
                <SelectValue placeholder="Range" />
            </SelectTrigger>
            <SelectContent align="end" className="w-[84px] p-1 bg-[var(--bg-main)]">
                <SelectItem value="YTD">YTD</SelectItem>
                <SelectItem value="1Y">1Y</SelectItem>
                <SelectItem value="5Y">5Y</SelectItem>
                <SelectItem value="10Y">10Y</SelectItem>
                <SelectItem value="all">all</SelectItem>
            </SelectContent>
        </Select>
    );
}

export default TimeRanges;
