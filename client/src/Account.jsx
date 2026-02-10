// a gateway between authenticated account and authorized account
import { useAuth } from "./auth/AuthProvider.jsx"
import AuthenticatedUserAccount from "./AuthenticatedUserAccount.jsx"
import AuthorizedUserAccount from "./AuthorizedUserAccount.jsx"


function Account() {
    const { user, loading } = useAuth();
    const authorizedStatuses = ["active", "trialing"];
    console.log(user);
    if (loading) return <div>Loading...</div>;

    if (!authorizedStatuses.includes(user.subscription_status)) {
        return <AuthenticatedUserAccount />
    }

    return <AuthorizedUserAccount />
}

export default Account