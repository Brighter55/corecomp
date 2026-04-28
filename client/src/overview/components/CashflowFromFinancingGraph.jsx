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
            Cash Flow from Financing (CFF) activities section on a cash flow statement reports the net flow of cash between a company and its owners (shareholders) and creditors. It highlights how a business funds itself, showing money raised through issuing stock or debt (inflows) and money spent on dividends, share buybacks, or debt repayment (outflows).
        </Typography>
        <Typography variant="explanationTopic">Calculation</Typography>
        <Typography
            variant="explanationText"
            sx={{ fontFamily: "'Times New Roman', Times, 'Segoe Ui', Arial, sans-serif" }}
        >
            CFF = Cash Inflows from Issuing Equity or Debt - (Dividends Paid + Repurchase of Debt and Equity)
        </Typography>
        <Typography variant="explanationTopic">Interpretation</Typography>
        <Stack direction="row" spacing={1}>
            <TrendingUpIcon
                sx={{ color: "green", bgcolor: "white", borderRadius: "10px",}}
            />
            <Typography variant="explanationText">
                A positive trend shows the company is receiving more cash from lenders or investors than it is paying out. It usually signifies raising capital for growth, typical for young, expanding firms.
            </Typography>
        </Stack>
        <Stack direction="row" spacing={1}>
            <TrendingDownIcon
                sx={{ color: "red", bgcolor: "white", borderRadius: "10px",}}
            />
            <Typography variant="explanationText">
                A downward trend (negative/decreasing) often indicates a mature company paying down debt or rewarding shareholders through buybacks or dividends.
            </Typography>
        </Stack>
    </Stack>
)

function CashflowFromFinancingGraph({ statement, period }) {
    return (
        <GeneralBarGraph
            statement={statement}
            period={period}
            title="Cashflow from Financing"
            barName="Cashflow from Financing"
            dataKey="cashflowFromFinancing"
            explanation={explanation}
        />
    );
}

export default CashflowFromFinancingGraph
