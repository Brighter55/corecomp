import GeneralBarGraph from "./GeneralBarGraph.jsx";
import { TrendingUp, TrendingDown } from "lucide-react";

const explanation = (
    <div className="space-y-3">
        <p className="text-sm font-bold text-[var(--text-main)]">What is it?</p>
        <p className="text-sm text-[var(--text-main)]">
            Cash flow from investment (CFI) reflects a company's long-term asset purchases (outflow) or sales (inflow).
        </p>
        <p className="text-sm font-bold text-[var(--text-main)]">Calculation</p>
        <p className="text-sm font-mono text-[var(--text-main)]">
            CFI = Sale of Assets/Investments - Purchase of Assets/Investments
        </p>
        <p className="text-sm font-bold text-[var(--text-main)]">Interpretation</p>
        <div className="flex items-start gap-2">
            <TrendingUp className="mt-0.5 w-10 rounded-md text-green-600" />
            <p className="text-sm text-[var(--text-main)]">
                An upward trend (becoming less negative or positive) usually indicates reduced capital spending or asset divestiture
            </p>
        </div>
        <div className="flex items-start gap-2">
            <TrendingDown className="mt-0.5 w-10 rounded-md text-red-600" />
            <p className="text-sm text-[var(--text-main)]">
                A downward trend (becoming more negative) indicates aggressive investment in growth, property, or acquisitions.
            </p>
        </div>
    </div>
)

function CashflowFromInvestmentGraph({ statement, period }) {
    return (
        <GeneralBarGraph
            statement={statement}
            period={period}
            title="Cashflow from Investment"
            barName="Cashflow from Investment"
            dataKey="cashflowFromInvestment"
            explanation={explanation}
        />
    );
}

export default CashflowFromInvestmentGraph
