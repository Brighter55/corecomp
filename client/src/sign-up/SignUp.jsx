import {useState} from "react"
import {GoogleLogin} from "@react-oauth/google"
import {useNavigate} from "react-router-dom"
import LandingHeader from "../headers/landing-header/LandingHeader.jsx"
// mui components
import TextField from '@mui/material/TextField';
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
import logo from "../assets/logoLightMode.png"

// style
import styles from "./SignUp.module.css"


const StyledSignUpGrid = styled(Grid)(({theme}) => ({
    display: "flex",
    backgroundColor: "var(--main-dust-grey)",
    borderRadius: "10px 0 0 10px",
    color: "var(--main-pine-teal)",
    justifyContent: "center",
    alignItems: "center",
    padding: "2rem",
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
}));

const StyledTextField = styled(TextField)(({theme}) => ({
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
}));

const formStyle = {
    width: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
};


function SignUp() {
    const navigate = useNavigate();
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
        event.preventDefault();
        setUsernameError("");
        setEmailError("");
        setPasswordError("");
        setConfirmPasswordError("");
        const payload = {email: email, username: username, password: password, confirmPassword: confirmPassword};
        try {
            const response = await fetch("http://127.0.0.1:8000/api/sign-up", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });
            const data = await response.json();
            console.log(data);

            if (!response.ok) {
                for (const field in data) {
                    if (field == "username") {
                        setUsernameError(data.username);
                    } else if (field == "email") {
                        setEmailError(data.email);
                    } else if (field == "password") {
                        setPasswordError(data.password)
                    } else if (field == "confirmPassword") {
                        setConfirmPasswordError(data.confirmPassword);
                    } else if (field == "non_field_errors") {
                        setPasswordError(data.non_field_errors);
                        setConfirmPasswordError(data.non_field_errors);
                    }
                }

            }

        } catch (error) {
            console.error("Error:", error);
        }
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
            <Grid container>
                <StyledSignUpGrid size={6}>
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
                                sx={{ backgroundColor: "#588157" }}
                            >Sign Up</Button>
                        </form>
                        <Divider sx={{ width: "100%" }}>or</Divider>
                        <GoogleLogin
                            onSuccess={credentialResponse => {
                                const payload = {JWTToken: credentialResponse.credential};
                                console.log(credentialResponse);
                                async function sendJWTToken() {
                                    const response = await fetch("http://127.0.0.1:8000/api/google-authentication", {
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
                </StyledSignUpGrid>
                <StyledFeaturesGrid size={6}>
                    <Typography variant="h3">All features</Typography>
                    <div className={styles.features}>
                        <div className={styles.feature}>
                            <span style={{ fontSize: "70px" }}>20+</span>
                            <span>years of financial data</span>
                        </div>
                        <div className={styles.feature}>
                            <img style={{ width: "90px", height: "90px", borderRadius: "10px" }} src={logo} alt="logo"/>
                            <span>easy looking graphs</span>
                        </div>
                        <div className={styles.feature}>
                            <HelpIcon sx={{ width: "70px", height: "70px" }} />
                            <span>chart explainations</span>
                        </div>
                    </div>
                    <Divider sx={{ width: "80%", bgcolor: "#DAD7CD" }}></Divider>
                    <span>and more features coming soon!</span>
                </StyledFeaturesGrid>
            </Grid>
        </Container>
    )
}


export default SignUp
