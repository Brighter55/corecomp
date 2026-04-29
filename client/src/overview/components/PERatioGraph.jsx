import GeneralBarGraph from "./GeneralBarGraph.jsx";
import { TrendingUp, TrendingDown } from "lucide-react";

const explanation = (
  <div className="space-y-3">
      <p className="text-sm font-bold text-[var(--text-main)]">What is it?</p>
      <p className="text-sm text-[var(--text-main)]">
          PE ratio measures a company’s current share price relative to its earnings per share (EPS). it tells you how much investors are paying for of a company's profit.
      </p>
      <p className="text-sm font-bold text-[var(--text-main)]">Calculation</p>
      <p className="text-sm font-mono text-[var(--text-main)]">
          PE Ratio = Price per Share / Earnings per Share
      </p>
      <p className="text-sm font-bold text-[var(--text-main)]">Interpretation</p>
      <div className="flex items-start gap-2">
          <TrendingUp className="mt-0.5 w-10 rounded-md text-green-600" />
          <p className="text-sm text-[var(--text-main)]">
              A rising P/E often suggests that investors are increasingly optimistic about the company's future prospects. They are willing to pay a higher premium (more dollars for every $1 of profit) today 
          </p>
      </div>
      <div className="flex items-start gap-2">
          <TrendingDown className="mt-0.5 w-10 rounded-md text-red-600" />
          <p className="text-sm text-[var(--text-main)]">
                A downward trend in a Price-to-Earnings (P/E) ratio graph generally indicates that a company's stock price is falling relative to its earnings, or that its earnings are growing faster than its stock price. This contraction signifies that investors are paying less for each dollar of profit, often making the stock "cheaper" or better value.
          </p>
      </div>
  </div>
)


export default function PERatioGraph({ statement, period }) {
    return (
        <GeneralBarGraph
            statement={statement}
            period={period}
            title="PE Ratio"
            barName="PE Ratio"
            dataKey="PERatio"
            explanation={explanation}
            yDomain={null}
            yTickFormatter={null}
            tooltipFormatter={null}
        />
    );
}
