import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';


export default function StoryTray() {
    const { user } = useAuth();
    const navigate = useNavigate();

    // Fetch Stories
    const { data: stories = [] } = useQuery({
        queryKey: ['stories'],
        queryFn: async () => {
            const res = await api.get('stories/');
            // Handle pagination: API returns { count: ..., results: [...] }
            return res.data.results || res.data || [];
        }
    });

    // Group stories by user
    const storiesByUser = stories.reduce((acc, story) => {
        const existingGroup = acc.find(g => g.user.id === story.user.id);
        if (existingGroup) {
            existingGroup.stories.push(story);
        } else {
            acc.push({
                user: story.user,
                stories: [story]
            });
        }
        return acc;
    }, []);

    const openStory = (group) => {
        navigate(`/stories/${group.user.username}`);
    };

    return (
        <>
            <div className="flex gap-4 overflow-x-auto p-4 no-scrollbar border-b border-brand-green/20 bg-brand-black/40 backdrop-blur-md">
                {/* My Story / Upload */}
                <div
                    className="flex flex-col items-center gap-1 min-w-[70px] cursor-pointer group"
                    onClick={() => navigate('/create-story')}
                >
                    <div className="relative w-16 h-16">
                        <img
                            src={user?.profile?.profile_picture_url || '/img/default_profile.png'}
                            onError={(e) => e.target.src = '/img/default_profile.png'}
                            className="w-full h-full rounded-full object-cover border-2 border-brand-green group-hover:border-brand-green-dim group-hover:shadow-neon transition-all duration-300"
                        />
                        <div className="absolute bottom-0 right-0 bg-brand-green rounded-full p-1 border-2 border-brand-black shadow-neon">
                            <Plus size={12} className="text-black font-bold" />
                        </div>
                    </div>
                    <span className="text-xs text-white truncate w-full text-center group-hover:text-brand-green transition-colors">Your Story</span>
                </div>

                {/* Other Stories */}
                {storiesByUser.map(group => (
                    <div
                        key={group.user.id}
                        className="flex flex-col items-center gap-1 min-w-[70px] cursor-pointer group"
                        onClick={() => openStory(group)}
                    >
                        <div className="w-16 h-16 rounded-full p-[2px] bg-gradient-to-tr from-brand-green via-green-400 to-emerald-600 transition-all duration-300 group-hover:shadow-neon">
                            <img
                                src={group.user.profile?.profile_picture_url || '/img/default_profile.png'}
                                onError={(e) => e.target.src = '/img/default_profile.png'}
                                className="w-full h-full rounded-full object-cover border-2 border-brand-black bg-brand-dark"
                            />
                        </div>
                        <span className="text-xs text-white truncate w-full text-center group-hover:text-brand-green transition-colors">
                            {group.user.username}
                        </span>
                    </div>
                ))}
            </div>
        </>
    );
}
