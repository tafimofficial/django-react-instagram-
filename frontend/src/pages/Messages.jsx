import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'react-router-dom';
import api from '../api/axios';
import { MessageCircle, Search } from 'lucide-react';
import ChatWindow from '../components/chat/ChatWindow';

export default function Messages() {
    const location = useLocation();
    const [selectedUser, setSelectedUser] = useState(location.state?.user || null);

    // Fetch Conversations (Users we've chatted with)
    const { data: users, isLoading } = useQuery({
        queryKey: ['conversations'],
        queryFn: async () => {
            const res = await api.get('messages/conversations/');
            return res.data;
        }
    });

    return (
        <div className="flex h-[calc(100vh-theme(spacing.16))] md:h-screen md:pl-0 bg-brand-black text-white">
            {/* Conversation List Sidebar */}
            <div className={`${selectedUser ? 'hidden md:flex' : 'flex'} w-full md:w-80 flex-col border-r border-brand-green/20 bg-brand-black/95 backdrop-blur-md`}>
                <div className="p-4 border-b border-brand-green/20 flex justify-between items-center shadow-neon">
                    <h1 className="text-xl font-bold font-serif italic text-glow">Messages</h1>
                    <MessageCircle className="text-brand-green" />
                </div>

                <div className="overflow-y-auto flex-1 custom-scrollbar">
                    {isLoading ? (
                        <div className="p-6 text-brand-green text-center animate-pulse">Loading chats...</div>
                    ) : (
                        users?.map(user => (
                            <div
                                key={user.id}
                                onClick={() => setSelectedUser(user)}
                                className={`flex items-center gap-4 p-4 cursor-pointer transition-all border-b border-gray-900 hover:bg-brand-dark/40 ${selectedUser?.id === user.id ? 'bg-brand-dark/60 border-l-4 border-l-brand-green shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]' : 'border-l-4 border-l-transparent'}`}
                            >
                                <div className="relative">
                                    <img
                                        src={user.profile?.profile_picture_url || '/img/default_profile.png'}
                                        onError={(e) => e.target.src = '/img/default_profile.png'}
                                        className={`w-12 h-12 rounded-full object-cover bg-brand-dark ${selectedUser?.id === user.id ? 'border-2 border-brand-green shadow-neon' : 'border border-gray-700'}`}
                                    />
                                    {selectedUser?.id === user.id && <div className="absolute inset-0 rounded-full shadow-[0_0_10px_rgba(0,255,136,0.5)] opacity-50"></div>}
                                </div>
                                <div className="overflow-hidden">
                                    <h3 className={`font-semibold text-lg ${selectedUser?.id === user.id ? 'text-brand-green text-glow' : 'text-gray-200'}`}>{user.username}</h3>
                                    <p className="text-sm text-gray-500 truncate group-hover:text-gray-400">Tap to chat</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Chat Window Area */}
            <div className={`${!selectedUser ? 'hidden md:flex' : 'flex'} flex-1 flex-col bg-brand-black relative overflow-hidden`}>
                <div className="absolute inset-0 bg-brand-green/5 blur-[100px] pointer-events-none"></div>
                <div className="relative z-10 flex-1 flex flex-col h-full">
                    {selectedUser ? (
                        <ChatWindow user={selectedUser} onBack={() => setSelectedUser(null)} />
                    ) : (
                        <div className="hidden md:flex flex-1 items-center justify-center flex-col text-gray-500">
                            <div className="p-8 bg-brand-dark/30 rounded-full mb-6 border border-brand-green/10 shadow-neon animate-pulse">
                                <MessageCircle size={64} className="text-brand-green" />
                            </div>
                            <p className="text-xl font-light tracking-wide text-glow">Select a conversation to start messaging</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
