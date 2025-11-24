import { useState } from "react"
import { useParams } from "react-router-dom"
import LandingHeader from "../headers/landing-header/LandingHeader.jsx"
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import {useNavigate} from "react-router-dom"
// styles
import styles from "./ConfirmResetPassword.module.css"

function ConfirmResetPassword() {
    const navigate = useNavigate();
    const { token, id } = useParams();

    // states
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    // validation
    const [passwordError, setPasswordError] = useState("");
    const [confirmPasswordError, setConfirmPasswordError] = useState("");
    const [idError, setIdError] = useState("");
    const [tokenError, setTokenError] = useState("");
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
        setPasswordError("");
        const payload = {password: password, confirmPassword: confirmPassword, id: id, token: token};
        try {
            const response = await fetch("http://127.0.0.1:8000/api/confirm-reset-password", {
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
                    if (field == "password") { // if email provided fails the test
                        setPasswordError(data.password);
                    } else if (field == "confirmPassword") {
                        setConfirmPasswordError(data.confirmPassword);
                    } else if (field == "id") {
                        setIdError(data.id);
                    } else if (field == "token") {
                        setTokenError(data.token);
                    } else if (field == "non_field_errors") { // if passwords not match
                        setPasswordError(data.non_field_errors);
                        setConfirmPasswordError(data.non_field_errors);
                    }
                }

                return;
            }
        } catch (error) {
            console.error("Error:", error);
            return;
        }

        // runs only if not a bad request and no network issue
        navigate("/sign-in");
    }

    const textFieldStyle = {
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
        width: "100%",
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

    return (
        <>
            <LandingHeader />
            <div className={styles.content}>
                <div className={styles.container}>
                    <span className={styles.text}>Reset your Password</span>
                    <p>Enter your new password and we will reset the password for you</p>
                    <span>{idError ? idError : ""}</span>
                    <span>{tokenError ? tokenError : ""}</span>
                    <form onSubmit={handleSubmit} className={styles.form}>
                        <TextField
                            value={password}
                            onChange={(event) => {setPassword(event.target.value)}}
                            label="password"
                            variant="outlined"
                            sx={textFieldStyle}
                            error={passwordError ? true : false}
                            helperText={passwordError ? passwordError : " "}
                            type={showPassword ? 'text' : 'password'}
                            InputProps={hidePasswordAdornment}
                        />
                        <TextField
                            value={confirmPassword}
                            onChange={(event) => {setConfirmPassword(event.target.value)}}
                            label="confirm password"
                            variant="outlined"
                            sx={textFieldStyle}
                            error={confirmPasswordError ? true : false}
                            helperText={confirmPasswordError ? confirmPasswordError : " "}
                            type={showPassword ? 'text' : 'password'}
                            InputProps={hidePasswordAdornment}
                        />
                        <Button sx={{ width: "20%", backgroundColor: "#588157", color: "#DAD7CD"}} type="submit">send</Button>
                    </form>
                </div>
            </div>
        </>
    )
}


export default ConfirmResetPassword
