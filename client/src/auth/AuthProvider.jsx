import { createContext, useState, useEffect, useContext } from "react";
import { authenticatedClient } from "../helpers/api.js"

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function getUser() {
            try {
                const response = await authenticatedClient({endpoint: "/accounts/me"});
                if (!response.ok) {
                    setUser(null);
                    return;
                }
                setUser(await response.json());
            } catch {
                // A rejected request (backend down, request aborted) or a
                // non-JSON body must still settle `loading`. Otherwise it stays
                // true forever and AuthenticatedRoute -- which has no timeout of
                // its own -- renders "Loading..." permanently, so one blip
                // bricks every route rather than just failing to sign you in.
                setUser(null);
            } finally {
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