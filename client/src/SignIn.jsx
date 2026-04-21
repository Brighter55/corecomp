import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { Eye, EyeOff } from "lucide-react";
import LandingHeader from "./headers/LandingHeader.tsx";
import { authenticatedClient } from "./helpers/api.js";
import { useAuth } from "./auth/AuthProvider.jsx";
import { Button } from "./components/ui/button";

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
        <div className="mx-auto max-w-6xl px-4 pb-12">
            <LandingHeader />

            <div className="grid overflow-hidden rounded-xl border border-[var(--line-muted)] md:grid-cols-2">
                <section className="bg-[var(--main-brown)] px-6 py-10 text-[var(--main-dust-grey)] md:px-10">
                    <div className="mx-auto w-full max-w-md">
                        <h1 className="mb-6 text-4xl font-semibold">Sign In</h1>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="signin-username" className="mb-1 block text-sm">username</label>
                                <input
                                    id="signin-username"
                                    value={username}
                                    onChange={(event) => setUsername(event.target.value)}
                                    className="w-full rounded-md border border-[var(--main-dust-grey)]/30 bg-white/95 px-3 py-2 text-[var(--main-pine-teal)] outline-none"
                                />
                                <p className="mt-1 min-h-5 text-sm text-red-200">{usernameError || " "}</p>
                            </div>

                            <div>
                                <label htmlFor="signin-password" className="mb-1 block text-sm">password</label>
                                <div className="relative">
                                    <input
                                        id="signin-password"
                                        value={password}
                                        onChange={(event) => setPassword(event.target.value)}
                                        type={showPassword ? "text" : "password"}
                                        className="w-full rounded-md border border-[var(--main-dust-grey)]/30 bg-white/95 px-3 py-2 pr-10 text-[var(--main-pine-teal)] outline-none"
                                    />
                                    <button
                                        type="button"
                                        aria-label="toggle password visibility"
                                        onClick={() => setShowPassword((show) => !show)}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--main-pine-teal)]"
                                    >
                                        {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                                    </button>
                                </div>
                                <p className="mt-1 min-h-5 text-sm text-red-200">{passwordError || " "}</p>
                            </div>

                            <Button type="submit" variant="forest" className="w-full" aria-label="sign in button">
                                Sign in
                            </Button>
                        </form>

                        <button
                            type="button"
                            onClick={() => navigate("/reset-password")}
                            className="mt-3 text-sm underline underline-offset-2"
                        >
                            forgot your password?
                        </button>

                        <div className="my-6 flex items-center gap-3">
                            <div className="h-px flex-1 bg-[var(--main-dust-grey)]/40" />
                            <span className="text-sm">or</span>
                            <div className="h-px flex-1 bg-[var(--main-dust-grey)]/40" />
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

                <section className="flex items-center justify-center bg-[var(--main-dust-grey)] px-6 py-10 text-center">
                    <p className="max-w-sm text-2xl font-medium text-[var(--main-fern)]">
                        an "every Core detail of a Company" app
                    </p>
                </section>
            </div>

            {open ? (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" role="dialog" aria-modal="true">
                    <div className="w-full max-w-md rounded-lg bg-white p-6 text-[var(--main-pine-teal)] shadow-xl">
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
