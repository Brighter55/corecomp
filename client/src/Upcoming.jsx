import Typography from "@mui/material/Typography"
import LandingHeader from "./headers/LandingHeader"
import Stack from "@mui/material/Stack"
import Footer from "./shared/Footer"
import Container from "@mui/material/Container"

const versions = [
    {
        name: "Current Version",
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
        <Container maxWidth="lg">
            <Stack spacing={10}>
                <LandingHeader></LandingHeader>
                <Stack spacing={3}>
                    {versions.map((release) => (
                        <Stack spacing={2} key={release.version}>
                            <Typography variant="h5" fontWeight="bold">
                                {release.name}: {release.version} ({release.date})
                            </Typography>
                            <Stack spacing={1}>
                                {release.updates.map((item) => (
                                    <Typography variant="body1" key={item}>
                                        {` - ${item}`}
                                    </Typography>
                                ))}
                            </Stack>
                        </Stack>
                    ))}
                </Stack>
                <Footer></Footer>
            </Stack>
        </Container>
    )
}

export default Upcoming;