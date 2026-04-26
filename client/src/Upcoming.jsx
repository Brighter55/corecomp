import LandingHeader from "./headers/LandingHeader.tsx";
import Footer from "./shared/Footer.tsx";

const versions = [
    {
        name: "Current Version",
        version: "0.6.0",
        date: "04/08/2026",
        updates: [
            "Current Ratio graph",
            "Quick Ratio graph",
            "Debt/Equity Ratio graph",
            "Return on Assets (ROA) graph",
            "Price-to-Sales (P/S) Ratio graph",
            "Price-to-Free Cash Flow (P/FCF) Ratio graph",
            "Implement collapsible graph sections",
        ],
    },
    {
        name: "Version",
        version: "0.5.0",
        date: "04/05/2026",
        updates: [
            "Cash Flow Trifecta graph",
            "Cash Flow From Financing graph",
            "Cash Flow From Investment graph",
            "Change in Inventory graph",
            "D&A graph",
            "Dividend Payout Common Stock graph",
            "Net Income Vs OCF graph",
        ],
    },
    {
        name: "Version",
        version: "0.4.0",
        date: "04/03/2026",
        updates: [
            "Cost of Revenue graph",
            "Debt Structure graph",
            "Gross Profit graph",
            "Market Cap graph",
            "Net Income from Continuing Operations graph",
            "Operating Expenses graph",
            "Retained Earnings vs Capital-Paid in graph",
            "Research & Development graph",
            "Total Assets graph"
        ],
    },
    {
        name: "Version",
        version: "0.3.0",
        date: "03/29/2026",
        updates: [
            "Beta coefficient diagram",
            "refactor codebase for performance purpose",
        ],
    },
    {
        name: "Version",
        version: "0.2.0",
        date: "03/26/2026",
        updates: [
            "EBIT graph",
            "EBITDA graph",
            "Return on Equity graph",
            "P/E ratio graph",
            "P/B ratio graph",
        ],
    },
    {
        name: "Version",
        version: "0.1.0",
        date: "03/9/2026",
        updates: ["first deployment"],
    },
]


function Upcoming() {
    return (
        <div className="min-h-screen pb-12">
            <LandingHeader />
            <div className="mx-auto max-w-6xl px-4">
                <div className="space-y-10">
                    <div className="space-y-6">
                        {versions.map((release) => (
                            <div className="space-y-2" key={release.version}>
                                <h2 className="text-2xl font-bold">
                                    {release.name}: {release.version} ({release.date})
                                </h2>
                                <div className="space-y-1">
                                    {release.updates.map((item) => (
                                        <p className="text-base" key={item}>
                                            {` - ${item}`}
                                        </p>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                    <Footer />
                </div>
            </div>
        </div>
    )
}

export default Upcoming;