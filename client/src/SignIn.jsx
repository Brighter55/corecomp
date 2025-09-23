import {useState} from "react"


function SignIn() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

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
            const data = await response.json();
            // development phase
            sessionStorage.setItem("access", data.access);
            sessionStorage.setItem("refresh", data.refresh);
            console.log(sessionStorage);
        } catch (error) {
            console.error("Error:", error);
        }
    }

    return (
        <div>
            <h1>Sign In</h1>
            <form onSubmit={handleSubmit}>
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
        </div>
    )
}


export default SignIn
