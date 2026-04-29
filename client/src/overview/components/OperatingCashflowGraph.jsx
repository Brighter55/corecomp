import GeneralBarGraph from "./GeneralBarGraph.jsx";
import { TrendingUp, TrendingDown } from "lucide-react";

const explanation = (
    <div className="space-y-3">
        <p className="text-sm font-bold text-[var(--text-main)]">What is it?</p>
        <p className="text-sm text-[var(--text-main)]">
            Operating cash flow is the actual cash a company recieves or spends from its normal, day-to-day business activities—selling products, providing services, paying suppliers, covering wages, etc.
        </p>
        <p className="text-sm font-bold text-[var(--text-main)]">Calculation</p>
        <p className="text-sm font-mono text-[var(--text-main)]">
            Operating Cash Flow = Net Income + Depreciation + Changes in Working capital
        </p>
        <p className="text-sm font-bold text-[var(--text-main)]">Interpretation</p>
        <div className="flex items-start gap-2">
            <TrendingUp className="mt-0.5 w-10 rounded-md text-green-600" />
            <p className="text-sm text-[var(--text-main)]">
                Upward Trend means the company is consistently bringing in more cash from its regular business than it is spending, indicating a healthy, efficient, and potentially growing business.
            </p>
        </div>
        <div className="flex items-start gap-2">
            <TrendingDown className="mt-0.5 w-10 rounded-md text-red-600" />
            <p className="text-sm text-[var(--text-main)]">
                Downward Trend means the company is consistently bringing in less cash from operations or spending more, which could signal underlying operational issues or a need for external funding to stay afloat.
            </p>
        </div>
        <p className="text-sm text-[var(--text-main)]">
            Positive Cash Flow means cash coming in is higher than cash going out over a period, allowing the business to pay bills, invest in growth, and handle expenses.
        </p>
        <p className="text-sm text-[var(--text-main)]">
            Negative Cash Flow means cash going out is higher than cash coming in, which, if it continues for a long time, can be a warning sign of financial trouble.
        </p>
    </div>
)


function OperatingCashflowGraph({ statement, period }) {
    return (
        <GeneralBarGraph
            statement={statement}
            period={period}
            title="Operating Cash Flow"
            barName="Operating Cash flow"
            dataKey="operatingCashflow"
            explanation={explanation}
        />
    );
}


export default OperatingCashflowGraph
