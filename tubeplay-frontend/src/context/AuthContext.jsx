import { createContext, useContext, useEffect, useState } from "react";
import { api, endpoints, payload } from "../lib/api";
const AuthContext = createContext(null);
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!localStorage.getItem("tubeplay_access_token")) { setLoading(false); return; }
    endpoints.currentUser().then(r => setUser(payload(r))).catch(() => setUser(null)).finally(() => setLoading(false));
  }, []);
  const login = async (credentials) => {
    const res = await endpoints.login(credentials);
    const data = payload(res);
    if (data?.accessToken) localStorage.setItem("tubeplay_access_token", data.accessToken);
    if (data?.refreshToken) localStorage.setItem("tubeplay_refresh_token", data.refreshToken);
    setUser(data?.user || data);
    return data;
  };
  const register = async (form) => { const res = await endpoints.register(form); return payload(res); };
  const logout = async () => {
    try { await endpoints.logout(); } finally {
      localStorage.removeItem("tubeplay_access_token"); localStorage.removeItem("tubeplay_refresh_token"); setUser(null);
    }
  };
  const value = { user, setUser, loading, login, register, logout, authenticated: !!user };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
export const useAuth = () => useContext(AuthContext);