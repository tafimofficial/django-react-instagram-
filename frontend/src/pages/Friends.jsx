import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';
import { UserCheck, UserPlus, X, Search as SearchIcon, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Friends() {
    const [activeTab, setActiveTab] = useState('requests');
    const [searchQuery, setSearchQuery] = useState('');
    const queryClient = useQueryClient();

    // Fetch Friend Requests
    const { data: requests } = useQuery({
        queryKey: ['friendRequests'],
        queryFn: async () => {
            const res = await api.get('friends/');
            return Array.isArray(res.data) ? res.data : (res.data.results || []);
        }
    });

    // Fetch Sent Requests
    const { data: sentRequests } = useQuery({
        queryKey: ['sentRequests'],
        queryFn: async () => {
            const res = await api.get('friends/sent/');
            return Array.isArray(res.data) ? res.data : (res.data.results || []);
        }
    });

    // Fetch Friends List
    const { data: friendsList } = useQuery({
        queryKey: ['myFriends'],
        queryFn: async () => {
            const res = await api.get('friends/list_friends/');
            return res.data;
        }
    });

    // Search Users
    const { data: searchResults, refetch: searchUsers } = useQuery({
        queryKey: ['searchUsers', searchQuery],
        queryFn: async () => {
            if (!searchQuery) return [];
            const res = await api.get('users/');
            const users = Array.isArray(res.data) ? res.data : (res.data.results || []);
            return users.filter(u => u.username.toLowerCase().includes(searchQuery.toLowerCase()));
        },
        enabled: false // Trigger manually
    });

    const handleSearch = (e) => {
        e.preventDefault();
        searchUsers();
    };

    // Friend Actions
    const sendRequestMutation = useMutation({
        mutationFn: (username) => api.post('friends/send/', { username }),
        onSuccess: () => {
            alert('Request sent!');
            queryClient.invalidateQueries(['sentRequests']);
        },
        onError: (err) => alert(err.response?.data?.error || 'Failed to send')
    });

    const acceptMutation = useMutation({
        mutationFn: (id) => api.post(`friends/${id}/accept/`),
        onSuccess: () => {
            queryClient.invalidateQueries(['friendRequests']);
            queryClient.invalidateQueries(['myFriends']);
        }
    });

    const rejectMutation = useMutation({
        mutationFn: (id) => api.post(`friends/${id}/reject/`),
        onSuccess: () => queryClient.invalidateQueries(['friendRequests'])
    });

    // Auto-refresh queries when tab changes
    // useEffect(() => {
    //      if (activeTab === 'find') queryClient.invalidateQueries(['sentRequests']);
    // }, [activeTab]) // Optional optimization

    return (
        <div className="p-4 text-white min-h-screen max-w-2xl mx-auto pb-24">
            <h1 className="text-3xl font-bold mb-8 font-serif italic text-glow">Friends</h1>

            {/* Tabs */}
            <div className="flex gap-4 border-b border-brand-green/20 mb-6">
                <Tab label="Requests" active={activeTab === 'requests'} onClick={() => setActiveTab('requests')} count={requests?.length} />
                <Tab label="My Friends" active={activeTab === 'friends'} onClick={() => setActiveTab('friends')} count={friendsList?.length} />
                <Tab label="Find Friends" active={activeTab === 'find'} onClick={() => setActiveTab('find')} />
            </div>

            {/* Requests List */}
            {activeTab === 'requests' && (
                <div className="space-y-4">
                    {requests?.length === 0 ? (
                        <div className="text-center py-12 bg-brand-dark/30 rounded-2xl border border-dashed border-gray-800">
                            <p className="text-gray-400 text-lg">No pending friend requests</p>
                            <button onClick={() => setActiveTab('find')} className="text-brand-green mt-3 font-semibold hover:text-white transition-colors">Find people</button>
                        </div>
                    ) : (
                        requests?.map(req => (
                            <div key={req.id} className="flex items-center justify-between bg-brand-dark/40 p-5 rounded-2xl border border-brand-green/10 shadow-lg hover:border-brand-green/30 transition-all hover:shadow-neon group">
                                <Link to={`/profile/${req.from_user.username}`} className="flex items-center gap-4">
                                    <div className="relative">
                                        <img
                                            src={req.from_user.profile.profile_picture_url || '/img/default_profile.png'}
                                            onError={(e) => e.target.src = '/img/default_profile.png'}
                                            className="w-14 h-14 rounded-full object-cover bg-brand-dark border-2 border-transparent group-hover:border-brand-green transition-colors"
                                        />
                                        <div className="absolute inset-0 rounded-full shadow-[0_0_10px_rgba(0,255,136,0.2)] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    </div>
                                    <div>
                                        <p className="font-bold text-lg text-white group-hover:text-brand-green transition-colors">{req.from_user.username}</p>
                                        <p className="text-sm text-gray-400">Sent you a request</p>
                                    </div>
                                </Link>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => acceptMutation.mutate(req.id)}
                                        className="bg-brand-green px-5 py-2 rounded-xl text-black font-bold hover:bg-brand-green-dim shadow-neon hover:shadow-[0_0_15px_rgba(0,255,136,0.4)] transition-all active:scale-95"
                                    >
                                        Confirm
                                    </button>
                                    <button
                                        onClick={() => rejectMutation.mutate(req.id)}
                                        className="bg-brand-dark px-5 py-2 rounded-xl text-white font-semibold hover:bg-red-500/20 hover:text-red-500 border border-transparent hover:border-red-500/30 transition-all active:scale-95"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* My Friends List */}
            {activeTab === 'friends' && (
                <div className="space-y-4">
                    {friendsList?.length === 0 ? (
                        <div className="text-center py-12 bg-brand-dark/30 rounded-2xl border border-dashed border-gray-800">
                            <p className="text-gray-400 text-lg">You haven't added any friends yet.</p>
                            <button onClick={() => setActiveTab('find')} className="text-brand-green mt-3 font-semibold hover:text-white transition-colors">Find people</button>
                        </div>
                    ) : (
                        friendsList?.map(friend => (
                            <div key={friend.id} className="flex items-center justify-between bg-brand-black p-3 rounded-xl hover:bg-brand-dark/50 transition-colors border border-transparent hover:border-brand-green/10 group">
                                <Link to={`/profile/${friend.username}`} className="flex items-center gap-4">
                                    <img
                                        src={friend.profile?.profile_picture_url || '/img/default_profile.png'}
                                        onError={(e) => e.target.src = '/img/default_profile.png'}
                                        className="w-12 h-12 rounded-full object-cover bg-brand-dark border border-gray-800 group-hover:border-brand-green transition-colors"
                                    />
                                    <span className="font-semibold text-lg text-gray-200 group-hover:text-white group-hover:text-glow transition-all">{friend.username}</span>
                                </Link>
                                <Link
                                    to={`/messages`}
                                    state={{ user: friend }}
                                    className="px-5 py-2 bg-brand-dark rounded-xl text-brand-green border border-brand-green/20 text-sm font-bold hover:bg-brand-green hover:text-black hover:shadow-neon transition-all active:scale-95"
                                >
                                    Message
                                </Link>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Find Friends / Search */}
            {activeTab === 'find' && (
                <div>
                    <form onSubmit={handleSearch} className="mb-6 relative group">
                        <SearchIcon className="absolute left-4 top-3.5 text-gray-500 group-focus-within:text-brand-green transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="Search by username..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-brand-dark/50 border border-brand-green/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-brand-green focus:shadow-neon placeholder-gray-600 transition-all"
                        />
                        <button type="submit" className="absolute right-2 top-2 bg-brand-green text-black px-4 py-1.5 rounded-lg text-sm font-bold shadow-neon hover:shadow-[0_0_10px_rgba(0,255,136,0.4)] transition-all">
                            Search
                        </button>
                    </form>

                    <div className="space-y-4">
                        {searchResults?.map(user => {
                            // Determine status
                            const isFriend = friendsList?.some(f => f.id === user.id);
                            const isSent = sentRequests?.some(r => r.to_user.id === user.id);
                            const isReceived = requests?.some(r => r.from_user.id === user.id);

                            return (
                                <div key={user.id} className="flex items-center justify-between bg-brand-dark/20 p-3 rounded-xl hover:bg-brand-dark/60 border border-transparent hover:border-brand-green/20 transition-all group">
                                    <Link to={`/profile/${user.username}`} className="flex items-center gap-4">
                                        <img
                                            src={user.profile?.profile_picture_url || '/img/default_profile.png'}
                                            onError={(e) => e.target.src = '/img/default_profile.png'}
                                            className="w-12 h-12 rounded-full object-cover border border-gray-800 group-hover:border-brand-green transition-colors"
                                        />
                                        <span className="font-semibold text-lg text-gray-200 group-hover:text-white transition-colors">{user.username}</span>
                                    </Link>

                                    {isFriend ? (
                                        <Link
                                            to="/messages"
                                            state={{ user: user }}
                                            className="p-2.5 bg-brand-dark border border-brand-green/30 rounded-full text-brand-green hover:bg-brand-green hover:text-black hover:shadow-neon transition-all"
                                            title="Message"
                                        >
                                            <MessageCircle size={20} />
                                        </Link>
                                    ) : isSent ? (
                                        <button disabled className="p-2.5 bg-brand-dark/50 rounded-full text-gray-500 cursor-not-allowed border border-gray-800" title="Request Sent">
                                            <UserCheck size={20} />
                                        </button>
                                    ) : isReceived ? (
                                        <div className="text-xs text-brand-green font-bold px-3 py-1 bg-brand-green/10 rounded-full border border-brand-green/20">Pending</div>
                                    ) : (
                                        <button
                                            onClick={() => sendRequestMutation.mutate(user.username)}
                                            className="p-2.5 bg-brand-green rounded-full text-black hover:bg-brand-green-dim hover:shadow-neon transition-all active:scale-95"
                                            title="Add Friend"
                                        >
                                            <UserPlus size={20} />
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                        {searchResults && searchResults.length === 0 && searchQuery && (
                            <p className="text-center text-gray-500 py-8">No users found</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

function Tab({ label, active, onClick, count }) {
    return (
        <button
            onClick={onClick}
            className={`pb-3 px-4 font-medium relative transition-colors ${active ? 'text-brand-green border-b-2 border-brand-green text-glow' : 'text-gray-500 hover:text-white'}`}
        >
            {label}
            {count > 0 && (
                <span className={`ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded-full align-middle ${active ? 'bg-brand-green text-black' : 'bg-gray-700 text-gray-300'}`}>{count}</span>
            )}
        </button>
    );
}
