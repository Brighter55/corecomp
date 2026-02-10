import {useState} from "react"
import {loadStripe} from '@stripe/stripe-js';
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout
} from '@stripe/react-stripe-js';
import ProductHeader from "./headers/product-header/ProductHeader.jsx"
import StyledButton from "./shared/StyledButton.jsx"
// mui components
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { authenticatedClient } from "./helpers/api.js"
import { useAuth } from "./auth/AuthProvider.jsx"
import Stack from "@mui/material/Stack"
import Divider from "@mui/material/Divider";
import TwoColumn from "./shared/TwoColumn.jsx";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY, {
});

function AuthenticatedUserAccount() {
    const { user } = useAuth();
    const [clientSecret, setClientSecret] = useState(null);

    async function handleSubscribeClicked(event) {
        event.preventDefault();
        const response = await authenticatedClient({ endpoint: "/billings/checkout-session" });
        const data = await response.json();
        setClientSecret(data.client_secret);
        console.log(data);
    }

    if (clientSecret) {
        return (
            <EmbeddedCheckoutProvider
                stripe={stripePromise}
                options={{clientSecret}}
            >
                <EmbeddedCheckout />
            </EmbeddedCheckoutProvider>
        )
    }

    return (
        <Container maxWidth="lg">
            <ProductHeader />
            <Stack spacing={2}>
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
                    <Typography variant="h4">Subscription</Typography>
                    <StyledButton
                        onClick={handleSubscribeClicked}
                        variant="contained"
                    >
                        Subscribe
                    </StyledButton>
                </TwoColumn>
            </Stack>
        </Container>
    )
}

export default AuthenticatedUserAccount
