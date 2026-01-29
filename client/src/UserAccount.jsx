import { useRef, useState, useEffect } from "react"
import {loadStripe} from '@stripe/stripe-js';
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout
} from '@stripe/react-stripe-js';
import {useNavigate} from "react-router-dom"
import {checkPermission, getNewTokens} from "./helpers/helper.js"
import ProductHeader from "./headers/product-header/ProductHeader.jsx"
// mui components
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';


const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY, {
});

const StyledButton = styled(Button)({
    color: "black",
    borderRadius: "10px",
    "&:hover": {backgroundColor: "lightgrey"},
    backgroundColor: "var(--main-dust-grey)",
});

function UserAccount() {
    const navigate = useNavigate();
    
    const [clientSecret, setClientSecret] = useState(null);

    async function handleSubscribeClicked(event) {
        event.preventDefault();

        async function getCheckoutSession() {
            const response = await fetch("http://127.0.0.1:8000/billings/checkout-session", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${sessionStorage.getItem("access")}`,
                },
            });
            return response
        }

        try {
            let response = await getCheckoutSession();
            let data = await response.json();

            /*get new tokens if access expires*/
            if (!response.ok) {
                if (data?.messages?.[0]?.message === "Token is expired") {
                    await getNewTokens(data, navigate);
                    response = await getCheckoutSession();
                    data = await response.json();
                } else if (response.status === 403) { /*Unauthorized user, aka, don't have permission to use*/
                    navigate("/user-account");
                } else {
                    navigate("/sign-up");
                }
            }
            /*--------------*/

            setClientSecret(data.client_secret);
            console.log(data);
        } catch (error) {
            console.error("Error:", error)
        }
    }

    async function handleManageClicked() {
        async function getPortalSession() {
            const response = await fetch("http://127.0.0.1:8000/billings/portal-session", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${sessionStorage.getItem("access")}`,
                },
            });
            return response;
        }

        let response = await getPortalSession();
        let data = await response.json();

        /*get new tokens if access expires*/
        if (!response.ok) {
            if (data?.messages?.[0]?.message === "Token is expired") {
                await getNewTokens(data, navigate);
                response = await getPortalSession();
                data = await response.json();
            } else if (response.status === 403) { /*Unauthorized user, aka, don't have permission to use*/
                navigate("/user-account");
            } else {
                navigate("/sign-up");
            }
        }
        /*--------------*/

        const portalURL = data.url;
        window.location.href = portalURL;
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
            {
                isCustomer ?
                <StyledButton
                    onClick={handleManageClicked}
                    variant="contained"
                >
                    Manage your billing
                </StyledButton>
                :
                <StyledButton
                    onClick={handleSubscribeClicked}
                    variant="contained"
                >
                    Subscribe
                </StyledButton>
            }
        </Container>
    )
}

export default UserAccount
