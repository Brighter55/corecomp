import GeneralBarGraph from "./GeneralBarGraph.jsx";

const explanation = (
  <div className="space-y-3">
      <p className="text-sm font-bold text-[var(--text-main)]">What is it?</p>
      <p className="text-sm text-[var(--text-main)]">
          The debt-to-equity (D/E) ratio measures a company's financial leverage by dividing its total liabilities by shareholder equity. It shows how much debt a company uses to finance assets relative to the value of shareholders' equity. A lower ratio implies less risk, while a higher ratio indicates greater leverage.
      </p>
      <p className="text-sm font-bold text-[var(--text-main)]">Calculation</p>
      <p className="text-sm font-mono text-[var(--text-main)]">
          Debt/Equity Ratio = Short Term & Long Term Debt / Total Shareholder Equity
      </p>
      <p className="text-sm font-bold text-[var(--text-main)]">Interpretation</p>
      <div className="space-y-1">
          <p className="text-sm text-[var(--text-main)]">
              High D/E Ratio (&gt; 1.5–2.0): Suggests the company is financing growth heavily through debt. This indicates higher risk, especially during economic downturns, as interest expenses must be paid regardless of earnings.
          </p>
          <p className="text-sm text-[var(--text-main)]">
              Low D/E Ratio (&lt; 1.0): Suggests a more conservative approach with less debt and stronger equity backing, typically seen as more stable.
          </p>
          <p className="text-sm text-[var(--text-main)]">
              Note: The definition of a "good" ratio varies by industry; capital-intensive industries (e.g., manufacturing, utilities) often have higher acceptable ratios (e.g., 2.0 or higher) compared to technology companies.
          </p>
      </div>
  </div>
)


export default function DebtEquityRatioGraph({ statement, period }) {
    return (
        <GeneralBarGraph
            statement={statement}
            period={period}
            title="Debt/Equity Ratio"
            barName="Debt/Equity Ratio"
            dataKey="DebtEquityRatio"
            explanation={explanation}
            yDomain={null}
            yTickFormatter={null}
            tooltipFormatter={null}
        />
    );
}
