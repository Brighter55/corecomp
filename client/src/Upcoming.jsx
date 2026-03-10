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
                        <Typography variant="h5" fontWeight="bold">Upcoming Version: 0.2.0 (???)</Typography>
                        <Typography variant="body1"> - more graphs</Typography>
                    </Stack>
                    <Stack spacing={2}>
                        <Typography variant="h5" fontWeight="bold">Current Version: 0.1.0 (3/9/2026)</Typography>
                        <Typography variant="body1"> - first deployment</Typography>
                    </Stack>
                </Stack>
                <Footer></Footer>
            </Stack>
        </Container>
    )
}

export default Upcoming;