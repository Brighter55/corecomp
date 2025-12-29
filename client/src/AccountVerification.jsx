import {useEffect, useState} from "react"
import { useParams } from 'react-router-dom';

function AccountVerification() {
    const [successful, setSuccessful] = useState(false);
    const {token, user_id} = useParams();
    useEffect(() => {
        const payload = {token: token, user_id: user_id};
        async function verify() {
            const response = await fetch("http://127.0.0.1:8000/accounts/verify-email", {
                method: "POST",
                headers: {"Content-Type": "application/json",},
                body: JSON.stringify(payload),
            });
            if (response.ok) {
                setSuccessful(true)
            }
            const data = await response.json();
            console.log(data);
        }

        verify();
    }, []);
    return (
        <>
            {successful ? <h1>Your account has been verified and your trial starts now!</h1> :
            <h1>The token has expired click to link below to resend an email<a href="">resend</a></h1> }
        </>
    )
}

export default AccountVerification
