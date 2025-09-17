import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { checkAuthStatus } from '../api/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [auth, setAuth] = useState({ loading: true, authenticated: false, user: null });
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAuth = async () => {
            try {
                const data = await checkAuthStatus();
                setAuth({ loading: false, authenticated: true, user: data.data });

                // Redirect only if on auth-related pages
                if (window.location.pathname === '/' || window.location.pathname === '/login') {
                    window.location.href = import.meta.env.VITE_CAREER_GUIDANCE_PLATFORM_URL;
                }

            } catch {
                setAuth({ loading: false, authenticated: false, user: null });
            }
        };

        fetchAuth();
    }, [navigate]);

    return (
        <AuthContext.Provider value={{ auth, setAuth }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
