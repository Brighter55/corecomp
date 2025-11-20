import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { GoogleLogin } from "@react-oauth/google"
import LandingHeader from "../headers/landing-header/LandingHeader.jsx"
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import Divider from '@mui/material/Divider';
// styles
import styles from "./SignIn.module.css"
// images
import facebookLogo from "../assets/facebookLogo.png"
import tiktokLogo from "../assets/tiktokLogo.png"
import youtubeLogo from "../assets/youtubeLogo.png"

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
            const response = await fetch("http://127.0.0.1:8000/api/sign-in", {
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

    const textFieldStyle = {
        "& .MuiInputBase-root": {
            backgroundColor: "#DAD7CD",
        },
        "& .MuiInputLabel-root.Mui-focused": {
            color: "#588157",
        },
        "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "#588157",
        },
        "& .MuiFormHelperText-root": {backgroundColor: "#746355", margin: "0"},
    };

    return (
        <>
            <LandingHeader />
            <div className={styles.contents}>
                <div className={styles.signInContent}>
                    <div className={styles.signInContainer}>
                        <span className={styles.title}>Sign In</span>
                        <form onSubmit={handleSubmit} className={styles.form}>
                            <TextField
                                value={username}
                                onChange={(event) => {setUsername(event.target.value)}}
                                label="username"
                                variant="outlined"
                                sx={textFieldStyle}
                                error={error ? true : false}
                                helperText={error ? error : " "}
                            />
                            <TextField
                                value={password}
                                onChange={(event) => {setPassword(event.target.value)}}
                                label="password"
                                variant="outlined"
                                sx={textFieldStyle}
                                error={error ? true : false}
                                helperText={error ? error : " "}
                                type={showPassword ? 'text' : 'password'}
                                InputProps={hidePasswordAdornment}
                            />
                            <Button
                                type="submit"
                                variant="contained"
                                sx={{ backgroundColor: "#588157", color: "#DAD7CD" }}
                            >Sign in</Button>
                        </form>
                        <span onClick={() => {navigate("/reset-password");}} className={styles.forgot} >forgot your password?</span>
                        <Divider sx={{ width: "100%", '&::before, &::after': { borderColor: "#DAD7CD" } }}>or</Divider>
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
                    </div>
                </div>
                <div className={styles.quoteContent}>
                    <span style={{ color: "#588157", fontSize: "30px" }}>an "every Core detail of a Company" app</span>
                    <Divider sx={{ width: "70%", '&::before, &::after': { borderColor: "#588157" }, color: "#588157" }}>follow us</Divider>
                    <div className={styles.logoContainer}>
                        <img className={styles.logo} src={facebookLogo} alt="facebook logo"/>
                        <img className={styles.logo} src={tiktokLogo} alt="tiktok logo"/>
                        <img className={styles.logo} src={youtubeLogo} alt="youtube logo"/>
                    </div>
                </div>
            </div>
        </>
    )
}


export default SignIn
