import { useNavigate } from "react-router-dom";
import ProductHeader from "./headers/product-header/ProductHeader.jsx";
import { authenticatedClient } from "./helpers/api.js";
import { useAuth } from "./auth/AuthProvider.jsx";
import { Button } from "./components/ui/button";
import TwoColumn from "./shared/TwoColumn.jsx";

function Account() {
    const { user, setUser } = useAuth();
    const navigate = useNavigate();

    async function handleSignoutClicked() {
        await authenticatedClient({ endpoint: "/accounts/sign-out" });
        setUser(null);
        navigate("/login");
    }

    return (
        <div className="min-h-screen">
            <ProductHeader />
            <div className="mx-auto max-w-6xl px-4 pb-12">
                <div className="space-y-2">
                    <TwoColumn>
                        <h2 className="text-2xl font-semibold">Username</h2>
                        <p className="text-lg">{user.username}</p>
                    </TwoColumn>
                    <hr className="border-[var(--line-muted)]" />
                    <TwoColumn>
                        <h2 className="text-2xl font-semibold">Email</h2>
                        <p className="text-lg">{user.email}</p>
                    </TwoColumn>
                    <hr className="border-[var(--line-muted)]" />
                    <TwoColumn>
                        <h2 className="text-2xl font-semibold">Account</h2>
                        <p className="text-lg">Free — signed in with Google</p>
                    </TwoColumn>
                    <hr className="border-[var(--line-muted)]" />
                    <TwoColumn>
                        <h2 className="text-2xl font-semibold">Sign Out</h2>
                        <Button onClick={handleSignoutClicked} variant="closeOut" className="rounded-xl">
                            Sign Out
                        </Button>
                    </TwoColumn>
                </div>
            </div>
        </div>
    )
}

export default Account
