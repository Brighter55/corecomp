import GeneralBarGraph from "./GeneralBarGraph.jsx";
import { TrendingUp, TrendingDown } from "lucide-react";

export const explanation = (
    <div className="space-y-3">
        <p className="text-sm font-bold text-[var(--text-main)]">What is it?</p>
        <p className="text-sm text-[var(--text-main)]">
            Cost of revenue is the total direct expense a company incurs to produce,
            sell, and deliver its goods or services to customers.
            It represents the direct costs—such as raw materials, direct labor, and shipping
        </p>
        <p className="text-sm font-bold text-[var(--text-main)]">Calculation</p>
        <p className="text-sm font-mono text-[var(--text-main)]">
            COR = cost of labor + materials + marketing + distribution + sales discounts
        </p>
        <p className="text-sm font-bold text-[var(--text-main)]">Interpretation</p>
        <div className="flex items-start gap-2">
            <TrendingUp className="mt-0.5 w-10 rounded-md text-green-600" />
            <p className="text-sm text-[var(--text-main)]">
                An upward trend can signal rising input costs or expansion in sales volume that requires more spending.
            </p>
        </div>
        <div className="flex items-start gap-2">
            <TrendingDown className="mt-0.5 w-10 rounded-md text-red-600" />
            <p className="text-sm text-[var(--text-main)]">
                A downward trend can indicate better cost control or reduced production activity.
            </p>
        </div>
    </div>
);

function CostOfRevenueGraph({ statement, period }) {
    return (
        <GeneralBarGraph
            statement={statement}
            period={period}
            title="Cost Of Revenue"
            barName="Cost Of Revenue"
            dataKey="costOfRevenue"
            explanation={explanation}
        />
    );
}

export default CostOfRevenueGraph;