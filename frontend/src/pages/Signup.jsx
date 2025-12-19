import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

import { useAuth } from '../context/AuthContext';

export default function Signup() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        firstName: '',
        lastName: ''
    });
    const [error, setError] = useState('');

    useEffect(() => {
        if (user) {
            navigate('/');
        }
    }, [user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Register
            await api.post('users/', {
                username: formData.username,
                email: formData.email,
                password: formData.password,
                first_name: formData.firstName,
                last_name: formData.lastName
            });
            // Redirect to login
            navigate('/login');
        } catch (err) {
            setError(JSON.stringify(err.response?.data || 'Signup failed'));
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-brand-black relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-brand-green/5 rounded-full blur-[120px] animate-pulse delay-500"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px] animate-pulse"></div>

            <div className="w-full max-w-md p-8 bg-brand-dark/80 backdrop-blur-xl rounded-2xl shadow-neon border border-brand-green/20 relative z-10 mx-4 my-8">
                <h1 className="text-3xl font-bold mb-6 text-center text-white text-glow">Join SocialSphere</h1>
                {error && <div className="bg-red-900/50 border border-red-500/50 text-red-200 p-3 rounded mb-6 text-sm">{error}</div>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Username</label>
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            className="block w-full px-4 py-2 bg-black/50 border border-gray-700 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-brand-green focus:shadow-neon transition-all"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="block w-full px-4 py-2 bg-black/50 border border-gray-700 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-brand-green focus:shadow-neon transition-all"
                            required
                        />
                    </div>
                    <div className="flex gap-2">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-400 mb-1">First Name</label>
                            <input
                                type="text"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                className="block w-full px-4 py-2 bg-black/50 border border-gray-700 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-brand-green focus:shadow-neon transition-all"
                            />
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-400 mb-1">Last Name</label>
                            <input
                                type="text"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                className="block w-full px-4 py-2 bg-black/50 border border-gray-700 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-brand-green focus:shadow-neon transition-all"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Password</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className="block w-full px-4 py-2 bg-black/50 border border-gray-700 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-brand-green focus:shadow-neon transition-all"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full flex justify-center py-3 px-4 mt-6 border border-transparent rounded-lg shadow-neon text-sm font-bold text-black bg-brand-green hover:bg-brand-green-dim focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-green transition-transform active:scale-95"
                    >
                        Sign Up
                    </button>
                    <p className="mt-4 text-center text-sm text-gray-500">
                        Already have an account? <Link to="/login" className="font-semibold text-brand-green hover:text-white transition-colors">Log in</Link>
                    </p>
                </form>
            </div>
        </div>
    );
}
