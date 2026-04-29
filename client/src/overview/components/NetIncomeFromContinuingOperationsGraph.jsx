import GeneralBarGraph from "./GeneralBarGraph.jsx";
import { TrendingUp, TrendingDown } from "lucide-react";

export const explanation = (
    <div className="space-y-3">
        <p className="text-sm font-bold text-[var(--text-main)]">What is it?</p>
        <p className="text-sm text-[var(--text-main)]">
            Net income from continuing operations is the profit a company generates from its core, ongoing business activities, excluding one-time events, discontinued segments, or accounting changes. It represents sustainable, recurring earnings, making it a critical metric for investors evaluating a company's true profitability and future performance potential. 
        </p>
        <p className="text-sm font-bold text-[var(--text-main)]">Interpretation</p>
        <div className="flex items-start gap-2">
            <TrendingUp className="mt-0.5 w-10 rounded-md text-green-600" />
            <p className="text-sm text-[var(--text-main)]">
                A rising trend indicates rising profitability from core products or services. it could be driven by high demand, strong sales volume, or improved pricing power.
            </p>
        </div>
        <div className="flex items-start gap-2">
            <TrendingDown className="mt-0.5 w-10 rounded-md text-red-600" />
            <p className="text-sm text-[var(--text-main)]">
                A falling trend suggests that the primary business activities are becoming less profitable.
            </p>
        </div>
        <p className="text-sm text-[var(--text-main)]">Note: A downward trend might be temporary due to restructuring for long-term growth, while an upward trend might be driven by unsustainable, temporary market conditions.</p>
    </div>
);

function NetIncomeFromContinuingOperationsGraph({ statement, period }) {
    return (
        <GeneralBarGraph
            statement={statement}
            period={period}
            title="Net Income From Continuing Operations"
            barName="Net Income From Continuing Operations"
            dataKey="netIncomeFromContinuingOperations"
            explanation={explanation}
        />
    );
}

export default NetIncomeFromContinuingOperationsGraph;
