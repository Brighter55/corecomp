import GeneralBarGraph from "./GeneralBarGraph.jsx";
import { TrendingUp, TrendingDown } from "lucide-react";

export const explanation = (
    <div className="space-y-3">
        <p className="text-sm font-bold text-[var(--text-main)]">What is it?</p>
        <p className="text-sm text-[var(--text-main)]">
            Gross profit is the money a company keeps after subtracting the direct costs of producing goods or services from revenue.
        </p>
        <p className="text-sm font-bold text-[var(--text-main)]">Calculation</p>
        <p className="text-sm font-mono text-[var(--text-main)]">
            Gross Profit = Total Revenue - Cost of Goods Sold (COGS)
        </p>
        <p className="text-sm font-bold text-[var(--text-main)]">Interpretation</p>
        <div className="flex items-start gap-2">
            <TrendingUp className="mt-0.5 w-10 rounded-md text-green-600" />
            <p className="text-sm text-[var(--text-main)]">
                An increasing gross profit indicates that revenue is growing faster than the cost of producing goods, or that production costs are being reduced. 
            </p>
        </div>
        <div className="flex items-start gap-2">
            <TrendingDown className="mt-0.5 w-10 rounded-md text-red-600" />
            <p className="text-sm text-[var(--text-main)]">
                A decreasing gross profit indicates that direct production costs are rising faster than revenue, or that sales are declining while costs remain stagnant.
            </p>
        </div>
    </div>
);

function GrossProfitGraph({ statement, period }) {
    return (
        <GeneralBarGraph
            statement={statement}
            period={period}
            title="Gross Profit"
            barName="Gross Profit"
            dataKey="grossProfit"
            explanation={explanation}
        />
    );
}

export default GrossProfitGraph;