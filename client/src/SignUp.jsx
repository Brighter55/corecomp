import {useState} from "react"
import {GoogleLogin} from "@react-oauth/google"

function SignUp() {
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
                    }
                    if (field == "email") {
                        setEmailError(data.email);
                    }
                    if (field == "password") {
                        setPasswordError(data.password)
                    }
                    if (field == "confirmPassword") {
                        setConfirmPasswordError(data.confirmPassword);
                    }
                    if (field == "non_field_errors") {
                        setPasswordError(data.non_field_errors);
                        setConfirmPasswordError(data.non_field_errors);
                    }
                }

            }

        } catch (error) {
            console.error("Error:", error);
        }
    }

    return (
        <div>
            <h1>Sign Up</h1>
            <form onSubmit={handleSubmit}>
                <label>
                    Email:
                    <input value={email} onChange={(event) => setEmail(event.target.value)}></input>
                    {emailError ? <h3>{emailError}</h3> : <h3></h3>}
                </label>
                <label>
                    Username:
                    <input value={username} onChange={(event) => setUsername(event.target.value)}></input>
                    {usernameError ? <h3>{usernameError}</h3> : <h3></h3>}
                </label>
                <label>
                    Password:
                    <input value={password} onChange={(event) => setPassword(event.target.value)}></input>
                    {passwordError ? <h3>{passwordError}</h3> : <h3></h3>}
                </label>
                <label>
                    Comfirm Password:
                    <input value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)}></input>
                    {confirmPasswordError ? <h3>{confirmPasswordError}</h3> : <h3></h3>}
                </label>
                <button type="submit">Sign up</button>
            </form>
            <GoogleLogin
                onSuccess={credentialResponse => {/*send token to django endpoint*/
                    const payload = {JWTToken: credentialResponse.credential};
                    async function sendJWTToken() {
                        const response = await fetch("http://127.0.0.1:8000/api/google-authentication", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify(payload)
                        });
                        const data = await response.json()
                        console.log(data)
                    }

                    sendJWTToken();
                }}
                onError={() => console.log("Log in failed")}
                useOneTap
            />
        </div>
    )
}


export default SignUp
