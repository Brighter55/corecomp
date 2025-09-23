import {useState} from "react"


function SignUp() {
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState(null);

    async function handleSubmit(event) {
        event.preventDefault();
        if (password != confirmPassword) {
            setError("Passwords don't match");
            return
        }

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
                </label>
                <label>
                    Username:
                    <input value={username} onChange={(event) => setUsername(event.target.value)}></input>
                </label>
                <label>
                    Password:
                    <input value={password} onChange={(event) => setPassword(event.target.value)}></input>
                    {error ? <h3>error</h3> : <h3></h3>}
                </label>
                <label>
                    Comfirm Password:
                    <input value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)}></input>
                </label>
                <button type="submit">Sign up</button>
            </form>
        </div>
    )
}


export default SignUp
