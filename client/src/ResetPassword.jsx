import { useState } from "react"
import LandingHeader from "./headers/LandingHeader.jsx"
// mui components
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';


const StyledStack = styled(Stack)(({ theme }) => ({
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

const formStyle = {
    height: "40%",
    display: "flex",
    flexDirection: "column",
    gap: "4rem",
    alignItems: "end",
}

function ResetPassword() {
    const [email, setEmail] = useState("");
    const [emailError, setEmailError] = useState("");
    const [success, setSuccess] = useState(false);

    async function handleSubmit(event) {
        event.preventDefault();
        setEmailError("");
        const payload = {email: email};
        try {
            const response = await fetch("http://127.0.0.1:8000/api/reset-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });
            const data = await response.json();
            console.log(data);

            if (!response.ok) {
                if (data.email) { // if email provided fails the test
                    setEmailError(data.email);
                }

                return;
            }
        } catch (error) {
            console.error("Error:", error);
            return;
        }

        // runs only if not a bad request and no network issue
        setSuccess(true);
    }

    return (
        <Container maxWidth="lg" disableGutters>
            <LandingHeader></LandingHeader>
            <Box sx={{ display: "flex", justifyContent: "center", height: "85%" }}>
                <StyledStack spacing={4}>
                    <Typography variant="h3" sx={{ fontWeight: "bold" }}>Reset your password</Typography>
                    {success ? (
                        <Typography variant="body1">Recovery email has been sent!</Typography>
                    ) : (
                        <Typography variant="body1">Enter your email and we will send you a recovery email</Typography>
                    )}
                    <form onSubmit={handleSubmit} style={formStyle}>
                        <TextField
                            value={email}
                            onChange={(event) => {setEmail(event.target.value)}}
                            label="email"
                            variant="outlined"
                            sx={{
                                width: "100%",
                                "& .MuiInputBase-root": {
                                    backgroundColor: "lightgrey",
                                },
                                "& .MuiInputLabel-root.Mui-focused": {
                                    color: "#3A5A40",
                                },
                                "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                                    borderColor: "#3A5A40",
                                },
                                "& .MuiFormHelperText-root": {backgroundColor: "#DAD7CD", margin: "0"},
                            }}
                            error={emailError ? true : false}
                            helperText={emailError ? emailError : " "}
                        />
                        <Button sx={{ width: "20%", backgroundColor: "#588157", color: "#DAD7CD"}} type="submit">send</Button>
                    </form>
                </StyledStack>
            </Box>
        </Container>
    )
}


export default ResetPassword
