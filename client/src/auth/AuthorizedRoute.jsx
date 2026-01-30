import { useAuth } from "./AuthProvider.jsx"
import { Navigate } from "react-router-dom";


function AuthorizedRoute() {
    const { user, loading } = useAuth();
    const authorizedStatuses = ["active", "trialing"];

    if (loading) return <div>Loading...</div>;

    if (!authorizedStatuses.includes(user.subscription_status)) {
        return <Navigate to="/authenticated-user-account" replace />;
    }

    return children
}

export default AuthorizedRoute