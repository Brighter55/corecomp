import GeneralBarGraph from "./GeneralBarGraph.jsx";
import { TrendingUp, TrendingDown } from "lucide-react";

const explanation = (
  <div className="space-y-3">
      <p className="text-sm font-bold text-[var(--text-main)]">What is it?</p>
      <p className="text-sm text-[var(--text-main)]">
          Shows how much investors pay for $1 of a company's revenue. A 1.0 ratio means investors are paying $1 for every $1 of revenue.
      </p>
      <p className="text-sm font-bold text-[var(--text-main)]">Calculation</p>
      <p className="text-sm font-mono text-[var(--text-main)]">
          P/S Ratio = Market Cap / Total Revenue
      </p>
      <p className="text-sm font-bold text-[var(--text-main)]">Interpretation</p>
      <div className="flex items-start gap-2">
          <TrendingUp className="mt-0.5 w-10 rounded-md text-green-600" />
          <p className="text-sm text-[var(--text-main)]">
              Rising P/S suggests investors are willing to pay more for each dollar of sales, usually due to strong growth expectations, improving margins, or market hype.
          </p>
      </div>
      <div className="flex items-start gap-2">
          <TrendingDown className="mt-0.5 w-10 rounded-md text-red-600" />
          <p className="text-sm text-[var(--text-main)]">
              Falling P/S suggests weakening investor confidence, slowing growth, declining margins, or the stock becoming undervalued relative to its revenue.
          </p>
      </div>
  </div>
)


export default function PSRatioGraph({ statement, period }) {
    return (
        <GeneralBarGraph
            statement={statement}
            period={period}
            title="P/S Ratio"
            barName="P/S Ratio"
            dataKey="PSRatio"
            explanation={explanation}
            yDomain={null}
            yTickFormatter={null}
            tooltipFormatter={null}
        />
    );
}
