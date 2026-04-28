import GeneralBarGraph from "./GeneralBarGraph.jsx";
// mui
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';

export const explanation = (
    <Stack spacing={2}>
        <Typography variant="explanationTopic">What is it?</Typography>
        <Typography variant="explanationText">
            Capital expenditure (CapEx) is the money a company spends on long-term physical assets like property, buildings, and machinery.
        </Typography>
        <Typography variant="explanationTopic">Calculation</Typography>
        <Typography
            variant="explanationText"
            sx={{ fontFamily: "'Times New Roman', Times, 'Segoe Ui', Arial, sans-serif" }}
        >
            CapEx = (Ending PP&E - Beginning PP&E) + Depreciation Expense
        </Typography>
        <Typography variant="explanationTopic">Interpretation</Typography>
        <Stack direction="row" spacing={1}>
            <TrendingUpIcon
                sx={{ color: "green", bgcolor: "white", borderRadius: "10px",}}
            />
            <Typography variant="explanationText">
                Upward trend often signifies expansion, investment in new technology, or replacement of aging equipment, suggesting the company is growing or trying to increase efficiency
            </Typography>
        </Stack>
        <Stack direction="row" spacing={1}>
            <TrendingDownIcon
                sx={{ color: "red", bgcolor: "white", borderRadius: "10px",}}
            />
            <Typography variant="explanationText">
                Downward trend can mean reduced investment in assets, which could signal market uncertainty, reduced growth prospects, or that the company is in a mature phase.
            </Typography>
        </Stack>
    </Stack>
)


function CapitalExpendituresGraph({ statement, period }) {
    return (
        <GeneralBarGraph
            statement={statement}
            period={period}
            title="Capital Expenditures"
            barName="Capital Expenditures"
            dataKey="capitalExpenditures"
            explanation={explanation}
        />
    );
}


export default CapitalExpendituresGraph
