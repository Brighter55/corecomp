import {useEffect, useState} from "react"
import { useParams } from 'react-router-dom';
import LandingHeader from "./headers/LandingHeader.jsx"
import { authenticatedClient } from "./helpers/api.js";
// mui components
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';

const StyledStack = styled(Stack)(({ theme }) => ({
    justifySelf: "center",
    height: "30rem",
    backgroundColor: "var(--main-dust-grey)",
    color: "var(--main-pine-teal)",
    borderRadius: "20px",
    padding: "20px",
    [theme.breakpoints.up("xs")]: {
        width: "70%"
    },
    [theme.breakpoints.up("md")]: {
        width: "50%"
    },
    [theme.breakpoints.up("lg")]: {
        width: "40%"
    },
}));

function AccountVerification() {
    /*
    set active => trial starts ...
    already active => the account is already active
    invalid user_id => user not found
    invalid token => token is invalid or expired (resend email)
    */
    const [message, setMessage] = useState(null);
    const {token, user_id} = useParams();
    useEffect(() => {
        const payload = {token: token, user_id: user_id};
        async function verify() {
            const response = await authenticatedClient({endpoint: "/accounts/verify-email", payload: payload});
            const data = await response.json();
            setMessage(data.message);
        }

        verify();
    }, []);

    async function handleResendClicked() {
        const payload = {user_id: user_id};
        const response = await authenticatedClient({endpoint: "/accounts/resend-verify-email", payload: payload});
        const data = await response.json();
        console.log(data);
        setMessage(data.message);
    }

    return (
        <Container maxWidth="lg" disableGutters>
            <LandingHeader />
            <StyledStack>
                <Typography>{message}</Typography>
                {message === "Token is either invalid or expired" ? <Button onClick={handleResendClicked}>Resend email</Button> : <></>}
            </StyledStack>
        </Container>
    )
}

export default AccountVerification
