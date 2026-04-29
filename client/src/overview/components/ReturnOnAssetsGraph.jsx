import GeneralBarGraph from "./GeneralBarGraph.jsx";
 

const explanation = (
  <div className="space-y-3">
      <p className="text-sm font-bold text-[var(--text-main)]">What is it?</p>
      <p className="text-sm text-[var(--text-main)]">
          Return on Assets (ROA) is measures how efficiently a company uses its assets to generate profit. It shows the net income produced per dollar of assets, indicating operational efficiency. A higher ROA indicates more effective management of assets.
      </p>
      <p className="text-sm font-bold text-[var(--text-main)]">Calculation</p>
      <p className="text-sm font-mono text-[var(--text-main)]">
          ROA = Net Income / Total Assets
      </p>
      <p className="text-sm font-bold text-[var(--text-main)]">Interpretation</p>
      <div className="space-y-1">
          <p className="text-sm text-[var(--text-main)]">
              Rising Trend: Indicates increasing operational efficiency, better asset utilization, and smarter, more productive investment in assets over time.
          </p>
          <p className="text-sm text-[var(--text-main)]">
              Declining Trend: Acts as a potential early warning signal for aging assets, rising unplanned costs, or decreasing efficiency.
          </p>
          <p className="text-sm text-[var(--text-main)]">
              High/Low Numbers: Generally, &gt;5% is considered decent, and &gt;10% is strong, though this varies heavily by industry. Asset-heavy industries (e.g., utilities) often have lower ROA compared to tech or service industries.
          </p>
      </div>
  </div>
)


export default function ReturnOnAssetsGraph({ statement, period }) {
    return (
        <GeneralBarGraph
            statement={statement}
            period={period}
            title="ROA Percentage"
            barName="Return on Assets"
            dataKey="ROAPercentage"
            explanation={explanation}
            yDomain={null}
            yTickFormatter={(value) => `${value}%`}
            tooltipFormatter={(value) => `${value}%`}
        />
    );
}
