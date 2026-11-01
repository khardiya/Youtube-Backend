
import {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";

import {
    endpoints,
    payload,
} from "../lib/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Restore session when the application starts
    useEffect(() => {
        const restoreSession = async () => {
            try {
                let accessToken = localStorage.getItem(
                    "tubeplay_access_token"
                );

                // If access token is missing, use the refresh cookie
                if (!accessToken) {
                    const refreshResponse =
                        await endpoints.refreshSession();

                    const refreshData = payload(refreshResponse);

                    accessToken = refreshData?.accessToken;

                    if (!accessToken) {
                        throw new Error("Session restoration failed");
                    }

                    localStorage.setItem(
                        "tubeplay_access_token",
                        accessToken
                    );
                }

                const response = await endpoints.currentUser();

                setUser(payload(response));

            } catch (error) {
                localStorage.removeItem("tubeplay_access_token");
                setUser(null);

            } finally {
                setLoading(false);
            }
        };

        restoreSession();
    }, []);

    // Login
    const login = async (credentials) => {
        const response = await endpoints.login(credentials);
        const data = payload(response);

        if (!data?.accessToken) {
            throw new Error("Access token missing from login response");
        }

        localStorage.setItem(
            "tubeplay_access_token",
            data.accessToken
        );

        // Refresh token is stored only in the httpOnly cookie
        setUser(data.user || data);

        return data;
    };

    // Register
    const register = async (form) => {
        const response = await endpoints.register(form);
        return payload(response);
    };

    // Logout
    const logout = async () => {
        try {
            await endpoints.logout();

        } finally {
            localStorage.removeItem("tubeplay_access_token");
            setUser(null);
        }
    };

    const value = {
        user,
        setUser,
        loading,
        login,
        register,
        logout,
        authenticated: !!user,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
