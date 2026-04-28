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
            Net income from continuing operations is the profit a company generates from its core, ongoing business activities, excluding one-time events, discontinued segments, or accounting changes. It represents sustainable, recurring earnings, making it a critical metric for investors evaluating a company's true profitability and future performance potential. 
        </Typography>
        <Typography variant="explanationTopic">Interpretation</Typography>
        <Stack direction="row" spacing={1}>
            <TrendingUpIcon
                sx={{ color: "green", bgcolor: "white", borderRadius: "10px" }}
            />
            <Typography variant="explanationText">
                A rising trend indicates rising profitability from core products or services. it could be driven by high demand, strong sales volume, or improved pricing power.
            </Typography>
        </Stack>
        <Stack direction="row" spacing={1}>
            <TrendingDownIcon
                sx={{ color: "red", bgcolor: "white", borderRadius: "10px" }}
            />
            <Typography variant="explanationText">
                A falling trend suggests that the primary business activities are becoming less profitable.
            </Typography>
        </Stack>
        <Typography variant="explanationText">Note: A downward trend might be temporary due to restructuring for long-term growth, while an upward trend might be driven by unsustainable, temporary market conditions.</Typography>
    </Stack>
);

function NetIncomeFromContinuingOperationsGraph({ statement, period }) {
    return (
        <GeneralBarGraph
            statement={statement}
            period={period}
            title="Net Income From Continuing Operations"
            barName="Net Income From Continuing Operations"
            dataKey="netIncomeFromContinuingOperations"
            explanation={explanation}
        />
    );
}

export default NetIncomeFromContinuingOperationsGraph;
