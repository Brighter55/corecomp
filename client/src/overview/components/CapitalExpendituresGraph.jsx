import GeneralBarGraph from "./GeneralBarGraph.jsx";
import { TrendingUp, TrendingDown } from "lucide-react";

export const explanation = (
    <div className="space-y-3">
        <p className="text-sm font-bold text-[var(--text-main)]">What is it?</p>
        <p className="text-sm text-[var(--text-main)]">
            Capital expenditure (CapEx) is the money a company spends on long-term physical assets like property, buildings, and machinery.
        </p>
        <p className="text-sm font-bold text-[var(--text-main)]">Calculation</p>
        <p className="text-sm font-mono text-[var(--text-main)]">
            CapEx = (Ending PP&E - Beginning PP&E) + Depreciation Expense
        </p>
        <p className="text-sm font-bold text-[var(--text-main)]">Interpretation</p>
        <div className="flex items-start gap-2">
            <TrendingUp className="mt-0.5 w-10 rounded-md text-green-600" />
            <p className="text-sm text-[var(--text-main)]">
                Upward trend often signifies expansion, investment in new technology, or replacement of aging equipment, suggesting the company is growing or trying to increase efficiency
            </p>
        </div>
        <div className="flex items-start gap-2">
            <TrendingDown className="mt-0.5 w-10 rounded-md text-red-600" />
            <p className="text-sm text-[var(--text-main)]">
                Downward trend can mean reduced investment in assets, which could signal market uncertainty, reduced growth prospects, or that the company is in a mature phase.
            </p>
        </div>
    </div>
)


function CapitalExpendituresGraph({ statement, period }) {
    return (
        <GeneralBarGraph
            statement={statement}
            period={period}
            title="Capital Expenditures"
            barName="Capital Expenditures"
            dataKey="capitalExpenditures"
            explanation={explanation}
        />
    );
}


export default CapitalExpendituresGraph
