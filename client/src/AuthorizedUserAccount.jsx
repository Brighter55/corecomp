import ProductHeader from "./headers/product-header/ProductHeader.jsx"
import { authenticatedClient } from "./helpers/api.js"
import { useAuth } from "./auth/AuthProvider.jsx"
import TwoColumn from "./shared/TwoColumn.jsx";
import { Button } from "./components/ui/button";


function ArthorizedUserAccount() {
    const { user } = useAuth();
    async function handleManageClicked() {
        const response = await authenticatedClient({endpoint: "/billings/portal-session"});
        const data = await response.json();
        const portalURL = data.url;
        window.location.href = portalURL;
    }

    return (
        <div className="min-h-screen">
            <ProductHeader />
            <div className="mx-auto max-w-6xl px-4 pb-12">
                <div className="space-y-4">
                    <TwoColumn>
                        <h2 className="text-2xl font-semibold">Username</h2>
                        <p className="text-lg">{user.username}</p>
                    </TwoColumn>
                    <hr className="border-[var(--line-muted)]" />
                    <TwoColumn>
                        <h2 className="text-2xl font-semibold">email</h2>
                        <p className="text-lg">{user.email}</p>
                    </TwoColumn>
                    <hr className="border-[var(--line-muted)]" />
                    <TwoColumn>
                        <h2 className="text-2xl font-semibold">Status</h2>
                        <p className="text-lg">{user.subscription_status}</p>
                    </TwoColumn>
                    <hr className="border-[var(--line-muted)]" />
                    <TwoColumn>
                        <h2 className="text-2xl font-semibold">Period Start</h2>
                        <p className="text-lg">{user.current_period_start}</p>
                    </TwoColumn>
                    <hr className="border-[var(--line-muted)]" />
                    <TwoColumn>
                        <h2 className="text-2xl font-semibold">Period End</h2>
                        <p className="text-lg">{user.current_period_end}</p>
                    </TwoColumn>
                    <hr className="border-[var(--line-muted)]" />
                    <TwoColumn>
                        <h2 className="text-2xl font-semibold">Subscription</h2>
                        <Button onClick={handleManageClicked} variant="forest">
                            Manage your billing
                        </Button>
                    </TwoColumn>
                </div>
            </div>
        </div>
    )
}

export default ArthorizedUserAccount
