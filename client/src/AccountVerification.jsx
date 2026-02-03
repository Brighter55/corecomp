import {useEffect, useState} from "react"
import { useParams } from 'react-router-dom';
import LandingHeader from "./headers/LandingHeader.jsx"
import { apiClient } from "./helpers/api.js";
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
    const [successful, setSuccessful] = useState(false);
    const {token, user_id} = useParams();
    useEffect(() => {
        const payload = {token: token, user_id: user_id};
        async function verify() {
            const response = await apiClient({endpoint: "/accounts/verify-email", payload: payload});
            if (response.ok) {
                setSuccessful(true)
            }
            const data = await response.json();
            console.log(data);
        }

        verify();
    }, []);

    async function handleResendClicked() {
        const payload = {user_id: user_id};
        const response = await apiClient({endpoint: "/accounts/resend-verify-email", payload: payload});
        const data = await response.json();
        console.log(data);
    }

    return (
        <Container maxWidth="lg" disableGutters>
            <LandingHeader />
            <StyledStack>
                {successful ? (
                    <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                        Your account has been verified and your trial starts now!
                    </Typography>
                ) : (
                    <Stack spacing={20}>
                        <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                            The token has expired or is invalid, please click the button below to resend an email
                        </Typography>
                        <Button
                            onClick={handleResendClicked}
                            sx={{ backgroundColor: "#588157", color: "#DAD7CD", width: "30%", marginLeft: "auto !important" }}
                            variant="contained"
                        >
                            resend
                        </Button>
                    </Stack>
                )
                }
            </StyledStack>
        </Container>
    )
}

export default AccountVerification
