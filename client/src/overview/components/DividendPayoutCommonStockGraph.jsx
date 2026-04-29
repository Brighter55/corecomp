import GeneralBarGraph from "./GeneralBarGraph.jsx";
import { TrendingUp, TrendingDown } from "lucide-react";

const explanation = (
    <div className="space-y-3">
        <p className="text-sm font-bold text-[var(--text-main)]">What is it?</p>
        <p className="text-sm text-[var(--text-main)]">
            A dividend payout represents the actual cash a company pays to its shareholders from its profits.
        </p>
        <p className="text-sm font-bold text-[var(--text-main)]">Interpretation</p>
        <div className="flex items-start gap-2">
            <TrendingUp className="mt-0.5 w-10 rounded-md text-green-600" />
            <p className="text-sm text-[var(--text-main)]">
                A rising dividend payout usually signals strong and stable cash flow. It often means management is confident the business can keep generating enough money to support these payments. Common in mature, slow-growth companies.
            </p>
        </div>
        <div className="flex items-start gap-2">
            <TrendingDown className="mt-0.5 w-10 rounded-md text-red-600" />
            <p className="text-sm text-[var(--text-main)]">
                A declining or eliminated dividend can signal trouble (cash flow issues, declining profits) or a strategic shift (reinvesting money back into growth instead of paying shareholders).
            </p>
        </div>
    </div>
)

function DividendPayoutCommonStockGraph({ statement, period }) {
    return (
        <GeneralBarGraph
            statement={statement}
            period={period}
            title="Dividend Payout (Common Stock)"
            barName="Dividend Payout (Common Stock)"
            dataKey="dividendPayoutCommonStock"
            explanation={explanation}
        />
    );
}

export default DividendPayoutCommonStockGraph
