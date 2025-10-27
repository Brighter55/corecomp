import * as React from 'react';
import {loadStripe} from '@stripe/stripe-js';
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout
} from '@stripe/react-stripe-js';
import {useNavigate} from "react-router-dom"
import {checkPermission} from "./helpers/helper.js"

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY, {
});

function UserAccount() {
    const navigate = useNavigate();
    const ran = React.useRef(false);
    const [isCustomer, setIsCustomer] = React.useState(false);

    async function checkIsCustomer() {
        const response = await fetch("http://127.0.0.1:8000/api/is-customer", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${sessionStorage.getItem("access")}`,
            },
        });
        const data = await response.json();
        setIsCustomer(data.is_customer);
    }

    React.useEffect(() => {
        if (ran.current) {return;}
        ran.current = true;
        checkPermission(navigate);
        checkIsCustomer();
    }, []);


    const [clientSecret, setClientSecret] = React.useState(null);

    async function handleSubscribeClicked(event) {
        event.preventDefault();

        async function getCheckoutSession() {
            const response = await fetch("http://127.0.0.1:8000/api/checkout-session", {
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
                    const refreshResponse = await fetch("http://127.0.0.1:8000/api/refresh", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({refresh: sessionStorage.getItem("refresh")})
                    });
                    if (!refreshResponse.ok) { /*Refresh expires in general needs log in again*/
                        console.log("refresh is invalid");
                        navigate("/sign-in");
                        return;
                    }

                    const tokens = await refreshResponse.json();
                    sessionStorage.setItem("access", tokens.access);
                    sessionStorage.setItem("refresh", tokens.refresh);
                    console.log(`recieved new pair of tokens. {access: ${sessionStorage.getItem("access")}, refresh: ${sessionStorage.getItem("refresh")}`);
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
            {
                isCustomer ? <button>Manage your billing</button>
                :
                <button onClick={handleSubscribeClicked}>Subscribe</button>
            }
        </>
    )
}

export default UserAccount
