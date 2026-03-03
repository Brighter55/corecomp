import Brand from "./Brand.jsx"
// mui compoenents
import Divider from '@mui/material/Divider';
import { styled } from '@mui/material/styles';
import Stack from '@mui/system/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
// images
import facebookLogo from "../assets/facebookLogo.png"
import tiktokLogo from "../assets/tiktokLogo.png"
import youtubeLogo from "../assets/youtubeLogo.png"

const StyledImg = styled("img")({
    width: "2rem",
    height: "2rem",
    borderRadius: "50%",
    "&:hover": {
        transform: "translateY(-3px)",
    },
});

function Footer() {
    return (
        <Stack spacing={3}>
            <Divider sx={{ borderColor: "rgba(218, 215, 205, 0.5)" }}></Divider>
            <Box
                sx={{
                    display: "flex",
                    flexDirection: {xs: "column", sm: "row"},
                    gap: "1rem",
                    justifyContent: "space-between",
                }}
            >
                <Brand variant="landing" />
                <Stack direction="row" spacing={8}>
                    <Stack spacing={1}>
                        <Typography variant="h6">Support</Typography>
                        <Link href="mailto: support@corecomp.com" color="inherit">
                            Contact Us
                        </Link>
                    </Stack>
                    <Stack spacing={1}>
                        <Typography variant="h6">Legal</Typography>
                        <Stack spacing={1}>
                            <Link href="https://www.corecomp.cc/privacy-policy" color="inherit" cursor="pointer">Privacy Policy</Link>
                            <Link href="https://www.corecomp.cc/tos" color="inherit" cursor="pointer">Terms of Service</Link>
                        </Stack>
                    </Stack>
                </Stack>
            </Box>
            <Divider sx={{ borderColor: "rgba(218, 215, 205, 0.5)" }}></Divider>
            <Stack direction="row" spacing={1} sx={{ justifyContent: "center" }}>
                    <Link href="/"><StyledImg src={facebookLogo} alt="facebook logo"/></Link>
                    <Link href="/"><StyledImg src={tiktokLogo} alt="tiktok logo"/></Link>
                    <Link href="/"><StyledImg src={youtubeLogo} alt="youtube logo"/></Link>
            </Stack>
        </Stack>
    )
}


export default Footer
