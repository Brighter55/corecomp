import { useState } from "react";
import { loadStripe } from '@stripe/stripe-js';
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout
} from '@stripe/react-stripe-js';
import ProductHeader from "./headers/product-header/ProductHeader.jsx";
import { authenticatedClient } from "./helpers/api.js";
import { useAuth } from "./auth/AuthProvider.jsx";
import { Button } from "./components/ui/button";
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
        <div className="mx-auto max-w-6xl px-4 pb-12">
            <ProductHeader />
            <div className="space-y-2">
                <TwoColumn>
                    <h2 className="text-2xl font-semibold">Username</h2>
                    <p className="text-lg">{user.username}</p>
                </TwoColumn>
                <hr className="border-[var(--line-muted)]" />
                <TwoColumn>
                    <h2 className="text-2xl font-semibold">email</h2>
                    <p className="text-lg">{user.email}</p>
                </TwoColumn>
                <hr className="border-[var(--line-muted)]" />
                <TwoColumn>
                    <h2 className="text-2xl font-semibold">Subscription</h2>
                    <Button onClick={handleSubscribeClicked} variant="forest">
                        Subscribe
                    </Button>
                </TwoColumn>
            </div>
        </div>
    )
}

export default AuthenticatedUserAccount
