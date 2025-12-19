import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search as SearchIcon, UserPlus, MessageCircle } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function Search() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const { user: currentUser } = useAuth();

    // Debounced Search
    useEffect(() => {
        const timeoutId = setTimeout(async () => {
            if (query.trim().length === 0) {
                setResults([]);
                return;
            }

            setLoading(true);
            try {
                // Assuming UserViewSet has SearchFilter enabled on 'username'
                const res = await api.get(`users/?search=${query}`);
                setResults(res.data.results || res.data || []); // Handle paginated or list response
            } catch (err) {
                console.error("Search failed", err);
            } finally {
                setLoading(false);
            }
        }, 500); // 500ms delay

        return () => clearTimeout(timeoutId);
    }, [query]);

    return (
        <div className="p-4 text-white min-h-screen">
            {/* Search Input */}
            <div className="relative mb-6 group">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 group-focus-within:text-brand-green transition-colors" size={20} />
                <input
                    type="text"
                    placeholder="Search users..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full bg-brand-dark/50 border border-brand-green/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-brand-green focus:shadow-neon placeholder-gray-600 transition-all font-medium"
                />
            </div>

            {/* Results List */}
            <div className="space-y-4">
                {loading ? (
                    <div className="text-center text-brand-green animate-pulse">Searching...</div>
                ) : results.length > 0 ? (
                    results.map(user => (
                        <Link
                            to={`/profile/${user.username}`}
                            key={user.id}
                            className="flex items-center justify-between bg-brand-dark/30 p-4 rounded-xl hover:bg-brand-dark/60 transition-all border border-transparent hover:border-brand-green/20 group hover:shadow-neon"
                        >
                            <div className="flex items-center gap-4">
                                <img
                                    src={user.profile?.profile_picture_url || '/default-avatar.png'}
                                    alt={user.username}
                                    className="w-12 h-12 rounded-full object-cover border border-gray-800 group-hover:border-brand-green transition-colors"
                                />
                                <div>
                                    <h3 className="font-semibold text-lg text-gray-200 group-hover:text-white group-hover:text-glow transition-colors">{user.username}</h3>
                                    {user.first_name && <p className="text-sm text-gray-500 group-hover:text-gray-400">{user.first_name} {user.last_name}</p>}
                                </div>
                            </div>

                            {/* Actions (Only show if not self) */}
                            {currentUser?.username !== user.username && (
                                <div className="text-gray-500 group-hover:text-brand-green transition-colors">
                                    {/* Placeholder icons, logic would go here */}
                                    <UserPlus size={20} />
                                </div>
                            )}
                        </Link>
                    ))
                ) : query && (
                    <div className="text-center text-gray-500 py-10">
                        No users found
                    </div>
                )}

                {!query && (
                    <div className="text-center text-gray-600 py-20 flex flex-col items-center">
                        <div className="p-4 bg-brand-dark/30 rounded-full mb-4">
                            <SearchIcon className="text-gray-700" size={32} />
                        </div>
                        <p>Search for friends by username</p>
                    </div>
                )}
            </div>
        </div>
    );
}
