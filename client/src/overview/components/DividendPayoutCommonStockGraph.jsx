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
            A dividend payout represents the actual cash a company pays to its shareholders from its profits.
        </Typography>
        <Typography variant="explanationTopic">Interpretation</Typography>
        <Stack direction="row" spacing={1}>
            <TrendingUpIcon
                sx={{ color: "green", bgcolor: "white", borderRadius: "10px",}}
            />
            <Typography variant="explanationText">
                A rising dividend payout usually signals strong and stable cash flow. It often means management is confident the business can keep generating enough money to support these payments. Common in mature, slow-growth companies.
            </Typography>
        </Stack>
        <Stack direction="row" spacing={1}>
            <TrendingDownIcon
                sx={{ color: "red", bgcolor: "white", borderRadius: "10px",}}
            />
            <Typography variant="explanationText">
                A declining or eliminated dividend can signal trouble (cash flow issues, declining profits) or a strategic shift (reinvesting money back into growth instead of paying shareholders).
            </Typography>
        </Stack>
    </Stack>
)

function DividendPayoutCommonStockGraph({ statement, period }) {
    return (
        <GeneralBarGraph
            statement={statement}
            period={period}
            title="Dividend Payout (Common Stock)"
            barName="Dividend Payout (Common Stock)"
            dataKey="dividendPayoutCommonStock"
            explanation={explanation}
        />
    );
}

export default DividendPayoutCommonStockGraph
