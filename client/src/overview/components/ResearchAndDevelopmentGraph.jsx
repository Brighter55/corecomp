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
            Research and development spending measures how much a company invests in new products, technology, and innovation.
        </Typography>
        <Typography variant="explanationTopic">Interpretation</Typography>
        <Stack direction="row" spacing={1}>
            <TrendingUpIcon
                sx={{ color: "green", bgcolor: "white", borderRadius: "10px" }}
            />
            <Typography variant="explanationText">
                An upward trend in R&D spending indicates a strategic commitment to future growth, product differentiation, and technological advancement.
            </Typography>
        </Stack>
        <Stack direction="row" spacing={1}>
            <TrendingDownIcon
                sx={{ color: "red", bgcolor: "white", borderRadius: "10px" }}
            />
            <Typography variant="explanationText">
                A downward trend in R&D expenditure generally suggests that an organization is prioritizing short-term profitability over long-term growth or is facing financial pressure.  It may indicate a shift from a "growth" phase to a "maturity" or "harvesting" phase, where the focus is on maintaining existing products rather than developing new ones.
            </Typography>
        </Stack>
    </Stack>
);

function ResearchAndDevelopmentGraph({ statement, period }) {
    return (
        <GeneralBarGraph
            statement={statement}
            period={period}
            title="Research And Development"
            barName="Research And Development"
            dataKey="researchAndDevelopment"
            explanation={explanation}
        />
    );
}

export default ResearchAndDevelopmentGraph;
