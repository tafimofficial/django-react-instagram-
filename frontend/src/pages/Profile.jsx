import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { MapPin, Calendar, Camera, UserPlus, UserCheck, MessageCircle, MoreHorizontal, Check, X } from 'lucide-react';
import PostCard from '../components/feed/PostCard';

export default function Profile() {
    const { username } = useParams();
    const navigate = useNavigate();
    const { user: currentUser, refreshUser } = useAuth();
    const queryClient = useQueryClient();

    const [isEditing, setIsEditing] = useState(false);
    const [activeTab, setActiveTab] = useState('posts');

    // 1. Fetch Profile Data
    const { data: profileUser, isLoading: profileLoading } = useQuery({
        queryKey: ['user', username],
        queryFn: async () => {
            const res = await api.get(`profiles/${username}/`);
            return res.data;
        }
    });

    // 2. Fetch User's Posts
    const { data: posts, isLoading: postsLoading } = useQuery({
        queryKey: ['user_posts', username],
        queryFn: async () => {
            const res = await api.get(`profiles/${username}/posts/`);
            return res.data;
        },
        enabled: !!profileUser
    });

    // 3. Friend Status Check
    // We need to know:
    // a) Are we friends? (Checked via profileUser.friends list or currentUser.profile.friends)
    // b) Did sent request? (Check outgoing requests)
    // c) Received request? (Check incoming requests)

    // Simplest way: Fetch my relationships
    const { data: myRequests } = useQuery({
        queryKey: ['my_requests'],
        queryFn: async () => {
            const res = await api.get('friends/');
            return Array.isArray(res.data) ? res.data : (res.data.results || []);
        },
        enabled: !!currentUser
    });

    // Helper to determine status
    const isMe = currentUser?.username === username;

    // Check if I am in their friends list (now available via ProfileSerializer)
    // Note: friends is a list of User objects
    const isFriend = profileUser?.friends?.some(f => f.id === currentUser?.id);

    // Check if they are in my friends list (via AuthContext user)
    const amIFriend = currentUser?.profile?.friends?.some(f => f.id === profileUser?.user?.id);

    // Check incoming request
    const incomingRequest = myRequests?.find(req => req.from_user.username === username);

    // Check outgoing (we don't have a direct endpoint for outgoing list in Friends.jsx yet, 
    // but assuming we can infer or fetch. For now, let's assume 'Request Sent' if not friend but button clicked.
    // Ideally we fetch outgoing. Let's add that to API later or just skip perfect state sync for now.
    // Actually, FriendRequestViewSet logic in backend filters `to_user=self`. 
    // We can't see sent requests easily without another endpoint. 
    // For now, allow sending. If APi says "already sent", we handle error.

    // Mutations
    const sendRequestMutation = useMutation({
        mutationFn: () => api.post('friends/send/', { username }),
        onSuccess: () => {
            alert('Friend request sent!');
            // Ideally set local state to 'sent'
        },
        onError: (err) => alert(err.response?.data?.error || 'Failed to send')
    });

    const acceptMutation = useMutation({
        mutationFn: (id) => api.post(`friends/${id}/accept/`),
        onSuccess: () => {
            queryClient.invalidateQueries(['user', username]);
            queryClient.invalidateQueries(['my_requests']);
            refreshUser();
        }
    });

    const rejectMutation = useMutation({
        mutationFn: (id) => api.post(`friends/${id}/reject/`),
        onSuccess: () => queryClient.invalidateQueries(['my_requests'])
    });

    if (profileLoading) return <div className="text-white p-10 flex justify-center">Loading Profile...</div>;
    if (!profileUser) return <div className="text-white p-10 flex justify-center">User not found</div>;

    const userObj = profileUser.user;

    return (
        <div className="min-h-screen text-white pb-20">
            {/* Cover Photo */}
            <div className="h-48 md:h-64 bg-brand-dark/50 relative overflow-hidden group">
                <img
                    src={profileUser.cover_photo_url || '/img/default_cover.png'}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-black via-transparent to-transparent opacity-60"></div>
                {isMe && (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="absolute bottom-4 right-4 bg-brand-black/50 p-2 rounded-full hover:bg-brand-green/20 hover:text-brand-green backdrop-blur-sm transition-all border border-white/10 hover:border-brand-green/50"
                    >
                        <Camera size={20} />
                    </button>
                )}
            </div>

            {/* Profile Info Header */}
            <div className="max-w-4xl mx-auto px-4 relative">
                <div className="flex flex-col md:flex-row items-end -mt-16 md:-mt-20 mb-6 gap-6">
                    {/* Avatar */}
                    <div className="relative group">
                        <img
                            src={profileUser.profile_picture_url || '/img/default_profile.png'}
                            onError={(e) => e.target.src = '/img/default_profile.png'}
                            className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-brand-black object-cover bg-brand-dark shadow-neon"
                        />
                        {isMe && (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="absolute bottom-2 right-2 bg-brand-green p-2 rounded-full hover:bg-brand-green-dim shadow-neon border-2 border-brand-black transition-transform hover:scale-110"
                            >
                                <Camera size={16} className="text-black" />
                            </button>
                        )}
                    </div>

                    {/* Actions & Names */}
                    <div className="flex-1 w-full flex flex-col md:flex-row justify-between items-start md:items-end gap-4 pb-2">
                        <div>
                            <h1 className="text-3xl font-bold font-serif text-glow">{userObj.username}</h1>
                            <p className="text-brand-green font-medium">@{userObj.username}</p>
                            {profileUser.bio && <p className="mt-2 text-gray-300 max-w-lg leading-relaxed">{profileUser.bio}</p>}

                            <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                                {profileUser.location && (
                                    <span className="flex items-center gap-1"><MapPin size={14} className="text-brand-green" /> {profileUser.location}</span>
                                )}
                                <span className="flex items-center gap-1"><Calendar size={14} className="text-brand-green" /> Joined {new Date(userObj.date_joined).toLocaleDateString()}</span>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                            {isMe ? (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="px-6 py-2 bg-brand-dark hover:bg-brand-dark-lighter border border-gray-700 hover:border-brand-green text-white rounded-full font-semibold transition-all hover:shadow-neon"
                                >
                                    Edit Profile
                                </button>
                            ) : (
                                <>
                                    {isEditing ? null : (
                                        amIFriend ? (
                                            <button
                                                onClick={() => navigate('/messages', { state: { user: profileUser.user } })}
                                                className="px-6 py-2 bg-brand-green hover:bg-brand-green-dim text-black rounded-full font-bold flex items-center gap-2 shadow-neon transition-transform hover:scale-105"
                                            >
                                                <MessageCircle size={18} /> Message
                                            </button>
                                        ) : incomingRequest ? (
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => acceptMutation.mutate(incomingRequest.id)}
                                                    className="px-4 py-2 bg-brand-green hover:bg-brand-green-dim text-black rounded-full font-bold flex items-center gap-2 shadow-neon"
                                                >
                                                    <Check size={18} /> Accept
                                                </button>
                                                <button
                                                    onClick={() => rejectMutation.mutate(incomingRequest.id)}
                                                    className="px-4 py-2 bg-brand-dark hover:bg-red-900/50 text-white rounded-full font-semibold flex items-center gap-2 border border-gray-700 hover:border-red-500 transition-colors"
                                                >
                                                    <X size={18} />
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => sendRequestMutation.mutate()}
                                                className="px-6 py-2 bg-white text-black hover:bg-brand-green hover:shadow-neon rounded-full font-bold flex items-center gap-2 transition-all"
                                            >
                                                <UserPlus size={18} /> Follow
                                            </button>
                                        )
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="flex gap-8 border-b border-brand-green/20 pb-4 mb-6 text-sm">
                    <div className="text-center md:text-left hover:text-brand-green transition-colors cursor-pointer">
                        <span className="font-bold text-white block text-lg">{posts?.length || 0}</span>
                        <span className="text-gray-500">Posts</span>
                    </div>
                    <div className="text-center md:text-left hover:text-brand-green transition-colors cursor-pointer">
                        <span className="font-bold text-white block text-lg">{profileUser.friends_count}</span>
                        <span className="text-gray-500">Friends</span>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-6 mb-6">
                    <button
                        onClick={() => setActiveTab('posts')}
                        className={`pb-2 font-bold tracking-wide transition-all ${activeTab === 'posts' ? 'text-brand-green border-b-2 border-brand-green text-glow' : 'text-gray-500 hover:text-white'}`}
                    >
                        POSTS
                    </button>
                    {/* <button className="pb-2 font-semibold text-gray-500 hover:text-white">MEDIA</button> */}
                </div>

                {/* Content */}
                {activeTab === 'posts' && (
                    <div className="space-y-4">
                        {postsLoading ? (
                            <div className="p-12 flex justify-center">
                                <span className="w-8 h-8 border-4 border-brand-green/30 border-t-brand-green rounded-full animate-spin"></span>
                            </div>
                        ) : posts?.length === 0 ? (
                            <div className="p-12 text-center text-gray-500 bg-brand-dark/30 rounded-lg border border-gray-800 border-dashed">No posts yet</div>
                        ) : (
                            posts.map(post => <PostCard key={post.id} post={post} />)
                        )}
                    </div>
                )}
            </div>

            {/* Edit Modal */}
            {isEditing && (
                <EditProfileModal
                    profile={profileUser}
                    onClose={() => setIsEditing(false)}
                    onSuccess={async () => {
                        setIsEditing(false);
                        await queryClient.invalidateQueries(['user', username]);
                        refreshUser();
                    }}
                />
            )}
        </div>
    );
}

// Re-using the EditProfileModal logic from previous task, ensuring it is included
function EditProfileModal({ profile, onClose, onSuccess }) {
    // ... Copy implementation or keep it if I am replacing file content effectively. 
    // Since I am overwriting the file with `write_to_file`, I MUST include the modal code.

    // START MODAL CODE
    const [bio, setBio] = useState(profile.bio || '');
    const [location, setLocation] = useState(profile.location || '');
    const [profilePic, setProfilePic] = useState(null);
    const [coverPic, setCoverPic] = useState(null);
    const [preview, setPreview] = useState(profile.profile_picture_url);
    const [coverPreview, setCoverPreview] = useState(profile.cover_photo_url);

    const updateMutation = useMutation({
        mutationFn: async () => {
            const formData = new FormData();
            formData.append('bio', bio);
            formData.append('location', location);
            if (profilePic) formData.append('profile_picture', profilePic);
            if (coverPic) formData.append('cover_photo', coverPic);

            await api.patch(`profiles/${profile.user.username}/`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
        },
        onSuccess: onSuccess
    });

    const handleFile = (e, setFile, setPrev) => {
        const file = e.target.files[0];
        if (file) {
            setFile(file);
            setPrev(URL.createObjectURL(file));
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-200">
            <div className="bg-brand-dark w-full max-w-lg rounded-xl border border-brand-green/30 shadow-neon overflow-hidden">
                <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-black/40">
                    <h2 className="text-lg font-bold text-white">Edit Profile</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white"><X /></button>
                </div>
                <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto custom-scrollbar">
                    {/* Images */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm text-gray-400 mb-2">Cover Photo</label>
                            <div className="h-32 bg-black rounded-lg overflow-hidden relative cursor-pointer border border-gray-700 hover:border-brand-green hover:shadow-neon transition group">
                                <img src={coverPreview || '/img/default_cover.png'} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition" />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition">
                                    <Camera className="text-brand-green" />
                                </div>
                                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleFile(e, setCoverPic, setCoverPreview)} />
                            </div>
                        </div>

                        <div className="flex justify-center">
                            <div className="relative w-24 h-24 group">
                                <img
                                    src={preview || '/img/default_profile.png'}
                                    className="w-full h-full rounded-full object-cover border-2 border-gray-700 group-hover:border-brand-green transition-colors"
                                    onError={(e) => e.target.src = '/img/default_profile.png'}
                                />
                                <label className="absolute bottom-0 right-0 bg-brand-green p-1.5 rounded-full cursor-pointer hover:bg-brand-green-dim shadow-neon text-black">
                                    <Camera size={14} />
                                    <input type="file" className="hidden" onChange={(e) => handleFile(e, setProfilePic, setPreview)} />
                                </label>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="text-sm text-gray-400">Bio</label>
                        <textarea
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            className="w-full bg-black border border-gray-800 rounded p-2 mt-1 focus:border-brand-green focus:ring-1 focus:ring-brand-green outline-none text-white transition-all"
                            rows={3}
                        />
                    </div>
                    <div>
                        <label className="text-sm text-gray-400">Location</label>
                        <input
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            className="w-full bg-black border border-gray-800 rounded p-2 mt-1 focus:border-brand-green focus:ring-1 focus:ring-brand-green outline-none text-white transition-all"
                        />
                    </div>
                </div>
                <div className="p-4 border-t border-gray-800 flex justify-end gap-2 bg-black/40">
                    <button onClick={onClose} className="px-4 py-2 hover:bg-white/10 rounded text-gray-300 transition-colors">Cancel</button>
                    <button onClick={() => updateMutation.mutate()} className="px-6 py-2 bg-brand-green hover:bg-brand-green-dim text-black rounded font-bold shadow-neon transition-transform active:scale-95">
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
}
