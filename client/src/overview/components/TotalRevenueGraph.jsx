import GeneralBarGraph from "./GeneralBarGraph.jsx";
import { TrendingUp, TrendingDown } from "lucide-react";


const explanation = (
    <div className="space-y-3">
        <p className="text-sm font-bold text-[var(--text-main)]">What is it?</p>
        <p className="text-sm text-[var(--text-main)]">
            Total revenue is the total income a company generates from all sources before any expenses are deducted
        </p>
        <p className="text-sm font-bold text-[var(--text-main)]">Calculation</p>
        <p className="text-sm font-mono text-[var(--text-main)]">
            Total Revenue = Price per Unit * Quantity Sold
        </p>
        <p className="text-sm font-bold text-[var(--text-main)]">Interpretation</p>
        <div className="flex items-start gap-2">
            <TrendingUp className="mt-0.5 w-10 rounded-md text-green-600" />
            <p className="text-sm text-[var(--text-main)]">
                An increase in total revenue over time can indicate successful sales and marketing strategies, good market demand, or effective pricing.
            </p>
        </div>
        <div className="flex items-start gap-2">
            <TrendingDown className="mt-0.5 w-10 rounded-md text-red-600" />
            <p className="text-sm text-[var(--text-main)]">
                A decrease in total revenue could signal problems such as declining demand, increased competition, or ineffective pricing strategies.
            </p>
        </div>
    </div>
)

function TotalRevenueGraph({ statement, period }) {
    return (
        <GeneralBarGraph
            statement={statement}
            period={period}
            title="Revenue"
            barName="Total Revenue"
            dataKey="totalRevenue"
            explanation={explanation}
        />
    );
}


export default TotalRevenueGraph
