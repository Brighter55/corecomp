import GeneralBarGraph from "./GeneralBarGraph.jsx";
 

const explanation = (
  <div className="space-y-3">
      <p className="text-sm font-bold text-[var(--text-main)]">What is it?</p>
      <p className="text-sm text-[var(--text-main)]">
          Current ratio is a liquidity metric that measures a company's ability to pay short-term obligations (due within one year) with its short-term assets.
      </p>
      <p className="text-sm font-bold text-[var(--text-main)]">Calculation</p>
      <p className="text-sm font-mono text-[var(--text-main)]">
          Current Ratio = Total Current Assets / Total Current Liabilities
      </p>
      <p className="text-sm font-bold text-[var(--text-main)]">Interpretation</p>
      <div className="space-y-1">
          <p className="text-sm text-[var(--text-main)]">
              Current ratio &lt; 1: The company may have difficulty paying short-term debts.
          </p>
          <p className="text-sm text-[var(--text-main)]">
              Current ratio 1 - 1.5: Generally considered acceptable, depending on the industry.
          </p>
          <p className="text-sm text-[var(--text-main)]">
              Current ratio &gt; 3: Could indicate high liquidity, but may also mean the company is not using its assets efficiently.
          </p>
      </div>
  </div>
)


export default function CurrentRatioGraph({ statement, period }) {
    return (
        <GeneralBarGraph
            statement={statement}
            period={period}
            title="Current Ratio"
            barName="Current Ratio"
            dataKey="CurrentRatio"
            explanation={explanation}
            yDomain={null}
            yTickFormatter={null}
            tooltipFormatter={null}
        />
    );
}