import { useState } from "react";
import LandingHeader from "./headers/LandingHeader.tsx";
import { authenticatedClient } from "./helpers/api.js";
import { Button } from "./components/ui/button";

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
        <div className="mx-auto max-w-6xl px-4 pb-12">
            <LandingHeader />
            <div className="mt-8 flex justify-center">
                <div className="w-full max-w-xl rounded-2xl bg-[var(--main-dust-grey)] p-6 text-[var(--main-pine-teal)]">
                    <h1 className="text-4xl font-bold">Reset your password</h1>
                    <p className="mt-4 text-sm">
                        {success ? "Recovery email has been sent!" : "Enter your email and we will send you a recovery email"}
                    </p>
                    <form onSubmit={handleSubmit} className="mt-10 space-y-8">
                        <div>
                            <label htmlFor="reset-email" className="mb-1 block text-sm">email</label>
                            <input
                                id="reset-email"
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                                className="w-full rounded-md border border-[var(--line-muted)] bg-[var(--bg)] px-3 py-2"
                            />
                            <p className="mt-1 min-h-5 text-sm text-red-700">{emailError || " "}</p>
                        </div>
                        <div className="flex justify-end">
                            <Button type="submit" variant="forest">send</Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}


export default ResetPassword;
