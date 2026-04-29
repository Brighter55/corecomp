import GeneralBarGraph from "./GeneralBarGraph.jsx";
import { TrendingUp, TrendingDown } from "lucide-react";

const explanation = (
  <div className="space-y-3">
      <p className="text-sm font-bold text-[var(--text-main)]">What is it?</p>
      <p className="text-sm text-[var(--text-main)]">
          A profit margin shows the percentage of revenue a company keeps as profit after subtracting its costs
      </p>
      <p className="text-sm font-bold text-[var(--text-main)]">Calculation</p>
      <p className="text-sm font-mono text-[var(--text-main)]">
          Profit Margin Percent = (net income / total revenue) * 100
      </p>
      <p className="text-sm font-bold text-[var(--text-main)]">Interpretation</p>
      <div className="flex items-start gap-2">
          <TrendingUp className="mt-0.5 w-10 rounded-md text-green-600" />
          <p className="text-sm text-[var(--text-main)]">
              A positive trend in a company's profit margin percentage means it's keeping more profit for every dollar of sales over time, signaling improved financial health, better cost control, pricing power, and operational efficiency, making it more attractive to investors and indicating a sustainable business model
          </p>
      </div>
      <div className="flex items-start gap-2">
          <TrendingDown className="mt-0.5 w-10 rounded-md text-red-600" />
          <p className="text-sm text-[var(--text-main)]">
                A negative trend in a company's profit margin means it's losing more money relative to its revenue over time, signaling deeper issues like rising costs (materials, labor, operations), falling sales, poor pricing, or inefficient management, indicating an unsustainable model
          </p>
      </div>
  </div>
)


export default function ProfitMarginGraph({ statement, period }) {
    return (
        <GeneralBarGraph
            statement={statement}
            period={period}
            title="Profit Margin Percentage"
            barName="Profit Margin"
            dataKey="profitMarginPercent"
            explanation={explanation}
            yDomain={null}
            yTickFormatter={(value) => `${value}%`}
            tooltipFormatter={(value) => `${value}%`}
        />
    );
}
