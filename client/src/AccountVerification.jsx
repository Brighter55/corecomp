import { useEffect, useState } from "react";
import { useParams } from 'react-router-dom';
import LandingHeader from "./headers/LandingHeader.tsx";
import { authenticatedClient } from "./helpers/api.js";
import { Button } from "./components/ui/button";

function AccountVerification() {
    /*
    set active => trial starts ...
    already active => the account is already active
    invalid user_id => user not found
    invalid token => token is invalid or expired (resend email)
    */
    const [message, setMessage] = useState(null);
    const { token, user_id } = useParams();
    useEffect(() => {
        const payload = { token: token, user_id: user_id };
        async function verify() {
            const response = await authenticatedClient({ endpoint: "/accounts/verify-email", payload: payload });
            const data = await response.json();
            setMessage(data.message);
        }

        verify();
    }, []);

    async function handleResendClicked() {
        const payload = { user_id: user_id };
        const response = await authenticatedClient({ endpoint: "/accounts/resend-verify-email", payload: payload });
        const data = await response.json();
        console.log(data);
        setMessage(data.message);
    }

    return (
        <div className="mx-auto max-w-6xl px-4 pb-12">
            <LandingHeader />
            <div className="mt-8 w-full max-w-xl rounded-2xl bg-[var(--main-dust-grey)] p-6 text-[var(--main-pine-teal)]">
                <p>{message}</p>
                {message === "Token is either invalid or expired" ? (
                    <Button className="mt-4" type="button" variant="forest" onClick={handleResendClicked}>
                        Resend email
                    </Button>
                ) : null}
            </div>
        </div>
    )
}

export default AccountVerification
