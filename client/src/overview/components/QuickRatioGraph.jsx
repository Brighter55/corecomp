import GeneralBarGraph from "./GeneralBarGraph.jsx";
 

const explanation = (
  <div className="space-y-3">
      <p className="text-sm font-bold text-[var(--text-main)]">What is it?</p>
      <p className="text-sm text-[var(--text-main)]">
          The quick ratio, or "acid-test ratio," measures a company’s ability to pay short-term liabilities (due within one year) using its most liquid assets—cash, marketable securities, and accounts receivable. It excludes inventories and prepaid expenses, providing a stricter liquidity test than the current ratio.
      </p>
      <p className="text-sm font-bold text-[var(--text-main)]">Calculation</p>
      <p className="text-sm font-mono text-[var(--text-main)]">
          Quick Ratio = (Cash & Cash Equivalents + Short Term Investment + Current Net Receivables) / Total Current Liabilities
      </p>
      <p className="text-sm font-bold text-[var(--text-main)]">Interpretation</p>
      <div className="space-y-1">
          <p className="text-sm text-[var(--text-main)]">
              &gt; 1.0: The company has sufficient liquid assets to cover its current liabilities.
          </p>
          <p className="text-sm text-[var(--text-main)]">
              &lt; 1.0: The company may struggle to pay immediate debts, suggesting potential cash flow issues.
          </p>
          <p className="text-sm text-[var(--text-main)]">
              Too High Ratio (e.g., 7 or 8): May indicate an inefficient use of cash that could be used for growth.
          </p>
          <p className="text-sm text-[var(--text-main)]">
              Trends: A decreasing ratio over time (e.g., 1.1 down to 0.9) suggests deteriorating liquidity.
          </p>
      </div>
  </div>
)


export default function QuickRatioGraph({ statement, period }) {
    return (
        <GeneralBarGraph
            statement={statement}
            period={period}
            title="Quick Ratio"
            barName="Quick Ratio"
            dataKey="QuickRatio"
            explanation={explanation}
            yDomain={null}
            yTickFormatter={null}
            tooltipFormatter={null}
        />
    );
}
