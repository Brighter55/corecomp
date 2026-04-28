import GeneralBarGraph from "./GeneralBarGraph.jsx";
import { TrendingUp, TrendingDown } from "lucide-react";

const explanation = (
  <div className="space-y-3">
    <p className="text-sm font-bold text-[var(--text-main)]">What is it?</p>
    <p className="text-sm text-[var(--text-main)]">
      Market capitalization represents the market&apos;s total valuation of a company and is used to determine a
      company&apos;s size, risk, and growth potential.
    </p>

    <p className="text-sm font-bold text-[var(--text-main)]">Calculation</p>
    <p className="text-sm text-[var(--text-main)]">Market Cap = Share Price * Shares Outstanding</p>

    <p className="text-sm font-bold text-[var(--text-main)]">Interpretation</p>
    <div className="flex items-start gap-2">
      <TrendingUp className="mt-0.5 w-10 text-green-600 rounded-md" />
      <p className="text-sm text-[var(--text-main)]">
        A rising market cap usually means investors are valuing the company more highly, often due to growth
        expectations or stronger fundamentals.
      </p>
    </div>
    <div className="flex items-start gap-2">
      <TrendingDown className="mt-0.5 w-10 rounded text-red-600" />
      <p className="text-sm text-[var(--text-main)]">
        A falling market cap can signal weaker market sentiment, earnings pressure, or broader risk-off conditions.
      </p>
    </div>
  </div>
);


export default function MarketCapGraph({ statement, period }) {
	return (
		<GeneralBarGraph
			statement={statement}
			period={period}
			title="Market Cap"
			barName="Market Cap"
			dataKey="marketCap"
			explanation={explanation}
			yDomain={null}
		/>
	);
}
