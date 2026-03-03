import Typography from "@mui/material/Typography"
import LandingHeader from "./headers/LandingHeader"
import Stack from "@mui/material/Stack"
import Footer from "./shared/Footer"
import Container from "@mui/material/Container"
import Link from "@mui/material/Link"
import Divider from "@mui/material/Divider"


function TermsOfService() {
    return (
        <Container maxWidth="lg">
            <Stack spacing={10}>
                <LandingHeader></LandingHeader>
                <Stack spacing={3}>
                    <Stack spacing={2}>
                        <Typography variant="h2" fontWeight="bold">Terms of Service</Typography>
                        <Typography variant="h5" color="grey">Last updated: 3/2/26</Typography>
                    </Stack>
                    <Typography variant="h5">By using this application, you agree to the following</Typography>
                    <Stack spacing={1}>
                        <Typography variant="body1">You will use the service lawfully</Typography>
                        <Typography varaint="body1">The service is provided “as is” with no warranties</Typography>
                        <Typography variant="body1">We may suspend or terminate accounts for misuse</Typography>
                        <Typography varaint="body1">We are not liable for damages resulting from use of the service</Typography>
                    </Stack>
                    <Typography>These terms may be updated at any time</Typography>
                </Stack>
                <Footer></Footer>
            </Stack>
        </Container>
    )
}

export default TermsOfService