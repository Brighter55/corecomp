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
            EBIT (Earnings Before Interest and Taxes) is a company's operating profit, measuring core profitability by removing financing costs (interest) and tax environments. 
        </Typography>
        <Typography variant="explanationTopic">Calculation</Typography>
        <Typography
            variant="explanationText"
            sx={{ fontFamily: "'Times New Roman', Times, 'Segoe Ui', Arial, sans-serif" }}
        >
            EBIT = Net Income + Interest Expenses + Tax Expenses
        </Typography>
        <Typography variant="explanationTopic">Interpretation</Typography>
        <Stack direction="row" spacing={1}>
            <TrendingUpIcon
                sx={{ color: "green", bgcolor: "white", borderRadius: "10px",}}
            />
            <Typography variant="explanationText">
                A growing EBIT (Earnings Before Interest and Taxes) graph signifies that a company’s core operations are becoming more profitable over time. It shows that the business is successfully generating more operating income from its primary activities
            </Typography>
        </Stack>
        <Stack direction="row" spacing={1}>
            <TrendingDownIcon
                sx={{ color: "red", bgcolor: "white", borderRadius: "10px",}}
            />
            <Typography variant="explanationText">
                a downward trend generally highlights that the business is becoming less efficient at turning revenue into profit through its daily operations. 
            </Typography>
        </Stack>
    </Stack>
)

function EbitGraph({ statement, period }) {
    return (
        <GeneralBarGraph
            statement={statement}
            period={period}
            title="EBIT"
            barName="EBIT"
            dataKey="ebit"
            explanation={explanation}
        />
    );
}


export default EbitGraph
