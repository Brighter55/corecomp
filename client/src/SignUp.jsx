import {useState} from "react"
import {GoogleLogin} from "@react-oauth/google"
import {useNavigate} from "react-router-dom"
import LandingHeader from "./headers/LandingHeader.jsx"
import { authenticatedClient } from "./helpers/api.js"
import { useAuth } from "./auth/AuthProvider.jsx"
// styled components
import StyledTextField from "./shared/StyledTextField.jsx";
// mui components
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import HelpIcon from '@mui/icons-material/Help';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import { styled } from '@mui/material/styles';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
// pictures
import logo from "./assets/logoLightMode.png"


const StyledSignUpGrid = styled(Grid)(({theme}) => ({
    display: "flex",
    backgroundColor: "var(--main-dust-grey)",
    borderRadius: "10px 0 0 10px",
    color: "var(--main-pine-teal)",
    justifyContent: "center",
    alignItems: "center",
    padding: "2rem",
    [theme.breakpoints.down("md")] : {
        borderRadius: "10px 10px 0 0",
    },
}));

const StyledFeaturesGrid = styled(Grid)(({theme}) => ({
    display: "flex",
    flexDirection: "column",
    backgroundColor: "var(--main-brown)",
    borderRadius: "0 10px 10px 0",
    justifyContent: "center",
    alignItems: "center",
    gap: "2rem",
    padding: "2rem",
    [theme.breakpoints.down("md")] : {
        borderRadius: "0 0 10px 10px",
    },
}));

const formStyle = {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
};


function SignUp() {
    const navigate = useNavigate();
    const {setUser} = useAuth();
    // payload
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    // validation
    const [usernameError, setUsernameError] = useState("");
    const [emailError, setEmailError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [confirmPasswordError, setConfirmPasswordError] = useState("");
    // hide password
    const [showPassword, setShowPassword] = useState(false);
    const handleClickShowPassword = () => setShowPassword((show) => !show);
    const handleMouseDownPassword = (event) => {
        event.preventDefault();
    };
    const handleMouseUpPassword = (event) => {
        event.preventDefault();
    };

    async function handleSubmit(event) {
        /***
        event.preventDefault();
        setUsernameError("");
        setEmailError("");
        setPasswordError("");
        setConfirmPasswordError("");
        const payload = {
            email: email,
            username: username,
            password: password,
            confirmPassword: confirmPassword
        };
        const response = await authenticatedClient({endpoint: "/accounts/sign-up", payload: payload});
        const data = await response.json();
        console.log(data);
        if (!response.ok) {
            if ("username" in data) {
                setUsernameError(data.username);
            } if ("email" in data) {
                setEmailError(data.email);
            } if ("password" in data) {
                setPasswordError(data.password);
            } if ("confirmPassword" in data) {
                setConfirmPasswordError(data.confirmPassword);
            } if ("non_field_errors" in data) {
                setPasswordError(data.non_field_errors);
                setConfirmPasswordError(data.non_field_errors);
            }

            return;
        }
        // TODO: pop up saying account created successfully
        * */
    }

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

    return (
        <Container maxWidth="lg">
            <LandingHeader/>
            <Grid container sx={{ marginBottom: "3rem" }}>
                <StyledSignUpGrid size={{ xs: 12, md: 6 }}>
                    <Stack sx={{ width: "60%", alignItems: "center"}} spacing={2}>
                        <Typography variant="h3">Sign Up</Typography>
                        <form onSubmit={handleSubmit} style={formStyle}>
                            <StyledTextField
                                value={username}
                                onChange={(event) => {setUsername(event.target.value)}}
                                label="username"
                                variant="outlined"
                                error={usernameError ? true : false}
                                helperText={usernameError ? usernameError : " "}
                            />
                            <StyledTextField
                                value={email}
                                onChange={(event) => {setEmail(event.target.value)}}
                                label="email"
                                variant="outlined"
                                error={emailError ? true : false}
                                helperText={emailError ? emailError : " "}
                            />
                            <StyledTextField
                                value={password}
                                onChange={(event) => {setPassword(event.target.value)}}
                                label="password"
                                variant="outlined"
                                error={passwordError ? true : false}
                                helperText={passwordError ? passwordError : " "}
                                type={showPassword ? 'text' : 'password'}
                                InputProps={hidePasswordAdornment}
                            />
                            <StyledTextField
                                value={confirmPassword}
                                onChange={(event) => {setConfirmPassword(event.target.value)}}
                                label="confirm password"
                                variant="outlined"
                                error={confirmPasswordError ? true : false}
                                helperText={confirmPasswordError ? confirmPasswordError : " "}
                                type={showPassword ? 'text' : 'password'}
                                InputProps={hidePasswordAdornment}
                            />
                            <Button
                                type="submit"
                                variant="contained"
                                sx={{ backgroundColor: "var(--main-fern)" }}
                                aria-label="sign-up-button"
                            >Sign Up</Button>
                        </form>
                        <Divider sx={{ width: "100%" }}>or</Divider>
                        <GoogleLogin
                            onSuccess={credentialResponse => {
                                const payload = {JWTToken: credentialResponse.credential};
                                async function sendJWTToken() {
                                    const response = await authenticatedClient({endpoint: "/accounts/google-authentication", payload: payload});
                                    const data = await response.json();
                                    if (!response.ok) {
                                        console.log(data);
                                        return;
                                    }
                                    setUser(data);
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
                </StyledSignUpGrid>
                <StyledFeaturesGrid size={{ xs: 12, md: 6 }}>
                    <Typography variant="h3">All features</Typography>
                    <Stack direction="row"
                        sx={{ gap: "2rem", width: "80%", flexWrap: "wrap", justifyContent: "space-around" }}
                    >
                        <Stack spacing={1}
                            sx={{ justifyContent: "center", alignItems: "center" }}
                        >
                            <Typography variant="h2">20+</Typography>
                            <Typography variant="body1">years of financial data</Typography>
                        </Stack>
                        <Stack spacing={1}
                            sx={{ justifyContent: "center", alignItems: "center" }}
                        >
                            <img style={{ width: "70px", height: "70px", borderRadius: "10px" }} src={logo} alt="logo"/>
                            <Typography variant="body1">easy looking graphs</Typography>
                        </Stack>
                        <Stack spacing={1}
                            sx={{ justifyContent: "center", alignItems: "center" }}
                        >
                            <HelpIcon sx={{ width: "70px", height: "70px" }} />
                            <Typography variant="body1">chart explanations</Typography>
                        </Stack>
                    </Stack>
                    <Divider sx={{ width: "80%", bgcolor: "#DAD7CD" }}></Divider>
                    <Typography variant="body1">and more features coming soon!</Typography>
                </StyledFeaturesGrid>
            </Grid>
        </Container>
    )
}


export default SignUp
