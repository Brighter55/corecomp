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
            Operating expenses are the day-to-day costs required to run the business, excluding direct production costs.
        </Typography>
        <Typography variant="explanationTopic">Interpretation</Typography>
        <Stack direction="row" spacing={1}>
            <TrendingUpIcon
                sx={{ color: "green", bgcolor: "white", borderRadius: "10px" }}
            />
            <Typography variant="explanationText">
                An upward trend indicates rising costs, which can signal growth or inefficiency
            </Typography>
        </Stack>
        <Stack direction="row" spacing={1}>
            <TrendingDownIcon
                sx={{ color: "red", bgcolor: "white", borderRadius: "10px" }}
            />
            <Typography variant="explanationText">
                A downward trend indicates falling costs, suggesting improved efficiency or reduced business activity
            </Typography>
        </Stack>
        <Typography variant="explanationText">
                Note: Growth and Expansion (Positive): If operating expenses are rising, but revenue is growing faster, it suggests the company is investing in growth (e.g., higher marketing spend, opening new locations, or increasing headcount).
                Inefficiency and Declining Margins (Negative): If expenses rise while revenue is flat or declining, this indicates a dangerous increase in costs that reduces profitability.
        </Typography>
        
    </Stack>
);

function OperatingExpensesGraph({ statement, period }) {
    return (
        <GeneralBarGraph
            statement={statement}
            period={period}
            title="Operating Expenses"
            barName="Operating Expenses"
            dataKey="operatingExpenses"
            explanation={explanation}
        />
    );
}

export default OperatingExpensesGraph;
