import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { GoogleLogin } from "@react-oauth/google"
import LandingHeader from "./headers/LandingHeader.jsx"
import StyledTextField from "./shared/StyledTextField.jsx";
// mui components
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import Divider from '@mui/material/Divider';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import { styled } from '@mui/material/styles';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
// images
import facebookLogo from "./assets/facebookLogo.png"
import tiktokLogo from "./assets/tiktokLogo.png"
import youtubeLogo from "./assets/youtubeLogo.png"


const StyledSignInGrid = styled(Grid)(({theme}) => ({
    display: "flex",
    backgroundColor: "var(--main-brown)",
    borderRadius: "10px 0 0 10px",
    color: "var(--main-dust-grey)",
    justifyContent: "center",
    alignItems: "center",
    padding: "4rem 2rem 4rem 2rem",
    [theme.breakpoints.down("md")] : {
        borderRadius: "10px 10px 0 0",
    },
}));

const StyledSloganGrid = styled(Grid)(({theme}) => ({
    display: "flex",
    flexDirection: "column",
    backgroundColor: "var(--main-dust-grey)",
    borderRadius: "0 10px 10px 0",
    justifyContent: "center",
    alignItems: "center",
    gap: "2rem",
    padding: "2rem",
    [theme.breakpoints.down("md")] : {
        borderRadius: "0 0 10px 10px",
    },
}));

const StyledImg = styled("img")({
    width: "2rem",
    height: "2rem",
    borderRadius: "50%",
    "&:hover": {
        transform: "translateY(-3px)",
    },
});

const formStyle = {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
};

function SignIn() {
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    // validation
    const [error, setError] = useState("");
    // hide password
    const [showPassword, setShowPassword] = useState(false);
    const handleClickShowPassword = () => setShowPassword((show) => !show);
    const handleMouseDownPassword = (event) => {
        event.preventDefault();
    };
    const handleMouseUpPassword = (event) => {
        event.preventDefault();
    };

    const hidePasswordAdornment = {
        endAdornment: (
        <InputAdornment position="end">
            <IconButton
                aria-label="toggle password visibility"
                onClick={handleClickShowPassword}
                onMouseDown={handleMouseDownPassword}
                onMouseUp={handleMouseUpPassword}
                edge="end"
            >
            {showPassword ? <Visibility /> : <VisibilityOff />}
            </IconButton>
        </InputAdornment>
        ),
    }

    async function handleSubmit(event) {
        event.preventDefault();
        const payload = {username: username, password: password};
        try {
            const response = await fetch("http://127.0.0.1:8000/accounts/sign-in", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });
            // if account not found
            if (!response.ok) {
                setError("Username or/and password is incorrect");
                setUsername("");
                setPassword("");
                return
            }

            const data = await response.json();
            // development phase
            console.log(data);
            sessionStorage.setItem("access", data.access);
            sessionStorage.setItem("refresh", data.refresh);
            console.log(sessionStorage);
            // redirect user to their "search" page
            navigate("/overview");
        } catch (error) {
            console.error("Error:", error);
        }
    }

    return (
        <Container maxWidth="lg">
            <LandingHeader />
            <Grid container sx={{ marginBottom: "3rem" }}>
                <StyledSignInGrid size={{ xs: 12, md: 6 }}>
                    <Stack sx={{ width: "60%", alignItems: "center" }} spacing={2}>
                        <Typography variant="h3">Sign In</Typography>
                        <form onSubmit={handleSubmit} style={formStyle}>
                            <StyledTextField
                                value={username}
                                onChange={(event) => {setUsername(event.target.value)}}
                                label="username"
                                variant="outlined"
                                error={error ? true : false}
                                helperText={error ? error : " "}
                                sx={{ "& .MuiFormHelperText-root": {backgroundColor: "var(--main-brown)"} }}
                            />
                            <StyledTextField
                                value={password}
                                onChange={(event) => {setPassword(event.target.value)}}
                                label="password"
                                variant="outlined"
                                error={error ? true : false}
                                helperText={error ? error : " "}
                                type={showPassword ? 'text' : 'password'}
                                InputProps={hidePasswordAdornment}
                                sx={{ "& .MuiFormHelperText-root": {backgroundColor: "var(--main-brown)"} }}
                            />
                            <Button
                                type="submit"
                                variant="contained"
                                sx={{ backgroundColor: "#588157", color: "#DAD7CD" }}
                            >Sign in</Button>
                        </form>
                        <span onClick={() => {navigate("/reset-password");}} style={{ cursor: "pointer" }}>forgot your password?</span>
                        <Divider sx={{ width: "100%", '&::before, &::after': { borderColor: "#DAD7CD" } }}>or</Divider>
                        <GoogleLogin
                            onSuccess={credentialResponse => {
                                const payload = {JWTToken: credentialResponse.credential};
                                console.log(credentialResponse);
                                async function sendJWTToken() {
                                    const response = await fetch("http://127.0.0.1:8000/accounts/google-authentication", {
                                        method: "POST",
                                        headers: {
                                            "Content-Type": "application/json",
                                        },
                                        body: JSON.stringify(payload)
                                    });
                                    const data = await response.json()
                                    sessionStorage.setItem("access", data.access);
                                    sessionStorage.setItem("refresh", data.refresh);
                                    navigate("/overview");
                                }

                                sendJWTToken();
                            }}
                            onError={() => console.log("Log in failed")}
                            useOneTap
                            text="continue_with"
                            shape="pill"
                            size="large"
                        />
                    </Stack>
                </StyledSignInGrid>
                <StyledSloganGrid size={{ xs: 12, md: 6 }}>
                    <Typography variant="h4" align="center" sx={{ color: "var(--main-fern)" }}>an "every Core detail of a Company" app</Typography>
                    <Divider sx={{ width: "70%", '&::before, &::after': { borderColor: "#588157" }, color: "#588157" }}>follow us</Divider>
                    <Stack direction="row" spacing={3}>
                        <a href="/"><StyledImg src={facebookLogo} alt="facebook logo"/></a>
                        <a href="/"><StyledImg src={tiktokLogo} alt="tiktok logo"/></a>
                        <a href="/"><StyledImg src={youtubeLogo} alt="youtube logo"/></a>
                    </Stack>
                </StyledSloganGrid>
            </Grid>
        </Container>
    )
}


export default SignIn
