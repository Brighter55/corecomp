// mui
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import { styled } from '@mui/material/styles';

const FundamentalColumn = styled(Stack)({
    flex: 1,
    alignItems: "center",
});

const Fact = styled(Box)({
    display: "flex",
    justifyContent: "space-between",
});

function Fundamentals() {

    return (
        <Stack
            direction={{ xs: "column", sm: "row" }}
            divider={ <Divider orientation="horizontal" flexItem sx={{ backgroundColor: "white" }}/> }
            sx={{ width: "100%" }}
            spacing={2}
        >
            <FundamentalColumn>
                <Typography variant="h5">Core Metrics</Typography>
                <Stack sx={{ width: "100%" }} spacing={2}>
                    <Fact>
                        <Typography variant="h6">PE</Typography>
                        <Typography variant="h6">37</Typography>
                    </Fact>
                    <Fact>
                        <Typography variant="h6">Market Cap</Typography>
                        <Typography variant="h6">3.80T</Typography>
                    </Fact>
                    <Fact>
                        <Typography variant="h6">Dividend Yield</Typography>
                        <Typography variant="h6">0.71%</Typography>
                    </Fact>
                </Stack>
            </FundamentalColumn>
            <FundamentalColumn>
                <Typography variant="h5">Financials</Typography>
                <Stack sx={{ width: "100%" }} spacing={2}>
                    <Fact>
                        <Typography variant="h6">Cash</Typography>
                        <Typography variant="h6">100 B</Typography>
                    </Fact>
                    <Fact>
                        <Typography variant="h6">Debt</Typography>
                        <Typography variant="h6">50 B</Typography>
                    </Fact>
                    <Fact>
                        <Typography variant="h6">Dividend Yield</Typography>
                        <Typography variant="h6">0.71%</Typography>
                    </Fact>
                </Stack>
            </FundamentalColumn>
        </Stack>
    )
}

export default Fundamentals
