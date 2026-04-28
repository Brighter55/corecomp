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
            Change in inventory measures how much inventory (unsold goods) increased or decreased during the period. It reflects how well the company is managing supply relative to demand.
        </Typography>
        <Typography variant="explanationTopic">Calculation</Typography>
        <Typography
            variant="explanationText"
            sx={{ fontFamily: "'Times New Roman', Times, 'Segoe Ui', Arial, sans-serif" }}
        >
            Change in Inventory = Ending Inventory – Beginning Inventory
        </Typography>
        <Typography variant="explanationTopic">Interpretation</Typography>
        <Stack direction="row" spacing={1}>
            <TrendingUpIcon
                sx={{ color: "green", bgcolor: "white", borderRadius: "10px",}}
            />
            <Typography variant="explanationText">
                Rising inventory can mean the company expects higher demand in the future (preparing stock). However, if sales are not increasing, it may signal weak demand and unsold products building up.
            </Typography>
        </Stack>
        <Stack direction="row" spacing={1}>
            <TrendingDownIcon
                sx={{ color: "red", bgcolor: "white", borderRadius: "10px",}}
            />
            <Typography variant="explanationText">
                Falling inventory usually means strong sales or better inventory management. But if inventory drops too much, the company might not be able to meet demand, leading to lost sales.
            </Typography>
        </Stack>
    </Stack>
)

function ChangeInInventoryGraph({ statement, period }) {
    return (
        <GeneralBarGraph
            statement={statement}
            period={period}
            title="Change in Inventory"
            barName="Change in Inventory"
            dataKey="changeInInventory"
            explanation={explanation}
        />
    );
}

export default ChangeInInventoryGraph
