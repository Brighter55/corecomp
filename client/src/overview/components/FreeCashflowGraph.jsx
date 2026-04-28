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
            Free Cash Flow (FCF) is the cash a company has left over after paying for its day-to-day operations and the essential investments (capital expenditures) needed to maintain and grow the business. It is essentially the "extra" money a company can use for things like paying dividends, buying back stock, paying off debt, or making acquisitions without disrupting its ongoing operations.
        </Typography>
        <Typography variant="explanationTopic">Calculation</Typography>
        <Typography
            variant="explanationText"
            sx={{ fontFamily: "'Times New Roman', Times, 'Segoe Ui', Arial, sans-serif" }}
        >
            FCF = Operating Cash Flow - Capital Expenditures
        </Typography>
        <Typography variant="explanationTopic">Interpretation</Typography>
        <Stack direction="row" spacing={1}>
            <TrendingUpIcon
                sx={{ color: "green", bgcolor: "white", borderRadius: "10px",}}
            />
            <Typography variant="explanationText">
                Upward trend in FCF generally signals a strong, healthy, and efficiently managed business.
            </Typography>
        </Stack>
        <Stack direction="row" spacing={1}>
            <TrendingDownIcon
                sx={{ color: "red", bgcolor: "white", borderRadius: "10px",}}
            />
            <Typography variant="explanationText">
                Downward trend in FCF could signify that the company may be struggling to generate enough cash from operations to cover its basic expenses and investments.
            </Typography>
        </Stack>
        <Typography variant="explanationText">
            Temporary Dips in Growth Companies: Rapidly expanding companies may temporarily show low or negative FCF as they heavily invest in capital expenditures, such as building new factories or technology infrastructure. In these cases, investors should focus on the long-term strategy and whether the investments are expected to generate high returns in the future.
        </Typography>
    </Stack>
)


function FreeCashflowGraph({ statement, period }) {
    return (
        <GeneralBarGraph
            statement={statement}
            period={period}
            title="Free Cash Flow"
            barName="Free Cash Flow"
            dataKey="freeCashFlow"
            explanation={explanation}
        />
    );
}


export default FreeCashflowGraph
