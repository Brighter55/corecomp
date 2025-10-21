import * as React from 'react';
import {loadStripe} from '@stripe/stripe-js';
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout
} from '@stripe/react-stripe-js';
import {useNavigate} from "react-router-dom"
import {checkPermission} from "./helpers/checkPermission.js"

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY, {
});

function UserAccount() {
    const navigate = useNavigate();
    const ran = React.useRef(false);

    React.useEffect(() => {
        if (ran.current) {return;}
        ran.current = true;
        checkPermission(navigate);
    }, []);


    const [clientSecret, setClientSecret] = React.useState(null);

    async function handleSubscribeClicked(event) {
        event.preventDefault();
        const response = await fetch("http://127.0.0.1:8000/api/checkout-session", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${sessionStorage.getItem("access")}`,
            },
        });
        const data = await response.json();
        setClientSecret(data.client_secret);
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
        <>
            <h1>Subscription</h1>
            <button onClick={handleSubscribeClicked}>Subscribe</button>
        </>
    )
}

export default UserAccount
