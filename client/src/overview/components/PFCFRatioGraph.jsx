import GeneralBarGraph from "./GeneralBarGraph.jsx";
import { TrendingUp, TrendingDown } from "lucide-react";

const explanation = (
  <div className="space-y-3">
      <p className="text-sm font-bold text-[var(--text-main)]">What is it?</p>
      <p className="text-sm text-[var(--text-main)]">
          P/FCF (Price-to-Free Cash Flow) shows how much investors are paying for the actual cash a company generates after expenses and reinvestment. It focuses on real, usable cash rather than accounting profit.
      </p>
      <p className="text-sm font-bold text-[var(--text-main)]">Calculation</p>
      <p className="text-sm font-mono text-[var(--text-main)]">
          Price to Free Cash Flow = Market Cap / Free Cash Flow
      </p>
      <p className="text-sm font-bold text-[var(--text-main)]">Interpretation</p>
      <div className="flex items-start gap-2">
          <TrendingUp className="mt-0.5 w-10 rounded-md text-green-600" />
          <p className="text-sm text-[var(--text-main)]">
              Rising trend suggests investors are paying more for each dollar of cash flow, usually due to strong growth expectations, improving cash efficiency, or high-quality, predictable cash generation.
          </p>
      </div>
      <div className="flex items-start gap-2">
          <TrendingDown className="mt-0.5 w-10 rounded-md text-red-600" />
          <p className="text-sm text-[var(--text-main)]">
              Falling trend suggests investors are paying less for each dollar of cash flow, which may signal slowing growth, declining cash flow quality, or a potential undervaluation.
          </p>
      </div>
  </div>
)


export default function PFCFRatioGraph({ statement, period }) {
    return (
        <GeneralBarGraph
            statement={statement}
            period={period}
            title="Price to Free Cash Flow"
            barName="Price to Free Cash Flow"
            dataKey="PFCFRatio"
            explanation={explanation}
            yDomain={null}
            yTickFormatter={null}
            tooltipFormatter={null}
        />
    );
}
