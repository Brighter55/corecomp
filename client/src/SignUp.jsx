import { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, Mail, User } from "lucide-react";
import LandingHeader from "./headers/LandingHeader.tsx";
import { authenticatedClient } from "./helpers/api.js";
import { useAuth } from "./auth/AuthProvider.jsx";
import { Button } from "./components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./components/ui/card";
import { Separator } from "./components/ui/separator";
import Footer from "./shared/Footer.tsx";

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
        <div className="min-h-screen bg-[var(--bg-main)]">
            <LandingHeader />

            <main className="mx-auto flex w-full max-w-6xl items-center justify-center px-4 pb-14">
                <Card className="w-full max-w-md rounded-[28px] border border-white/10 bg-white/5 text-[var(--text-main)] shadow-[0_16px_40px_rgba(0,0,0,0.25)]">
                    <CardHeader className="space-y-2 px-8 pt-9 text-center">
                        <CardTitle className="font-display text-4xl font-semibold tracking-[-0.02em]">Create your account</CardTitle>
                        <CardDescription className="text-sm text-[var(--text-muted)]">
                            Start your corecomp journey in less than a minute
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="px-8 pb-8">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="signup-username" className="mb-1 block text-sm">username</label>
                                <div className="relative">
                                    <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
                                    <input
                                        id="signup-username"
                                        value={username}
                                        onChange={(event) => setUsername(event.target.value)}
                                        className="h-12 w-full rounded-xl border border-[var(--line-muted)] bg-[var(--bg-main)] pl-10 pr-3 text-[var(--text-main)] outline-none ring-offset-[var(--bg-main)] placeholder:text-[var(--text-muted)] focus-visible:ring-2 focus-visible:ring-[var(--line-muted)]"
                                        placeholder="Choose a username"
                                    />
                                </div>
                                <p className="mt-1 min-h-5 text-sm text-[var(--main-brick)]">{usernameError || " "}</p>
                            </div>

                            <div>
                                <label htmlFor="signup-email" className="mb-1 block text-sm">email</label>
                                <div className="relative">
                                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
                                    <input
                                        id="signup-email"
                                        value={email}
                                        onChange={(event) => setEmail(event.target.value)}
                                        className="h-12 w-full rounded-xl border border-[var(--line-muted)] bg-[var(--bg-main)] pl-10 pr-3 text-[var(--text-main)] outline-none ring-offset-[var(--bg-main)] placeholder:text-[var(--text-muted)] focus-visible:ring-2 focus-visible:ring-[var(--line-muted)]"
                                        placeholder="name@email.com"
                                    />
                                </div>
                                <p className="mt-1 min-h-5 text-sm text-[var(--main-brick)]">{emailError || " "}</p>
                            </div>

                            <div>
                                <label htmlFor="signup-password" className="mb-1 block text-sm">password</label>
                                <div className="relative">
                                    <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
                                    <input
                                        id="signup-password"
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(event) => setPassword(event.target.value)}
                                        className="h-12 w-full rounded-xl border border-[var(--line-muted)] bg-[var(--bg-main)] pl-10 pr-10 text-[var(--text-main)] outline-none ring-offset-[var(--bg-main)] placeholder:text-[var(--text-muted)] focus-visible:ring-2 focus-visible:ring-[var(--line-muted)]"
                                        placeholder="Create a password"
                                    />
                                    <button
                                        type="button"
                                        aria-label="toggle password visibility"
                                        onClick={() => setShowPassword((show) => !show)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
                                    >
                                        {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                                    </button>
                                </div>
                                <p className="mt-1 min-h-5 text-sm text-[var(--main-brick)]">{passwordError || " "}</p>
                            </div>

                            <div>
                                <label htmlFor="signup-confirm-password" className="mb-1 block text-sm">confirm password</label>
                                <div className="relative">
                                    <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
                                    <input
                                        id="signup-confirm-password"
                                        type={showPassword ? "text" : "password"}
                                        value={confirmPassword}
                                        onChange={(event) => setConfirmPassword(event.target.value)}
                                        className="h-12 w-full rounded-xl border border-[var(--line-muted)] bg-[var(--bg-main)] pl-10 pr-3 text-[var(--text-main)] outline-none ring-offset-[var(--bg-main)] placeholder:text-[var(--text-muted)] focus-visible:ring-2 focus-visible:ring-[var(--line-muted)]"
                                        placeholder="Confirm your password"
                                    />
                                </div>
                                <p className="mt-1 min-h-5 text-sm text-[var(--main-brick)]">{confirmPasswordError || " "}</p>
                            </div>

                            <Button
                                type="submit"
                                variant="forest"
                                className="h-12 w-full rounded-xl text-base font-semibold shadow-[0_10px_22px_rgba(0,0,0,0.25)]"
                                aria-label="sign-up-button"
                            >
                                Sign Up
                            </Button>
                        </form>

                        <div className="pt-2">
                            <div className="flex flex-col items-center gap-2">
                                <Separator className="w-full bg-[var(--line-muted)]/70" />
                                <span className="text-xs uppercase tracking-[0.22em] text-[var(--text-muted)]">or continue with</span>
                                <Separator className="w-full bg-[var(--line-muted)]/70" />
                            </div>

                            <div className="mt-4 flex justify-center bg-[var(--bg-main)]/45 p-2">
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
                        </div>

                        <p className="pt-3 text-center text-sm text-[var(--text-muted)]">
                            Already have an account? {" "}
                            <button
                                type="button"
                                onClick={() => navigate("/sign-in")}
                                className="font-semibold text-[var(--text-main)] underline underline-offset-2"
                            >
                                Sign in
                            </button>
                        </p>
                    </CardContent>
                </Card>
            </main>

            <div className="mx-auto w-full max-w-6xl px-4 pb-10">
                <Footer />
            </div>
        </div>
    );
}


export default SignUp;
