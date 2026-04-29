import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { Eye, EyeOff, Lock, User } from "lucide-react";
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

function SignIn() {
    const { setUser } = useAuth();
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [usernameError, setUsernameError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [open, setOpen] = useState(false);

    async function handleClickResendEmail() {
        const payload = { username };
        const response = await authenticatedClient({ endpoint: "/accounts/resend-verify-email", payload });
        const data = await response.json();
        console.log(data);
        setOpen(false);
    }

    async function handleSubmit(event) {
        event.preventDefault();
        const payload = { username, password };
        const response = await authenticatedClient({ endpoint: "/accounts/sign-in", payload });
        const data = await response.json();

        if (!response.ok) {
            console.log(data);
            if ("username" in data) setUsernameError(fieldToText(data.username));
            if ("password" in data) setPasswordError(fieldToText(data.password));
            if ("detail" in data) {
                const detail = fieldToText(data.detail);
                if (detail === "This account is inactive") {
                    setUsernameError(detail);
                    setPasswordError(detail);
                    setOpen(true);
                    return;
                }
                setUsernameError(detail);
                setPasswordError(detail);
                setUsername("");
                setPassword("");
            }
            return;
        }

        setUser(data);
        navigate("/overview");
    }

    return (
        <div className="min-h-screen bg-[var(--bg-main)]">
            <LandingHeader />

            <main className="mx-auto flex w-full max-w-6xl items-center justify-center px-4 pb-14">
                <Card className="w-full max-w-md rounded-[28px] border border-white/10 bg-white/5 text-[var(--text-main)] shadow-[0_16px_40px_rgba(0,0,0,0.25)]">
                    <CardHeader className="space-y-2 px-8 pt-9 text-center">
                        <CardTitle className="font-display text-4xl font-semibold tracking-[-0.02em]">Welcome back</CardTitle>
                        <CardDescription className="text-sm text-[var(--text-muted)]">
                            An &ldquo;every Core detail of a Company&rdquo; app
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="px-8 pb-8">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="signin-username" className="mb-1 block text-sm">username</label>
                                <div className="relative">
                                    <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
                                    <input
                                        id="signin-username"
                                        value={username}
                                        onChange={(event) => setUsername(event.target.value)}
                                        className="h-12 w-full rounded-xl border border-[var(--line-muted)] bg-[var(--bg-main)] pl-10 pr-3 text-[var(--text-main)] outline-none ring-offset-[var(--bg-main)] placeholder:text-[var(--text-muted)] focus-visible:ring-2 focus-visible:ring-[var(--line-muted)]"
                                        placeholder="Enter your username"
                                    />
                                </div>
                                <p className="mt-1 min-h-5 text-sm text-[var(--main-brick)]">{usernameError || " "}</p>
                            </div>

                            <div>
                                <label htmlFor="signin-password" className="mb-1 block text-sm">password</label>
                                <div className="relative">
                                    <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
                                    <input
                                        id="signin-password"
                                        value={password}
                                        onChange={(event) => setPassword(event.target.value)}
                                        type={showPassword ? "text" : "password"}
                                        className="h-12 w-full rounded-xl border border-[var(--line-muted)] bg-[var(--bg-main)] pl-10 pr-10 text-[var(--text-main)] outline-none ring-offset-[var(--bg-main)] placeholder:text-[var(--text-muted)] focus-visible:ring-2 focus-visible:ring-[var(--line-muted)]"
                                        placeholder="Enter your password"
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

                            <button
                                type="button"
                                onClick={() => navigate("/reset-password")}
                                className="w-full text-right text-xs text-[var(--text-muted)] underline underline-offset-2 hover:text-[var(--text-main)]"
                            >
                                Forgot your password?
                            </button>

                            <Button
                                type="submit"
                                variant="forest"
                                className="h-12 w-full rounded-xl text-base font-semibold shadow-[0_10px_22px_rgba(0,0,0,0.25)]"
                                aria-label="sign in button"
                            >
                                Sign In
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
                            New to corecomp? {" "}
                            <button
                                type="button"
                                onClick={() => navigate("/sign-up")}
                                className="font-semibold text-[var(--text-main)] underline underline-offset-2"
                            >
                                Create an account
                            </button>
                        </p>
                    </CardContent>
                </Card>
            </main>

            <div className="mx-auto w-full max-w-6xl px-4 pb-10">
                <Footer />
            </div>

            {open ? (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" role="dialog" aria-modal="true">
                    <div className="w-full max-w-md rounded-xl border border-[var(--line-muted)] bg-[var(--card-main)] p-6 text-[var(--card-text)] shadow-xl">
                        <p className="text-sm leading-6">
                            Your account is not yet activated, account can be activated by the email we sent when you first sign up.
                            Couldn't find the email?
                        </p>
                        <div className="mt-5 flex justify-end gap-2">
                            <Button type="button" variant="outline" onClick={() => setOpen(false)}>No</Button>
                            <Button
                                type="button"
                                variant="forest"
                                onClick={handleClickResendEmail}
                                aria-label="resend-email-button"
                            >
                                Resend
                            </Button>
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
    );
}


export default SignIn;
