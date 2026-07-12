import { createContext, useContext, useState, useEffect } from 'react';
import { apiLogin, apiSignup, apiGetMe, apiLogout } from '../api/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount — restore session from token
  useEffect(() => {
    const token = localStorage.getItem('transitops_token');
    if (token) {
      apiGetMe()
        .then(u => setUser(u))
        .catch(() => {
          localStorage.removeItem('transitops_token');
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  async function login(email, password) {
    const data = await apiLogin(email, password);
    setUser(data.user);
    return data.user;
  }

  async function signup(name, email, password, role) {
    const data = await apiSignup(name, email, password, role);
    setUser(data.user);
    return data.user;
  }

  function logout() {
    apiLogout();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isAuthenticated: !!user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
