import GeneralBarGraph from "./GeneralBarGraph.jsx";
import { TrendingUp, TrendingDown } from "lucide-react";


const explanation = (
    <div className="space-y-3">
        <p className="text-sm font-bold text-[var(--text-main)]">What is it?</p>
        <p className="text-sm text-[var(--text-main)]">
            EBITDA (Earnings Before Interest, Taxes, Depreciation, and Amortization) is a measure of a company's core operational profitability, showing how much cash it generates from operations alone.
        </p>
        <p className="text-sm font-bold text-[var(--text-main)]">Calculation</p>
        <p className="text-sm font-mono text-[var(--text-main)]">
            EBITDA = EBIT + Depreciation + Amortization
        </p>
        <p className="text-sm font-bold text-[var(--text-main)]">Interpretation</p>
        <div className="flex items-start gap-2">
            <TrendingUp className="mt-0.5 w-10 rounded-md text-green-600" />
            <p className="text-sm text-[var(--text-main)]">
                Rising EBITDA (Earnings Before Interest, Taxes, Depreciation, and Amortization) trend signifies strengthening operational performance, high profitability, and improved scalability. It indicates a company is generating consistent cash flow from its core operations
            </p>
        </div>
        <div className="flex items-start gap-2">
            <TrendingDown className="mt-0.5 w-10 rounded-md text-red-600" />
            <p className="text-sm text-[var(--text-main)]">
                A downward EBITDA trend indicates declining operational profitability, signaling that a company is struggling to cover core expenses, which often leads to reduced valuation and cash flow strain.
            </p>
        </div>
    </div>
)

function EbitdaGraph({ statement, period }) {
    return (
        <GeneralBarGraph
            statement={statement}
            period={period}
            title="EBITDA"
            barName="EBITDA"
            dataKey="ebitda"
            explanation={explanation}
        />
    );
}


export default EbitdaGraph