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


const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY, {
});

function AuthenticatedUserAccount() {
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
            <Typography variant="h3" sx={{ marginBottom: "1rem" }}>Subscription</Typography>
            <StyledButton
                onClick={handleSubscribeClicked}
                variant="contained"
            >
                Subscribe
            </StyledButton>
        </Container>
    )
}

export default AuthenticatedUserAccount
