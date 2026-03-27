import Typography from "@mui/material/Typography"
import LandingHeader from "./headers/LandingHeader"
import Stack from "@mui/material/Stack"
import Footer from "./shared/Footer"
import Container from "@mui/material/Container"


function Upcoming() {
    return (
        <Container maxWidth="lg">
            <Stack spacing={10}>
                <LandingHeader></LandingHeader>
                <Stack spacing={3}>
                    <Stack spacing={2}>
                        <Typography variant="h5" fontWeight="bold">Upcoming Version: 0.3.0 (???)</Typography>
                        <Typography variant="body1"> - more features</Typography>
                    </Stack>
                    <Stack spacing={2}>
                        <Typography variant="h5" fontWeight="bold">Current Version: 0.2.0 (3/26/2026)</Typography>
                        <Stack spacing={1}>
                            <Typography variant="body1"> - EBIT graph</Typography>
                            <Typography variant="body1"> - EBITDA graph</Typography>
                            <Typography variant="body1"> - Return on Equity graph</Typography>
                            <Typography variant="body1"> - P/E ratio graph</Typography>
                            <Typography variant="body1"> - P/B ratio graph</Typography>
                        </Stack>
                    </Stack>
                    <Stack spacing={2}>
                        <Typography variant="h5" fontWeight="bold">Version: 0.1.0 (3/9/2026)</Typography>
                        <Typography variant="body1"> - first deployment</Typography>
                    </Stack>
                </Stack>
                <Footer></Footer>
            </Stack>
        </Container>
    )
}

export default Upcoming;