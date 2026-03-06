import Typography from "@mui/material/Typography"
import LandingHeader from "./headers/LandingHeader"
import Stack from "@mui/material/Stack"
import Footer from "./shared/Footer"
import Container from "@mui/material/Container"
import Link from "@mui/material/Link"
import Divider from "@mui/material/Divider"


function PrivacyPolicy() {
    return (
        <Container maxWidth="lg">
            <Stack spacing={10}>
                <LandingHeader></LandingHeader>
                <Stack spacing={3}>
                    <Stack spacing={2}>
                        <Typography variant="h2" fontWeight="bold">Privacy Policy</Typography>
                        <Typography variant="h5" color="grey">Last updated: 3/2/26</Typography>
                    </Stack>
                    <Typography variant="body1">This application collects basic user information to provide authentication and core features.</Typography>
                    <Divider sx={{ borderColor: "rgba(218, 215, 205, 0.5)" }}></Divider>
                    <Typography variant="h5">Information we collect</Typography>
                    <Stack spacing={1}>
                        <Typography variant="body1">If you sign in using Google, we may collect: email address</Typography>
                        <Typography varaint="body1">If you sign in using our registration, we may collect: username, email address, and password (hashed)</Typography>
                    </Stack>
                    <Divider sx={{ borderColor: "rgba(218, 215, 205, 0.5)" }}></Divider>
                    <Typography variant="h5">How we use these informations</Typography>
                    <Typography vatiant="body1">These informations are neccessary to create and authenticate user accounts, and provide app functionality</Typography>
                    <Divider sx={{ borderColor: "rgba(218, 215, 205, 0.5)" }}></Divider>
                    <Typography variant="h5">Google User Data</Typography>
                    <Typography vatiant="body1">Our use of information received from Google APIs adheres to the Google API Services User Data Policy, including the Limited Use requirements.</Typography>
                    <Divider sx={{ borderColor: "rgba(218, 215, 205, 0.5)" }}></Divider>
                    <Typography variant="h5">Data Sharing</Typography>
                    <Typography vatiant="body1">We do not sell or share your personal data with third parties.</Typography>
                    <Divider sx={{ borderColor: "rgba(218, 215, 205, 0.5)" }}></Divider>
                    <Typography variant="h5">Data Storage & Security</Typography>
                    <Typography vatiant="body1">We take reasonable measures to protect user data, but no system is 100% secure.</Typography>
                    <Divider sx={{ borderColor: "rgba(218, 215, 205, 0.5)" }}></Divider>
                    <Typography variant="h5">Contact</Typography>
                    <Typography vatiant="body1">If you have any concerns, contact us at <Link href="mailto: support@corecomp.cc" color="var(--main-brown)" fontWeight="bold">support@corecomp.cc</Link></Typography>
                </Stack>
                <Footer></Footer>
            </Stack>
        </Container>
    )
}

export default PrivacyPolicy