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
            Gross profit is the money a company keeps after subtracting the direct costs of producing goods or services from revenue.
        </Typography>
        <Typography variant="explanationTopic">Calculation</Typography>
        <Typography
            variant="explanationText"
            sx={{ fontFamily: "'Times New Roman', Times, 'Segoe Ui', Arial, sans-serif" }}
        >
            Gross Profit = Total Revenue - Cost of Goods Sold (COGS)
        </Typography>
        <Typography variant="explanationTopic">Interpretation</Typography>
        <Stack direction="row" spacing={1}>
            <TrendingUpIcon
                sx={{ color: "green", bgcolor: "white", borderRadius: "10px" }}
            />
            <Typography variant="explanationText">
                An increasing gross profit indicates that revenue is growing faster than the cost of producing goods, or that production costs are being reduced. 
            </Typography>
        </Stack>
        <Stack direction="row" spacing={1}>
            <TrendingDownIcon
                sx={{ color: "red", bgcolor: "white", borderRadius: "10px" }}
            />
            <Typography variant="explanationText">
                A decreasing gross profit indicates that direct production costs are rising faster than revenue, or that sales are declining while costs remain stagnant.
            </Typography>
        </Stack>
    </Stack>
);

function GrossProfitGraph({ statement, period }) {
    return (
        <GeneralBarGraph
            statement={statement}
            period={period}
            title="Gross Profit"
            barName="Gross Profit"
            dataKey="grossProfit"
            explanation={explanation}
        />
    );
}

export default GrossProfitGraph;