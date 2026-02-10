import { useAuth } from "./AuthProvider.jsx"
import { Navigate } from "react-router-dom";

function AuthenticatedRoute({ children }) {
    const { user, loading } = useAuth();
    console.log(user);

    // TODO: make a loading page
    if (loading) return <div>Loading...</div>;

    if (!user) return <Navigate to="/sign-in" replace />;

    return children
}

export default AuthenticatedRoute