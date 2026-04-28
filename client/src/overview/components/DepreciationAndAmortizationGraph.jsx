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
            Depreciation and amortization are accounting methods used to spread the cost
            of an asset over its useful life, acting as non-cash tax deductions that reduce
            taxable income. Depreciation applies to tangible assets (machinery, buildings),
            while amortization applies to intangible assets (patents, copyrights).
            Both help match expenses with the revenue the assets generate.
        </Typography>
        <Typography
            variant="explanationText"
            sx={{ fontFamily: "'Times New Roman', Times, 'Segoe Ui', Arial, sans-serif" }}
        >
            Depreciation = (Purchase Price - Salvage Value) / Useful Life
        </Typography>
        <Typography
            variant="explanationText"
            sx={{ fontFamily: "'Times New Roman', Times, 'Segoe Ui', Arial, sans-serif" }}
        >
            Amortization = Initial cost / Useful Life
        </Typography>
        <Typography variant="explanationTopic">Interpretation</Typography>
        <Stack direction="row" spacing={1}>
            <TrendingUpIcon
                sx={{ color: "green", bgcolor: "white", borderRadius: "10px",}}
            />
            <Typography variant="explanationText">
                Upward trend suggests the company is actively purchasing new, expensive equipment or acquiring other businesses (high capital expenditures). While this lowers immediate net income, it often indicates expected future growth and technological upgrades.
            </Typography>
        </Stack>
        <Stack direction="row" spacing={1}>
            <TrendingDownIcon
                sx={{ color: "red", bgcolor: "white", borderRadius: "10px",}}
            />
            <Typography variant="explanationText">
                Downward trend suggests the company is investing less, has older, fully depreciated assets, or is using assets with longer lifespans. This boosts net income, but may indicate a need for future investment or aging infrastructure.
            </Typography>
        </Stack>
    </Stack>
)

function DepreciationAndAmortizationGraph({ statement, period }) {
    return (
        <GeneralBarGraph
            statement={statement}
            period={period}
            title="Depreciation & Amortization"
            barName="Depreciation & Amortization"
            dataKey="depreciationDepletionAndAmortization"
            explanation={explanation}
        />
    );
}

export default DepreciationAndAmortizationGraph
