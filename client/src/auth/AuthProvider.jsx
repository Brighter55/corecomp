import { createContext, useState, useEffect, useContext } from "react";
import { authenticatatedClient } from "../helpers/api.jsx"

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function getUser() {
            try {
                const response = await authenticatatedClient({endpoint: "/accounts/me"});
                const data = await response.json();
                setUser(data);
                setLoading(false);
            } catch (error) {
                setUser(null);
                setLoading(false);
            }
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