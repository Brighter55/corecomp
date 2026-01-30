import ProductHeader from "./headers/product-header/ProductHeader.jsx"
import { authenticatedClient } from "./helpers/api.js"
import StyledButton from "./shared/StyledButton.jsx"
// mui components
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

function ArthorizedUserAccount() {
    async function handleManageClicked() {
        const response = await authenticatedClient({endpoint: "/billings/portal-session"});
        const data = await response.json();
        const portalURL = data.url;
        window.location.href = portalURL;
    }

    return (
        <Container maxWidth="lg">
            <ProductHeader />
            <Typography variant="h3" sx={{ marginBottom: "1rem" }}>Subscription</Typography>
                <StyledButton
                    onClick={handleManageClicked}
                    variant="contained"
                >
                    Manage your billing
                </StyledButton>
        </Container>
    )
}

export default ArthorizedUserAccount
