import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import LandingHeader from "./headers/LandingHeader.tsx";
import { authenticatedClient } from "./helpers/api.js";
import { Button } from "./components/ui/button";

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
        <div className="mx-auto max-w-6xl px-4 pb-12">
            <LandingHeader />
            <div className="mt-8 flex justify-center">
                <div className="w-full max-w-xl rounded-2xl bg-[var(--main-dust-grey)] p-6 text-[var(--main-pine-teal)]">
                    <h1 className="text-4xl font-bold">Reset your Password</h1>
                    <p className="mt-4 text-sm">Enter your new password and we will reset the password for you</p>
                    <span className="block text-sm text-red-700">{idError || ""}</span>
                    <span className="block text-sm text-red-700">{tokenError || ""}</span>

                    <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                        <div>
                            <label htmlFor="confirm-reset-password" className="mb-1 block text-sm">password</label>
                            <div className="relative">
                                <input
                                    id="confirm-reset-password"
                                    value={password}
                                    onChange={(event) => setPassword(event.target.value)}
                                    type={showPassword ? "text" : "password"}
                                    className="w-full rounded-md border border-[var(--line-muted)] bg-[var(--bg)] px-3 py-2 pr-10"
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
                            <p className="mt-1 min-h-5 text-sm text-red-700">{passwordError || " "}</p>
                        </div>

                        <div>
                            <label htmlFor="confirm-reset-confirm-password" className="mb-1 block text-sm">confirm-password</label>
                            <input
                                id="confirm-reset-confirm-password"
                                value={confirmPassword}
                                onChange={(event) => setConfirmPassword(event.target.value)}
                                type={showPassword ? "text" : "password"}
                                className="w-full rounded-md border border-[var(--line-muted)] bg-[var(--bg)] px-3 py-2"
                            />
                            <p className="mt-1 min-h-5 text-sm text-red-700">{confirmPasswordError || " "}</p>
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


export default ConfirmResetPassword;
