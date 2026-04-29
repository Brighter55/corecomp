import GeneralBarGraph from "./GeneralBarGraph.jsx";
import { TrendingUp, TrendingDown } from "lucide-react";

export const explanation = (
    <div className="space-y-3">
        <p className="text-sm font-bold text-[var(--text-main)]">What is it?</p>
        <p className="text-sm text-[var(--text-main)]">
            Operating expenses are the day-to-day costs required to run the business, excluding direct production costs.
        </p>
        <p className="text-sm font-bold text-[var(--text-main)]">Interpretation</p>
        <div className="flex items-start gap-2">
            <TrendingUp className="mt-0.5 w-10 rounded-md text-green-600" />
            <p className="text-sm text-[var(--text-main)]">
                An upward trend indicates rising costs, which can signal growth or inefficiency
            </p>
        </div>
        <div className="flex items-start gap-2">
            <TrendingDown className="mt-0.5 w-10 rounded-md text-red-600" />
            <p className="text-sm text-[var(--text-main)]">
                A downward trend indicates falling costs, suggesting improved efficiency or reduced business activity
            </p>
        </div>
        <p className="text-sm text-[var(--text-main)]">
                Note: Growth and Expansion (Positive): If operating expenses are rising, but revenue is growing faster, it suggests the company is investing in growth (e.g., higher marketing spend, opening new locations, or increasing headcount).
                Inefficiency and Declining Margins (Negative): If expenses rise while revenue is flat or declining, this indicates a dangerous increase in costs that reduces profitability.
        </p>
    </div>
);

function OperatingExpensesGraph({ statement, period }) {
    return (
        <GeneralBarGraph
            statement={statement}
            period={period}
            title="Operating Expenses"
            barName="Operating Expenses"
            dataKey="operatingExpenses"
            explanation={explanation}
        />
    );
}

export default OperatingExpensesGraph;
