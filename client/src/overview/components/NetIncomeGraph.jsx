import GeneralBarGraph from "./GeneralBarGraph.jsx";
import { TrendingUp, TrendingDown } from "lucide-react";

export const explanation = (
    <div className="space-y-3">
        <p className="text-sm font-bold text-[var(--text-main)]">What is it?</p>
        <p className="text-sm text-[var(--text-main)]">
            Net income is a company's profit after all expenses and taxes have been deducted from its total revenue.
        </p>
        <p className="text-sm font-bold text-[var(--text-main)]">Calculation</p>
        <p className="text-sm font-mono text-[var(--text-main)]">
            Net Income = Total Revenue - Total Expenses
        </p>
        <p className="text-sm font-bold text-[var(--text-main)]">Interpretation</p>
        <div className="flex items-start gap-2">
            <TrendingUp className="mt-0.5 w-10 rounded-md text-green-600" />
            <p className="text-sm text-[var(--text-main)]">
                A positive trend shows the company is improving its financial performance.
            </p>
        </div>
        <div className="flex items-start gap-2">
            <TrendingDown className="mt-0.5 w-10 rounded-md text-red-600" />
            <p className="text-sm text-[var(--text-main)]">
                A negative trend can be a warning sign, even if it remains positive. It suggests the company may be facing challenges in its operations or market.
            </p>
        </div>
    </div>
)


function NetIncomeGraph({ statement, period }) {
    return (
        <GeneralBarGraph
            statement={statement}
            period={period}
            title="Net Income"
            barName="Net Income"
            dataKey="netIncome"
            explanation={explanation}
        />
    );
}


export default NetIncomeGraph
