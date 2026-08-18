import { useAuth } from "./AuthProvider.jsx"
import { Navigate } from "react-router-dom";

function AuthenticatedRoute({ children }) {
    const { user, loading } = useAuth();

    // TODO: make a loading page
    if (loading) return <div>Loading...</div>;

    if (!user) return <Navigate to="/login" replace />;

    return children
}

export default AuthenticatedRoute