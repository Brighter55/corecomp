import ProductHeader from "./headers/product-header/ProductHeader.jsx"
import { authenticatedClient } from "./helpers/api.js"
import StyledButton from "./shared/StyledButton.jsx"
import { useAuth } from "./auth/AuthProvider.jsx"
// mui components
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Stack from "@mui/material/Stack"
import TwoColumn from "./shared/TwoColumn.jsx";
import Divider from "@mui/material/Divider";


function ArthorizedUserAccount() {
    const { user } = useAuth();
    async function handleManageClicked() {
        const response = await authenticatedClient({endpoint: "/billings/portal-session"});
        const data = await response.json();
        const portalURL = data.url;
        window.location.href = portalURL;
    }

    return (
        <Container maxWidth="lg">
            <Stack spacing={4}>
                <ProductHeader />
                <TwoColumn>
                    <Typography variant="h4">Username</Typography>
                    <Typography varaint="h5">{user.username}</Typography>
                </TwoColumn>
                <Divider orientation="horizontal" flexItem sx={{ backgroundColor: "var(--main-dust-grey)" }}/>
                <TwoColumn>
                    <Typography variant="h4">email</Typography>
                    <Typography varaint="h5">{user.email}</Typography>
                </TwoColumn>
                <Divider orientation="horizontal" flexItem sx={{ backgroundColor: "var(--main-dust-grey)" }}/>
                <TwoColumn>
                    <Typography variant="h4">Status</Typography>
                    <Typography varaint="h5">{user.subscription_status}</Typography>
                </TwoColumn>
                <Divider orientation="horizontal" flexItem sx={{ backgroundColor: "var(--main-dust-grey)" }}/>
                <TwoColumn>
                    <Typography variant="h4">Period Start</Typography>
                    <Typography varaint="h5">{user.current_period_start}</Typography>
                </TwoColumn>
                <Divider orientation="horizontal" flexItem sx={{ backgroundColor: "var(--main-dust-grey)" }}/>
                <TwoColumn>
                    <Typography variant="h4">Period End</Typography>
                    <Typography varaint="h5">{user.current_period_end}</Typography>
                </TwoColumn>
                <Divider orientation="horizontal" flexItem sx={{ backgroundColor: "var(--main-dust-grey)" }}/>
                <TwoColumn>
                    <Typography variant="h4">Subscription</Typography>
                    <StyledButton
                        onClick={handleManageClicked}
                        variant="contained"
                    >
                        Manage your billing
                    </StyledButton>
                </TwoColumn>
            </Stack>

        </Container>
    )
}

export default ArthorizedUserAccount
