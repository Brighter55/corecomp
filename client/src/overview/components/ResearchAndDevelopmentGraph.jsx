import GeneralBarGraph from "./GeneralBarGraph.jsx";
import { TrendingUp, TrendingDown } from "lucide-react";

export const explanation = (
    <div className="space-y-3">
        <p className="text-sm font-bold text-[var(--text-main)]">What is it?</p>
        <p className="text-sm text-[var(--text-main)]">
            Research and development spending measures how much a company invests in new products, technology, and innovation.
        </p>
        <p className="text-sm font-bold text-[var(--text-main)]">Interpretation</p>
        <div className="flex items-start gap-2">
            <TrendingUp className="mt-0.5 w-10 rounded-md text-green-600" />
            <p className="text-sm text-[var(--text-main)]">
                An upward trend in R&D spending indicates a strategic commitment to future growth, product differentiation, and technological advancement.
            </p>
        </div>
        <div className="flex items-start gap-2">
            <TrendingDown className="mt-0.5 w-10 rounded-md text-red-600" />
            <p className="text-sm text-[var(--text-main)]">
                A downward trend in R&D expenditure generally suggests that an organization is prioritizing short-term profitability over long-term growth or is facing financial pressure.  It may indicate a shift from a "growth" phase to a "maturity" or "harvesting" phase, where the focus is on maintaining existing products rather than developing new ones.
            </p>
        </div>
    </div>
);

function ResearchAndDevelopmentGraph({ statement, period }) {
    return (
        <GeneralBarGraph
            statement={statement}
            period={period}
            title="Research And Development"
            barName="Research And Development"
            dataKey="researchAndDevelopment"
            explanation={explanation}
        />
    );
}

export default ResearchAndDevelopmentGraph;
