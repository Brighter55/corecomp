import { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, HelpCircle } from "lucide-react";
import LandingHeader from "./headers/LandingHeader.tsx";
import { authenticatedClient } from "./helpers/api.js";
import { useAuth } from "./auth/AuthProvider.jsx";
import { Button } from "./components/ui/button";
import logo from "./assets/logoLightMode.png";

function fieldToText(value) {
  if (Array.isArray(value)) return value.join(" ");
  if (value == null) return "";
  return String(value);
}


function SignUp() {
    const navigate = useNavigate();
    const { setUser } = useAuth();
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [usernameError, setUsernameError] = useState("");
    const [emailError, setEmailError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [confirmPasswordError, setConfirmPasswordError] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    async function handleSubmit(event) {
        event.preventDefault();
        setUsernameError("");
        setEmailError("");
        setPasswordError("");
        setConfirmPasswordError("");

        const payload = { email, username, password, confirmPassword };
        const response = await authenticatedClient({ endpoint: "/accounts/sign-up", payload });
        const data = await response.json();
        console.log(data);

        if (!response.ok) {
            if ("username" in data) setUsernameError(fieldToText(data.username));
            if ("email" in data) setEmailError(fieldToText(data.email));
            if ("password" in data) setPasswordError(fieldToText(data.password));
            if ("confirmPassword" in data) setConfirmPasswordError(fieldToText(data.confirmPassword));
            if ("non_field_errors" in data) {
                const message = fieldToText(data.non_field_errors);
                setPasswordError(message);
                setConfirmPasswordError(message);
            }
            return;
        }
    }

    return (
        <div className="mx-auto max-w-6xl px-4 pb-12">
            <LandingHeader />

            <div className="grid overflow-hidden rounded-xl border border-[var(--line-muted)] md:grid-cols-2">
                <section className="bg-[var(--main-dust-grey)] px-6 py-10 text-[var(--main-pine-teal)] md:px-10">
                    <div className="mx-auto w-full max-w-md">
                        <h1 className="mb-6 text-4xl font-semibold">Sign Up</h1>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="signup-username" className="mb-1 block text-sm">username</label>
                                <input id="signup-username" value={username} onChange={(event) => setUsername(event.target.value)} className="w-full rounded-md border border-[var(--line-muted)] bg-[var(--bg)] px-3 py-2" />
                                <p className="mt-1 min-h-5 text-sm text-red-700">{usernameError || " "}</p>
                            </div>
                            <div>
                                <label htmlFor="signup-email" className="mb-1 block text-sm">email</label>
                                <input id="signup-email" value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-md border border-[var(--line-muted)] bg-[var(--bg)] px-3 py-2" />
                                <p className="mt-1 min-h-5 text-sm text-red-700">{emailError || " "}</p>
                            </div>
                            <div>
                                <label htmlFor="signup-password" className="mb-1 block text-sm">password</label>
                                <div className="relative">
                                    <input id="signup-password" type={showPassword ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} className="w-full rounded-md border border-[var(--line-muted)] bg-[var(--bg)] px-3 py-2 pr-10" />
                                    <button type="button" aria-label="toggle password visibility" onClick={() => setShowPassword((show) => !show)} className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--main-pine-teal)]">{showPassword ? <Eye size={18} /> : <EyeOff size={18} />}</button>
                                </div>
                                <p className="mt-1 min-h-5 text-sm text-red-700">{passwordError || " "}</p>
                            </div>
                            <div>
                                <label htmlFor="signup-confirm-password" className="mb-1 block text-sm">confirm password</label>
                                <input id="signup-confirm-password" type={showPassword ? "text" : "password"} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="w-full rounded-md border border-[var(--line-muted)] bg-[var(--bg)] px-3 py-2" />
                                <p className="mt-1 min-h-5 text-sm text-red-700">{confirmPasswordError || " "}</p>
                            </div>

                            <Button type="submit" variant="forest" className="w-full" aria-label="sign-up-button">Sign Up</Button>
                        </form>

                        <div className="my-6 flex items-center gap-3">
                            <div className="h-px flex-1 bg-[var(--line-muted)]" />
                            <span className="text-sm">or</span>
                            <div className="h-px flex-1 bg-[var(--line-muted)]" />
                        </div>

                        <GoogleLogin
                            onSuccess={(credentialResponse) => {
                                const payload = { JWTToken: credentialResponse.credential };
                                async function sendJWTToken() {
                                    const response = await authenticatedClient({ endpoint: "/accounts/google-authentication", payload });
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
                    </div>
                </section>

                <section className="flex flex-col items-center justify-center gap-6 bg-[var(--main-brown)] px-6 py-10 text-[var(--main-dust-grey)]">
                    <h2 className="text-3xl font-semibold">All features</h2>
                    <div className="grid w-full max-w-md grid-cols-1 gap-6 sm:grid-cols-3">
                        <div className="text-center">
                            <p className="text-4xl font-bold">20+</p>
                            <p className="text-sm">years of financial data</p>
                        </div>
                        <div className="text-center">
                            <img className="mx-auto h-14 w-14 rounded-md" src={logo} alt="logo" />
                            <p className="text-sm">easy looking graphs</p>
                        </div>
                        <div className="text-center">
                            <HelpCircle className="mx-auto h-14 w-14" />
                            <p className="text-sm">chart explanations</p>
                        </div>
                    </div>
                    <div className="h-px w-4/5 bg-[var(--main-dust-grey)]/35" />
                    <p className="text-sm">and more features coming soon!</p>
                </section>
            </div>
        </div>
    );
}


export default SignUp;
