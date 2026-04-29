import GeneralBarGraph from "./GeneralBarGraph.jsx";
import { TrendingUp, TrendingDown } from "lucide-react";

const explanation = (
    <div className="space-y-3">
        <p className="text-sm font-bold text-[var(--text-main)]">What is it?</p>
        <p className="text-sm text-[var(--text-main)]">
            Cash Flow from Financing (CFF) activities section on a cash flow statement reports the net flow of cash between a company and its owners (shareholders) and creditors. It highlights how a business funds itself, showing money raised through issuing stock or debt (inflows) and money spent on dividends, share buybacks, or debt repayment (outflows).
        </p>
        <p className="text-sm font-bold text-[var(--text-main)]">Calculation</p>
        <p className="text-sm font-mono text-[var(--text-main)]">
            CFF = Cash Inflows from Issuing Equity or Debt - (Dividends Paid + Repurchase of Debt and Equity)
        </p>
        <p className="text-sm font-bold text-[var(--text-main)]">Interpretation</p>
        <div className="flex items-start gap-2">
            <TrendingUp className="mt-0.5 w-10 rounded-md text-green-600" />
            <p className="text-sm text-[var(--text-main)]">
                A positive trend shows the company is receiving more cash from lenders or investors than it is paying out. It usually signifies raising capital for growth, typical for young, expanding firms.
            </p>
        </div>
        <div className="flex items-start gap-2">
            <TrendingDown className="mt-0.5 w-10 rounded-md text-red-600" />
            <p className="text-sm text-[var(--text-main)]">
                A downward trend (negative/decreasing) often indicates a mature company paying down debt or rewarding shareholders through buybacks or dividends.
            </p>
        </div>
    </div>
)

function CashflowFromFinancingGraph({ statement, period }) {
    return (
        <GeneralBarGraph
            statement={statement}
            period={period}
            title="Cashflow from Financing"
            barName="Cashflow from Financing"
            dataKey="cashflowFromFinancing"
            explanation={explanation}
        />
    );
}

export default CashflowFromFinancingGraph
