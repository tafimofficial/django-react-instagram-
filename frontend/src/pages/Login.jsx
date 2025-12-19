import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { login, user } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState('');

    useEffect(() => {
        if (user) {
            navigate('/');
        }
    }, [user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const res = await login(username, password);
        if (res.success) {
            navigate('/');
        } else {
            setError(res.error);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-brand-black relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-brand-green/10 rounded-full blur-[100px] animate-pulse"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-brand-green/10 rounded-full blur-[100px] animate-pulse delay-1000"></div>

            <div className="w-full max-w-md p-8 bg-brand-dark/80 backdrop-blur-xl rounded-2xl shadow-neon border border-brand-green/20 relative z-10 mx-4">
                <h1 className="text-4xl font-bold mb-8 text-center font-serif italic text-white text-glow">SocialSphere</h1>
                {error && <div className="bg-red-900/50 border border-red-500/50 text-red-200 p-3 rounded mb-6 text-sm text-center">{error}</div>}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="block w-full px-4 py-3 bg-black/50 border border-gray-700 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-brand-green focus:shadow-neon transition-all"
                            placeholder="Enter your username"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="block w-full px-4 py-3 bg-black/50 border border-gray-700 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-brand-green focus:shadow-neon transition-all"
                            placeholder="Enter your password"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-neon text-sm font-bold text-black bg-brand-green hover:bg-brand-green-dim focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-green transition-transform active:scale-95"
                    >
                        LOG IN
                    </button>
                    <p className="mt-4 text-center text-sm text-gray-500">
                        Don't have an account? <Link to="/signup" className="font-semibold text-brand-green hover:text-white transition-colors">Sign up</Link>
                    </p>
                </form>
            </div>
        </div>
    );
}
