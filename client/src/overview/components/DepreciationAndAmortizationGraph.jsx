import GeneralBarGraph from "./GeneralBarGraph.jsx";
import { TrendingUp, TrendingDown } from "lucide-react";

const explanation = (
    <div className="space-y-3">
        <p className="text-sm font-bold text-[var(--text-main)]">What is it?</p>
        <p className="text-sm text-[var(--text-main)]">
            Depreciation and amortization are accounting methods used to spread the cost
            of an asset over its useful life, acting as non-cash tax deductions that reduce
            taxable income. Depreciation applies to tangible assets (machinery, buildings),
            while amortization applies to intangible assets (patents, copyrights).
            Both help match expenses with the revenue the assets generate.
        </p>
        <p className="text-sm font-mono text-[var(--text-main)]">
            Depreciation = (Purchase Price - Salvage Value) / Useful Life
        </p>
        <p className="text-sm font-mono text-[var(--text-main)]">
            Amortization = Initial cost / Useful Life
        </p>
        <p className="text-sm font-bold text-[var(--text-main)]">Interpretation</p>
        <div className="flex items-start gap-2">
            <TrendingUp className="mt-0.5 w-10 rounded-md text-green-600" />
            <p className="text-sm text-[var(--text-main)]">
                Upward trend suggests the company is actively purchasing new, expensive equipment or acquiring other businesses (high capital expenditures). While this lowers immediate net income, it often indicates expected future growth and technological upgrades.
            </p>
        </div>
        <div className="flex items-start gap-2">
            <TrendingDown className="mt-0.5 w-10 rounded-md text-red-600" />
            <p className="text-sm text-[var(--text-main)]">
                Downward trend suggests the company is investing less, has older, fully depreciated assets, or is using assets with longer lifespans. This boosts net income, but may indicate a need for future investment or aging infrastructure.
            </p>
        </div>
    </div>
)

function DepreciationAndAmortizationGraph({ statement, period }) {
    return (
        <GeneralBarGraph
            statement={statement}
            period={period}
            title="Depreciation & Amortization"
            barName="Depreciation & Amortization"
            dataKey="depreciationDepletionAndAmortization"
            explanation={explanation}
        />
    );
}

export default DepreciationAndAmortizationGraph
