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
            Operating cash flow is the actual cash a company recieves or spends from its normal, day-to-day business activities—selling products, providing services, paying suppliers, covering wages, etc.
        </Typography>
        <Typography variant="explanationTopic">Calculation</Typography>
        <Typography
            variant="explanationText"
            sx={{ fontFamily: "'Times New Roman', Times, 'Segoe Ui', Arial, sans-serif" }}
        >
            Operating Cash Flow = Net Income + Depreciation + Changes in Working capital
        </Typography>
        <Typography variant="explanationTopic">Interpretation</Typography>
        <Stack direction="row" spacing={1}>
            <TrendingUpIcon
                sx={{ color: "green", bgcolor: "white", borderRadius: "10px",}}
            />
            <Typography variant="explanationText">
                Upward Trend means the company is consistently bringing in more cash from its regular business than it is spending, indicating a healthy, efficient, and potentially growing business.
            </Typography>
        </Stack>
        <Stack direction="row" spacing={1}>
            <TrendingDownIcon
                sx={{ color: "red", bgcolor: "white", borderRadius: "10px",}}
            />
            <Typography variant="explanationText">
                Downward Trend means the company is consistently bringing in less cash from operations or spending more, which could signal underlying operational issues or a need for external funding to stay afloat.
            </Typography>
        </Stack>
        <Typography variant="explanationText">
            Positive Cash Flow means cash coming in is higher than cash going out over a period, allowing the business to pay bills, invest in growth, and handle expenses.
        </Typography>
        <Typography variant="explanationText">
            Negative Cash Flow means cash going out is higher than cash coming in, which, if it continues for a long time, can be a warning sign of financial trouble.
        </Typography>
    </Stack>
)


function OperatingCashflowGraph({ statement, period }) {
    return (
        <GeneralBarGraph
            statement={statement}
            period={period}
            title="Operating Cash Flow"
            barName="Operating Cash flow"
            dataKey="operatingCashflow"
            explanation={explanation}
        />
    );
}


export default OperatingCashflowGraph
