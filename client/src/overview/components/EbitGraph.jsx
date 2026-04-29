import GeneralBarGraph from "./GeneralBarGraph.jsx";
import { TrendingUp, TrendingDown } from "lucide-react";


const explanation = (
    <div className="space-y-3">
        <p className="text-sm font-bold text-[var(--text-main)]">What is it?</p>
        <p className="text-sm text-[var(--text-main)]">
            EBIT (Earnings Before Interest and Taxes) is a company's operating profit, measuring core profitability by removing financing costs (interest) and tax environments. 
        </p>
        <p className="text-sm font-bold text-[var(--text-main)]">Calculation</p>
        <p className="text-sm font-mono text-[var(--text-main)]">
            EBIT = Net Income + Interest Expenses + Tax Expenses
        </p>
        <p className="text-sm font-bold text-[var(--text-main)]">Interpretation</p>
        <div className="flex items-start gap-2">
            <TrendingUp className="mt-0.5 w-10 rounded-md text-green-600" />
            <p className="text-sm text-[var(--text-main)]">
                A growing EBIT (Earnings Before Interest and Taxes) graph signifies that a company’s core operations are becoming more profitable over time. It shows that the business is successfully generating more operating income from its primary activities
            </p>
        </div>
        <div className="flex items-start gap-2">
            <TrendingDown className="mt-0.5 w-10 rounded-md text-red-600" />
            <p className="text-sm text-[var(--text-main)]">
                a downward trend generally highlights that the business is becoming less efficient at turning revenue into profit through its daily operations. 
            </p>
        </div>
    </div>
)

function EbitGraph({ statement, period }) {
    return (
        <GeneralBarGraph
            statement={statement}
            period={period}
            title="EBIT"
            barName="EBIT"
            dataKey="ebit"
            explanation={explanation}
        />
    );
}


export default EbitGraph
