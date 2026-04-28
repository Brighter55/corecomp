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
            Cost of revenue is the total direct expense a company incurs to produce,
            sell, and deliver its goods or services to customers.
            It represents the direct costs—such as raw materials, direct labor, and shipping
        </Typography>
        <Typography variant="explanationTopic">Calculation</Typography>
        <Typography
            variant="explanationText"
            sx={{ fontFamily: "'Times New Roman', Times, 'Segoe Ui', Arial, sans-serif" }}
        >
            COR = cost of labor + materials + marketing + distribution + sales discounts
        </Typography>
        <Typography variant="explanationTopic">Interpretation</Typography>
        <Stack direction="row" spacing={1}>
            <TrendingUpIcon
                sx={{ color: "green", bgcolor: "white", borderRadius: "10px" }}
            />
            <Typography variant="explanationText">
                An upward trend can signal rising input costs or expansion in sales volume that requires more spending.
            </Typography>
        </Stack>
        <Stack direction="row" spacing={1}>
            <TrendingDownIcon
                sx={{ color: "red", bgcolor: "white", borderRadius: "10px" }}
            />
            <Typography variant="explanationText">
                A downward trend can indicate better cost control or reduced production activity.
            </Typography>
        </Stack>
    </Stack>
);

function CostOfRevenueGraph({ statement, period }) {
    return (
        <GeneralBarGraph
            statement={statement}
            period={period}
            title="Cost Of Revenue"
            barName="Cost Of Revenue"
            dataKey="costOfRevenue"
            explanation={explanation}
        />
    );
}

export default CostOfRevenueGraph;