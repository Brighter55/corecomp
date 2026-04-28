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
            Basic shares outstanding are the total shares issued and available for trading in the stock market. This includes shares held by both institutions and individual investors. However, this doesn't include Treasury shares (shares repurchased by the company and held in its treasury).
        </Typography>
        <Typography variant="explanationTopic">Calculation</Typography>
        <Typography variant="explanationText" sx={{ fontFamily: "'Times New Roman', Times, 'Segoe Ui', Arial, sans-serif" }}>Outstanding Shares = Issued shares - Treasury shares</Typography>
        <Typography variant="explanationTopic">Interpretation</Typography>
        <Stack direction="row" spacing={1}>
            <TrendingUpIcon
                sx={{ color: "green", bgcolor: "white", borderRadius: "10px",}}
            />
            <Typography variant="explanationText">
                Shares Outstanding increases when a company is issuing and selling new shares to raise their capital
            </Typography>
        </Stack>
        <Stack direction="row" spacing={1}>
            <TrendingDownIcon
                sx={{ color: "red", bgcolor: "white", borderRadius: "10px",}}
            />
            <Typography variant="explanationText">
                Shares Outstanding decreases when a company repurchases its own shares and holds them as treasury stock. The process is called "Share Buybacks"
            </Typography>
        </Stack>
        <Typography variant="explanationText">
            Shares Outstanding stays stable when a company isn’t raising new capital or aggressively buying back shares.
        </Typography>
    </Stack>
)


function SharesOutstandingGraph({ statement, period }) {
    return (
        <GeneralBarGraph
            statement={statement}
            period={period}
            title="Basic Shares Outstanding"
            barName="Basic Shares Outstanding"
            dataKey="commonStockSharesOutstanding"
            explanation={explanation}
        />
    );
}


export default SharesOutstandingGraph
