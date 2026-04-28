import GeneralBarGraph from "./GeneralBarGraph.jsx";
// mui
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';


const explanation = (
    <Stack spacing={2}>
        <Typography variant="explanationTopic">What is it?</Typography>
        <Typography variant="explanationText">
            EBITDA (Earnings Before Interest, Taxes, Depreciation, and Amortization) is a measure of a company's core operational profitability, showing how much cash it generates from operations alone.
        </Typography>
        <Typography variant="explanationTopic">Calculation</Typography>
        <Typography
            variant="explanationText"
            sx={{ fontFamily: "'Times New Roman', Times, 'Segoe Ui', Arial, sans-serif" }}
        >
            EBITDA = EBIT + Depreciation + Amortization
        </Typography>
        <Typography variant="explanationTopic">Interpretation</Typography>
        <Stack direction="row" spacing={1}>
            <TrendingUpIcon
                sx={{ color: "green", bgcolor: "white", borderRadius: "10px",}}
            />
            <Typography variant="explanationText">
                Rising EBITDA (Earnings Before Interest, Taxes, Depreciation, and Amortization) trend signifies strengthening operational performance, high profitability, and improved scalability. It indicates a company is generating consistent cash flow from its core operations
            </Typography>
        </Stack>
        <Stack direction="row" spacing={1}>
            <TrendingDownIcon
                sx={{ color: "red", bgcolor: "white", borderRadius: "10px",}}
            />
            <Typography variant="explanationText">
                A downward EBITDA trend indicates declining operational profitability, signaling that a company is struggling to cover core expenses, which often leads to reduced valuation and cash flow strain.
            </Typography>
        </Stack>
    </Stack>
)

function EbitdaGraph({ statement, period }) {
    return (
        <GeneralBarGraph
            statement={statement}
            period={period}
            title="EBITDA"
            barName="EBITDA"
            dataKey="ebitda"
            explanation={explanation}
        />
    );
}


export default EbitdaGraph