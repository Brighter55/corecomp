import GeneralBarGraph from "./GeneralBarGraph.jsx";
import { TrendingUp, TrendingDown } from "lucide-react";

const explanation = (
    <div className="space-y-3">
        <p className="text-sm font-bold text-[var(--text-main)]">What is it?</p>
        <p className="text-sm text-[var(--text-main)]">
            Basic shares outstanding are the total shares issued and available for trading in the stock market. This includes shares held by both institutions and individual investors. However, this doesn't include Treasury shares (shares repurchased by the company and held in its treasury).
        </p>
        <p className="text-sm font-bold text-[var(--text-main)]">Calculation</p>
        <p className="text-sm font-mono text-[var(--text-main)]">Outstanding Shares = Issued shares - Treasury shares</p>
        <p className="text-sm font-bold text-[var(--text-main)]">Interpretation</p>
        <div className="flex items-start gap-2">
            <TrendingUp className="mt-0.5 w-10 rounded-md text-green-600" />
            <p className="text-sm text-[var(--text-main)]">
                Shares Outstanding increases when a company is issuing and selling new shares to raise their capital
            </p>
        </div>
        <div className="flex items-start gap-2">
            <TrendingDown className="mt-0.5 w-10 rounded-md text-red-600" />
            <p className="text-sm text-[var(--text-main)]">
                Shares Outstanding decreases when a company repurchases its own shares and holds them as treasury stock. The process is called "Share Buybacks"
            </p>
        </div>
        <p className="text-sm text-[var(--text-main)]">
            Shares Outstanding stays stable when a company isn’t raising new capital or aggressively buying back shares.
        </p>
    </div>
)


function SharesOutstandingGraph({ statement, period }) {
    return (
        <GeneralBarGraph
            statement={statement}
            period={period}
            title="Basic Shares Outstanding"
            barName="Basic Shares Outstanding"
            dataKey="commonStockSharesOutstanding"
            explanation={explanation}
        />
    );
}


export default SharesOutstandingGraph
