import GeneralBarGraph from "./GeneralBarGraph.jsx";
import { Lightbulb } from "lucide-react";

const explanation = (
  <div className="space-y-3">
	  <p className="text-sm font-bold text-[var(--text-main)]">What is it?</p>
	  <p className="text-sm text-[var(--text-main)]">
		  Price-to-Book (P/B) ratio measures a company's market value relative to its book value (total assets minus liabilities). It tells you how much investors are paying for each dollar of a company's net assets.
	  </p>
	  <p className="text-sm font-bold text-[var(--text-main)]">Calculation</p>
	  <p className="text-sm font-mono text-[var(--text-main)]">
		  P/B Ratio = Market Price per Share / Book Value per Share
	  </p>
	  <p className="text-sm font-mono text-[var(--text-main)]">
		  Book Value per Share = (Total Assets - Total Liabilities) / Shares Outstanding
	  </p>
	  <p className="text-sm font-bold text-[var(--text-main)]">Interpretation</p>
	  <div className="space-y-1">
		  <p className="text-sm text-[var(--text-main)]">P/B less than 1: Potential indicator of an undervalued stock or a company experiencing financial distress.</p>
		  <p className="text-sm text-[var(--text-main)]">P/B greater than 1: Generally suggests the stock is trading at a premium to its net assets, often reflecting high growth expectations, valuable intangibles, or high returns on assets.</p>
		  <p className="text-sm text-[var(--text-main)]">P/B = 1: The market price is valued exactly in line with the company's accounting net worth.</p>
		  <div className="flex items-start gap-2 pt-1">
			  <Lightbulb className="mt-0.5 w-10 flex-shrink-0 text-[#D4A373]" />
			  <p className="text-sm text-[var(--text-main)]">
				  It is best used when comparing companies within the same sector (e.g., banking or manufacturing), as industries with low physical assets like tech may have high P/B ratios.
			  </p>
		  </div>
	  </div>
  </div>
)


export default function PBRatioGraph({ statement, period }) {
	return (
		<GeneralBarGraph
			statement={statement}
			period={period}
			title="P/B Ratio"
			barName="P/B Ratio"
			dataKey="PBRatio"
			explanation={explanation}
			yDomain={null}
			yTickFormatter={null}
			tooltipFormatter={null}
		/>
	);
}
