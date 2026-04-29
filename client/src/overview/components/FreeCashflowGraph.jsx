import GeneralBarGraph from "./GeneralBarGraph.jsx";
import { TrendingUp, TrendingDown } from "lucide-react";

const explanation = (
    <div className="space-y-3">
        <p className="text-sm font-bold text-[var(--text-main)]">What is it?</p>
        <p className="text-sm text-[var(--text-main)]">
            Free Cash Flow (FCF) is the cash a company has left over after paying for its day-to-day operations and the essential investments (capital expenditures) needed to maintain and grow the business. It is essentially the "extra" money a company can use for things like paying dividends, buying back stock, paying off debt, or making acquisitions without disrupting its ongoing operations.
        </p>
        <p className="text-sm font-bold text-[var(--text-main)]">Calculation</p>
        <p className="text-sm font-mono text-[var(--text-main)]">
            FCF = Operating Cash Flow - Capital Expenditures
        </p>
        <p className="text-sm font-bold text-[var(--text-main)]">Interpretation</p>
        <div className="flex items-start gap-2">
            <TrendingUp className="mt-0.5 w-10 rounded-md text-green-600" />
            <p className="text-sm text-[var(--text-main)]">
                Upward trend in FCF generally signals a strong, healthy, and efficiently managed business.
            </p>
        </div>
        <div className="flex items-start gap-2">
            <TrendingDown className="mt-0.5 w-10 rounded-md text-red-600" />
            <p className="text-sm text-[var(--text-main)]">
                Downward trend in FCF could signify that the company may be struggling to generate enough cash from operations to cover its basic expenses and investments.
            </p>
        </div>
        <p className="text-sm text-[var(--text-main)]">
            Temporary Dips in Growth Companies: Rapidly expanding companies may temporarily show low or negative FCF as they heavily invest in capital expenditures, such as building new factories or technology infrastructure. In these cases, investors should focus on the long-term strategy and whether the investments are expected to generate high returns in the future.
        </p>
    </div>
)


function FreeCashflowGraph({ statement, period }) {
    return (
        <GeneralBarGraph
            statement={statement}
            period={period}
            title="Free Cash Flow"
            barName="Free Cash Flow"
            dataKey="freeCashFlow"
            explanation={explanation}
        />
    );
}


export default FreeCashflowGraph
