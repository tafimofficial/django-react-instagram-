import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { X } from 'lucide-react';
import api from '../api/axios';

export default function StoryViewerPage() {
    const { username } = useParams();
    const navigate = useNavigate();
    const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
    const [userStories, setUserStories] = useState(null);

    // Fetch Stories
    const { data: stories = [], isLoading } = useQuery({
        queryKey: ['stories'],
        queryFn: async () => {
            const res = await api.get('stories/');
            return res.data.results || res.data || [];
        }
    });

    useEffect(() => {
        if (stories.length > 0 && username) {
            // Group stories by user (same logic as StoryTray)
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

            const targetGroup = storiesByUser.find(g => g.user.username === username);
            if (targetGroup) {
                setUserStories(targetGroup);
            } else if (!isLoading) {
                // User has no stories or not found, go back
                navigate('/');
            }
        }
    }, [stories, username, navigate, isLoading]);

    const handleClose = () => {
        navigate('/');
    };

    const nextStory = (e) => {
        e?.stopPropagation();
        if (!userStories) return;

        if (currentStoryIndex < userStories.stories.length - 1) {
            setCurrentStoryIndex(prev => prev + 1);
        } else {
            handleClose();
        }
    };

    const prevStory = (e) => {
        e?.stopPropagation();
        if (currentStoryIndex > 0) {
            setCurrentStoryIndex(prev => prev - 1);
        }
    };

    if (isLoading || !userStories) {
        return (
            <div className="w-screen h-screen bg-brand-black flex items-center justify-center text-white">
                <span className="w-10 h-10 border-4 border-brand-green/20 border-t-brand-green rounded-full animate-spin shadow-neon"></span>
            </div>
        );
    }

    const currentStory = userStories.stories[currentStoryIndex];
    const isVideo = currentStory.file_url?.toLowerCase().match(/\.(mp4|mov|webm)$/);

    return (
        <div className="fixed inset-0 z-50 bg-brand-black/95 backdrop-blur-xl flex flex-col items-center justify-center">
            {/* Progress Bar */}
            <div className="absolute top-4 left-0 w-full px-4 flex gap-1 z-50">
                {userStories.stories.map((_, idx) => (
                    <div key={idx} className="h-1 flex-1 bg-brand-dark-lighter/50 rounded-full overflow-hidden backdrop-blur-sm">
                        <div
                            className={`h-full bg-brand-green shadow-[0_0_8px_rgba(0,255,136,0.6)] transition-all duration-300 ${idx < currentStoryIndex ? 'w-full' :
                                idx === currentStoryIndex ? 'w-full' : 'w-0'
                                }`}
                        />
                    </div>
                ))}
            </div>

            {/* Header: User Info & Close */}
            <div className="absolute top-8 left-0 w-full px-4 flex justify-between items-center z-50">
                <div className="flex items-center gap-3">
                    <img
                        src={userStories.user.profile?.profile_picture_url || '/img/default_profile.png'}
                        onError={(e) => e.target.src = '/img/default_profile.png'}
                        className="w-10 h-10 rounded-full border border-brand-green shadow-neon object-cover"
                    />
                    <div className="flex flex-col">
                        <span className="font-bold text-white text-sm text-glow tracking-wide">
                            {userStories.user.username}
                        </span>
                        <span className="text-brand-green/80 text-xs font-medium">
                            {new Date(currentStory.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    </div>
                </div>
                <button onClick={handleClose} className="text-white hover:text-brand-green transition-colors hover:drop-shadow-[0_0_5px_rgba(0,255,136,0.8)]">
                    <X size={32} />
                </button>
            </div>

            {/* Content */}
            <div className="w-full h-full flex items-center justify-center relative touch-none bg-black">
                {/* Navigation Tap Areas */}
                <div className="absolute inset-y-0 left-0 w-1/3 z-40 cursor-pointer" onClick={prevStory} />
                <div className="absolute inset-y-0 right-0 w-1/3 z-40 cursor-pointer" onClick={nextStory} />

                {isVideo ? (
                    <video
                        src={currentStory.file_url}
                        autoPlay
                        muted={false}
                        playsInline
                        className="w-full h-full object-contain"
                        onEnded={nextStory}
                    />
                ) : (
                    <img
                        src={currentStory.file_url}
                        className="w-full h-full object-contain"
                    />
                )}
            </div>
        </div>
    );
}
