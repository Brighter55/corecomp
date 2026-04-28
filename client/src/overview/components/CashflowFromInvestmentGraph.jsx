import GeneralBarGraph from "./GeneralBarGraph.jsx";
// mui
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

const explanation = (
    <Stack spacing={2}>
        <Typography variant="explanationTopic">What is it?</Typography>
        <Typography variant="explanationText">
            Cash flow from investment (CFI) reflects a company's long-term asset purchases (outflow) or sales (inflow).
        </Typography>
        <Typography variant="explanationTopic">Calculation</Typography>
        <Typography
            variant="explanationText"
            sx={{ fontFamily: "'Times New Roman', Times, 'Segoe Ui', Arial, sans-serif" }}
        >
            CFI = Sale of Assets/Investments - Purchase of Assets/Investments
        </Typography>
        <Typography variant="explanationTopic">Interpretation</Typography>
        <Stack direction="row" spacing={1}>
            <TrendingUpIcon
                sx={{ color: "green", bgcolor: "white", borderRadius: "10px",}}
            />
            <Typography variant="explanationText">
                An upward trend (becoming less negative or positive) usually indicates reduced capital spending or asset divestiture
            </Typography>
        </Stack>
        <Stack direction="row" spacing={1}>
            <TrendingDownIcon
                sx={{ color: "red", bgcolor: "white", borderRadius: "10px",}}
            />
            <Typography variant="explanationText">
                A downward trend (becoming more negative) indicates aggressive investment in growth, property, or acquisitions.
            </Typography>
        </Stack>
    </Stack>
)

function CashflowFromInvestmentGraph({ statement, period }) {
    return (
        <GeneralBarGraph
            statement={statement}
            period={period}
            title="Cashflow from Investment"
            barName="Cashflow from Investment"
            dataKey="cashflowFromInvestment"
            explanation={explanation}
        />
    );
}

export default CashflowFromInvestmentGraph
