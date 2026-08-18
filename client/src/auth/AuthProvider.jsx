import { createContext, useState, useEffect, useContext } from "react";
import { authenticatedClient } from "../helpers/api.js"

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function getUser() {
            const response = await authenticatedClient({endpoint: "/accounts/me"});
            if (!response.ok) {
                setUser(null);
                setLoading(false);
                return;
            }
            const data = await response.json();
            setUser(data);
            setLoading(false);
        }

        
        getUser();
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading, setUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}