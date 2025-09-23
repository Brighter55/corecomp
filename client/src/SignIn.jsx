import {useState} from "react"


function SignIn() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    return (
        <div>
            <h1>Sign In</h1>
            <form>
                <label>
                    Email:
                    <input value={email} onChange={(event) => setEmail(event.target.value)}></input>
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
