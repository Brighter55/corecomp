import { useState } from "react";
import { Mail } from "lucide-react";
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

function ResetPassword() {
    const [email, setEmail] = useState("");
    const [emailError, setEmailError] = useState("");
    const [success, setSuccess] = useState(false);

    async function handleSubmit(event) {
        event.preventDefault();
        setEmailError("");
        const payload = { email };

        const response = await authenticatedClient({ endpoint: "/accounts/reset-password", payload });
        const data = await response.json();
        console.log(data);

        if (!response.ok) {
            if (data.email) setEmailError(fieldToText(data.email));
            return;
        }

        setSuccess(true);
    }

    return (
        <div className="min-h-screen bg-[var(--bg-main)]">
            <LandingHeader />

            <main className="mx-auto flex w-full max-w-6xl items-center justify-center px-4 pb-14">
                <Card className="w-full max-w-md rounded-[28px] border border-white/10 bg-white/5 text-[var(--text-main)] shadow-[0_16px_40px_rgba(0,0,0,0.25)] h-[25rem]">
                    <CardHeader className="space-y-2 px-8 pt-9 text-center">
                        <CardTitle className="font-display text-4xl font-semibold tracking-[-0.02em]">Reset your password</CardTitle>
                        <CardDescription className="text-sm text-[var(--text-muted)]">
                            {success ? "Recovery email has been sent!" : "Enter your email and we will send you a recovery email"}
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="px-8 pb-8">
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label htmlFor="reset-email" className="mb-1 block text-sm">email</label>
                                <div className="relative">
                                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
                                    <input
                                        id="reset-email"
                                        value={email}
                                        onChange={(event) => setEmail(event.target.value)}
                                        className="h-12 w-full rounded-xl border border-[var(--line-muted)] bg-[var(--bg-main)] pl-10 pr-3 text-[var(--text-main)] outline-none ring-offset-[var(--bg-main)] placeholder:text-[var(--text-muted)] focus-visible:ring-2 focus-visible:ring-[var(--line-muted)]"
                                        placeholder="Enter your email"
                                    />
                                </div>
                                <p className="mt-1 min-h-5 text-sm text-[var(--main-brick)]">{emailError || " "}</p>
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


export default ResetPassword;
