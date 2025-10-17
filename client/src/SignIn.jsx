import {useState} from "react"
import {useNavigate} from "react-router-dom"
import {GoogleLogin} from "@react-oauth/google"


function SignIn() {
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    // validation
    const [error, setError] = useState("");

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

    return (
        <div>
            <h1>Sign In</h1>
            <form onSubmit={handleSubmit}>
                {error ? <h3>{error}</h3> : <h3></h3>}
                <label>
                    Username:
                    <input value={username} onChange={(event) => setUsername(event.target.value)}></input>
                </label>
                <label>
                    Password:
                    <input value={password} onChange={(event) => setPassword(event.target.value)}></input>
                </label>
                <button type="submit">Log in</button>
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
                        sessionStorage.setItem("access", data.access);
                        sessionStorage.setItem("refresh", data.refresh);
                        navigate("/overview");
                    }

                    sendJWTToken();
                }}
                onError={() => console.log("Log in failed")}
                useOneTap
            />
        </div>
    )
}


export default SignIn
