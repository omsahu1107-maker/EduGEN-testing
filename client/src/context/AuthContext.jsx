import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const saved = localStorage.getItem('edugen_user');
        return saved ? JSON.parse(saved) : null;
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('edugen_token');
        if (token) {
            api.get('/auth/me')
                .then(res => {
                    setUser(res.data.user);
                    localStorage.setItem('edugen_user', JSON.stringify(res.data.user));
                })
                .catch(() => {
                    localStorage.removeItem('edugen_token');
                    localStorage.removeItem('edugen_user');
                    setUser(null);
                })
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    const login = async (email, password) => {
        const res = await api.post('/auth/login', { email, password });
        const { token, user } = res.data;
        localStorage.setItem('edugen_token', token);
        localStorage.setItem('edugen_user', JSON.stringify(user));
        setUser(user);
        return user;
    };

    const register = async (name, email, password) => {
        const res = await api.post('/auth/register', { name, email, password });
        const { token, user } = res.data;
        localStorage.setItem('edugen_token', token);
        localStorage.setItem('edugen_user', JSON.stringify(user));
        setUser(user);
        return user;
    };

    const logout = () => {
        api.post('/auth/logout').catch(() => { });
        localStorage.removeItem('edugen_token');
        localStorage.removeItem('edugen_user');
        setUser(null);
    };

    const updateUser = (updates) => {
        const updated = { ...user, ...updates };
        setUser(updated);
        localStorage.setItem('edugen_user', JSON.stringify(updated));
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
    return ctx;
};
