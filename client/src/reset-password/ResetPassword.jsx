import LandingHeader from "../headers/landing-header/LandingHeader.jsx"
import styles from "./ResetPassword.module.css"
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { useState } from "react"

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
                if (field == "email") {
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
        <>
            <LandingHeader></LandingHeader>
            <div className={styles.content}>
                <div className={styles.resetContainer}>
                    <span className={styles.text}>Reset your password</span>
                    <p className={styles.description}>Enter your email and we will send you a recovery email</p>
                    <form onSubmit={handleSubmit} className={styles.form}>
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
                </div>
            </div>
        </>
    )
}


export default ResetPassword
