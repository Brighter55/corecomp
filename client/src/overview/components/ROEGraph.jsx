import GeneralBarGraph from "./GeneralBarGraph.jsx";
import { TrendingUp, TrendingDown } from "lucide-react";

const explanation = (
  <div className="space-y-3">
      <p className="text-sm font-bold text-[var(--text-main)]">What is it?</p>
      <p className="text-sm text-[var(--text-main)]">
          Return on equity is a financial ratio that indicates how efficiently a business generates profit from its shareholders’ equity. ROE tells you how well a company turns investor money into profit.
      </p>
      <p className="text-sm font-bold text-[var(--text-main)]">Calculation</p>
      <p className="text-sm font-mono text-[var(--text-main)]">
          ROE = Net Income / Average Shareholder's Equity
      </p>
      <p className="text-sm font-bold text-[var(--text-main)]">Interpretation</p>
      <div className="flex items-start gap-2">
          <TrendingUp className="mt-0.5 w-10 rounded-md text-green-600" />
          <p className="text-sm text-[var(--text-main)]">
              A positive trend in a company's return on equity means it is improving its ability to generate profit without necessarily needing more equity capital, which could imply strong growth potential and good management practices.
          </p>
      </div>
      <div className="flex items-start gap-2">
          <TrendingDown className="mt-0.5 w-10 rounded-md text-red-600" />
          <p className="text-sm text-[var(--text-main)]">
                A negative trend in a company's return on equity means it is generating less profit relative to its equity over time, implying that a company may be mismanaged and failing to reinvest earnings in assets that produce profits. 
          </p>
      </div>
  </div>
)


export default function ROEGraph({ statement, period }) {
    return (
        <GeneralBarGraph
            statement={statement}
            period={period}
            title="ROE Percentage"
            barName="Return on Equity"
            dataKey="ROEPercentage"
            explanation={explanation}
            yDomain={null}
            yTickFormatter={(value) => `${value}%`}
            tooltipFormatter={(value) => `${value}%`}
        />
    );
}
