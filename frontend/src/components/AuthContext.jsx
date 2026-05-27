import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { apiFetch } from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const checkAuth = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setUser(null);
            setLoading(false);
            return;
        }

        try {
            const res = await apiFetch('/api/auth/me');
            if (res.ok) {
                const data = await res.json();
                setUser(data.user);
            } else {
                localStorage.removeItem('token');
                setUser(null);
            }
        } catch (err) {
            console.error("Auth check failed:", err);
            localStorage.removeItem('token');
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkAuth();

        const handleUnauthorized = () => {
            setUser(null);
            navigate('/login');
        };

        window.addEventListener('auth-unauthorized', handleUnauthorized);
        return () => {
            window.removeEventListener('auth-unauthorized', handleUnauthorized);
        };
    }, [navigate]);

    const logout = async () => {
        try {
            await apiFetch('/api/auth/logout', { method: 'POST' });
        } catch (err) {
            console.error("Logout request failed:", err);
        }
        localStorage.removeItem('token');
        setUser(null);
        navigate('/login');
    };

    return (
        <AuthContext.Provider value={{ user, setUser, loading, checkAuth, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
