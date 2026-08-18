import { useLocation, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "./auth/AuthProvider.jsx";
import LandingHeader from "./headers/LandingHeader.tsx";
import Footer from "./shared/Footer.tsx";
import { authenticatedClient } from "./helpers/api.js";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

function Login() {
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const message = (location.state as { message?: string } | null)?.message;

  function handleGoogleSuccess(credentialResponse: { credential?: string }) {
    const payload = { JWTToken: credentialResponse.credential };
    async function sendJWTToken() {
      const response = await authenticatedClient({ endpoint: "/accounts/google-authentication", payload });
      const data = await response.json();
      if (!response.ok) {
        return;
      }
      setUser(data);
      navigate("/overview");
    }
    sendJWTToken();
  }

  return (
    <div className="min-h-screen bg-[var(--bg-main)]">
      <LandingHeader />

      <main className="mx-auto flex w-full max-w-6xl items-center justify-center px-4 pb-14">
        <Card className="w-full max-w-md rounded-[28px] border border-white/10 bg-white/5 text-[var(--text-main)] shadow-[0_16px_40px_rgba(0,0,0,0.25)]">
          <CardHeader className="space-y-2 px-8 pt-9 text-center">
            <CardTitle className="font-display text-4xl font-semibold tracking-[-0.02em]">Sign in to CoreComp</CardTitle>
            <CardDescription className="text-sm text-[var(--text-muted)]">
              Get unlimited access to every core detail of a company
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 px-8 pb-8">
            {message ? (
              <p className="rounded-xl border border-[var(--main-brick)]/40 bg-[var(--main-brick)]/10 px-4 py-3 text-sm text-[var(--main-brick)]">
                {message}
              </p>
            ) : null}

            <div className="flex justify-center bg-[var(--bg-main)]/45 p-2">
              <GoogleLogin
                onSuccess={(credentialResponse) => handleGoogleSuccess(credentialResponse)}
                onError={() => console.log("Log in failed")}
                useOneTap
                text="continue_with"
                shape="pill"
                size="large"
              />
            </div>

            <p className="pt-2 text-center text-xs text-[var(--text-muted)]">
              Guests get 5 free searches per month. Sign in with Google for unlimited access.
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

export default Login;
