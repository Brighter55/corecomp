import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock } from "lucide-react";
import LandingHeader from "./headers/LandingHeader.tsx";
import { authenticatedClient } from "./helpers/api.js";
import { Button } from "./components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./components/ui/card";
import Footer from "./shared/Footer.tsx";

function fieldToText(value) {
  if (Array.isArray(value)) return value.join(" ");
  if (value == null) return "";
  return String(value);
}

function ConfirmResetPassword() {
    const navigate = useNavigate();
    const { token, id } = useParams();

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [confirmPasswordError, setConfirmPasswordError] = useState("");
    const [idError, setIdError] = useState("");
    const [tokenError, setTokenError] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    async function handleSubmit(event) {
        event.preventDefault();
        setPasswordError("");
        setConfirmPasswordError("");
        setIdError("");
        setTokenError("");

        const payload = { password, confirmPassword, id, token };
        const response = await authenticatedClient({ endpoint: "/accounts/confirm-reset-password", payload });
        const data = await response.json();
        console.log(data);

        if (!response.ok) {
            for (const field in data) {
                if (field === "password") {
                    setPasswordError(fieldToText(data.password));
                } else if (field === "confirmPassword") {
                    setConfirmPasswordError(fieldToText(data.confirmPassword));
                } else if (field === "id") {
                    setIdError(fieldToText(data.id));
                } else if (field === "token") {
                    setTokenError(fieldToText(data.token));
                } else if (field === "non_field_errors") {
                    const message = fieldToText(data.non_field_errors);
                    setPasswordError(message);
                    setConfirmPasswordError(message);
                }
            }
            return;
        }

        navigate("/sign-in");
    }

    return (
        <div className="min-h-screen bg-[var(--bg-main)]">
            <LandingHeader />

            <main className="mx-auto flex w-full max-w-6xl items-center justify-center px-4 pb-14">
                <Card className="w-full max-w-md rounded-[28px] border border-white/10 bg-white/5 text-[var(--text-main)] shadow-[0_16px_40px_rgba(0,0,0,0.25)]">
                    <CardHeader className="space-y-2 px-8 pt-9 text-center">
                        <CardTitle className="font-display text-4xl font-semibold tracking-[-0.02em]">Reset your Password</CardTitle>
                        <CardDescription className="text-sm text-[var(--text-muted)]">
                            Enter your new password and we will reset the password for you
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="px-8 pb-8">
                        <p className="min-h-5 text-sm text-[var(--main-brick)]">{idError || " "}</p>
                        <p className="min-h-5 text-sm text-[var(--main-brick)]">{tokenError || " "}</p>

                        <form onSubmit={handleSubmit} className="mt-3 space-y-4">
                            <div>
                                <label htmlFor="confirm-reset-password" className="mb-1 block text-sm">password</label>
                                <div className="relative">
                                    <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
                                    <input
                                        id="confirm-reset-password"
                                        value={password}
                                        onChange={(event) => setPassword(event.target.value)}
                                        type={showPassword ? "text" : "password"}
                                        className="h-12 w-full rounded-xl border border-[var(--line-muted)] bg-[var(--bg-main)] pl-10 pr-10 text-[var(--text-main)] outline-none ring-offset-[var(--bg-main)] placeholder:text-[var(--text-muted)] focus-visible:ring-2 focus-visible:ring-[var(--line-muted)]"
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
                                <label htmlFor="confirm-reset-confirm-password" className="mb-1 block text-sm">confirm-password</label>
                                <div className="relative">
                                    <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
                                    <input
                                        id="confirm-reset-confirm-password"
                                        value={confirmPassword}
                                        onChange={(event) => setConfirmPassword(event.target.value)}
                                        type={showPassword ? "text" : "password"}
                                        className="h-12 w-full rounded-xl border border-[var(--line-muted)] bg-[var(--bg-main)] pl-10 pr-3 text-[var(--text-main)] outline-none ring-offset-[var(--bg-main)] placeholder:text-[var(--text-muted)] focus-visible:ring-2 focus-visible:ring-[var(--line-muted)]"
                                    />
                                </div>
                                <p className="mt-1 min-h-5 text-sm text-[var(--main-brick)]">{confirmPasswordError || " "}</p>
                            </div>

                            <Button
                                type="submit"
                                variant="forest"
                                className="h-12 w-full rounded-xl text-base font-semibold shadow-[0_10px_22px_rgba(0,0,0,0.25)]"
                            >
                                send
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </main>

            <div className="mx-auto w-full max-w-6xl px-4 pb-10">
                <Footer />
            </div>
        </div>
    );
}


export default ConfirmResetPassword;
