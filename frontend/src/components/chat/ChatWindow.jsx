import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/axios';
import { ArrowLeft, Send, Image as ImageIcon } from 'lucide-react';

export default function ChatWindow({ user, onBack }) {
    const [content, setContent] = useState('');
    const bottomRef = useRef(null);
    const queryClient = useQueryClient();

    // Polling query for messages
    const { data: messages } = useQuery({
        queryKey: ['messages', user.username],
        queryFn: async () => {
            const res = await api.get(`messages/history/?username=${user.username}`);
            return res.data;
        },
        refetchInterval: 3000, // Poll every 3s
    });

    // Send Message Mutation
    const sendMutation = useMutation({
        mutationFn: async (text) => {
            return api.post('messages/', {
                to_username: user.username,
                content: text
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['messages', user.username]);
            setContent('');
        }
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!content.trim()) return;
        sendMutation.mutate(content);
    };

    // Auto-scroll to bottom
    useEffect(() => {
        if (bottomRef.current) {
            bottomRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    return (
        <div className="flex flex-col h-full relative">
            {/* Header */}
            <div className="h-16 border-b border-brand-green/20 flex items-center px-4 bg-brand-black/90 backdrop-blur-md shadow-neon z-20">
                <button onClick={onBack} className="md:hidden mr-4 text-white hover:text-brand-green transition-colors">
                    <ArrowLeft />
                </button>
                <div className="flex items-center gap-3">
                    <img
                        src={user.profile?.profile_picture_url || '/img/default_profile.png'}
                        onError={(e) => e.target.src = '/img/default_profile.png'}
                        className="w-10 h-10 rounded-full object-cover border border-brand-green shadow-neon"
                    />
                    <span className="font-bold text-lg text-glow">{user.username}</span>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-transparent custom-scrollbar z-10">
                {messages?.map((msg) => {
                    const isMe = msg.sender.username !== user.username;
                    return (
                        <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}>
                            <div className={`max-w-[75%] px-5 py-3 rounded-2xl shadow-md ${isMe
                                ? 'bg-brand-green text-black font-medium rounded-tr-none shadow-[0_0_10px_rgba(0,255,136,0.3)]'
                                : 'bg-brand-dark/80 text-white border border-gray-800 rounded-tl-none'
                                }`}>
                                <p className="text-[15px] leading-relaxed">{msg.content}</p>
                                <span className={`text-[10px] block text-right mt-1 font-semibold ${isMe ? 'text-black/60' : 'text-gray-500'}`}>
                                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        </div>
                    );
                })}
                <div ref={bottomRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSubmit} className="p-4 border-t border-brand-green/20 bg-brand-black/90 backdrop-blur-xl flex gap-3 align-center z-20">
                <button type="button" className="text-gray-400 hover:text-brand-green transition-colors p-2 hover:bg-brand-dark rounded-full">
                    <ImageIcon size={24} />
                </button>
                <input
                    type="text"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Message..."
                    className="flex-1 bg-brand-dark/50 border border-brand-green/10 rounded-full px-5 py-2.5 text-white focus:outline-none focus:border-brand-green focus:shadow-neon placeholder-gray-500 transition-all"
                />
                <button
                    type="submit"
                    disabled={!content.trim() || sendMutation.isPending}
                    className="bg-brand-green text-black rounded-full p-2.5 font-bold hover:bg-brand-green-dim disabled:opacity-50 disabled:cursor-not-allowed shadow-neon transition-all hover:scale-105 active:scale-95"
                >
                    <Send size={20} className={!content.trim() && !sendMutation.isPending ? "ml-0.5" : ""} />
                </button>
            </form>
        </div>
    );
}
