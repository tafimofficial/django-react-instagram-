import { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkUser();
    }, []);

    const checkUser = async () => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const res = await api.get('users/me/');
                setUser(res.data);
            } catch (err) {
                localStorage.removeItem('token');
                setUser(null);
            }
        }
        setLoading(false);
    };

    const login = async (username, password) => {
        try {
            const res = await api.post('auth/login/', { username, password });
            localStorage.setItem('token', res.data.token);
            await checkUser();
            return { success: true };
        } catch (err) {
            return { success: false, error: err.response?.data?.non_field_errors?.[0] || 'Login failed' };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading, refreshUser: checkUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
