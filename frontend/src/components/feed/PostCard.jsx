import { useState } from 'react';
import { Heart, MessageCircle, Share2, MoreHorizontal, Trash2, Edit2, Send, X, Copy, Repeat } from 'lucide-react';
import api from '../../api/axios';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

export default function PostCard({ post }) {
    const { user: currentUser } = useAuth();
    const queryClient = useQueryClient();

    // Post State
    const [isLiked, setIsLiked] = useState(post.is_liked);
    const [likesCount, setLikesCount] = useState(post.likes_count);
    const [showActions, setShowActions] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(post.content);

    // Share State
    const [showShareModal, setShowShareModal] = useState(false);

    // Comment State
    const [showComments, setShowComments] = useState(false);
    const [commentText, setCommentText] = useState('');
    const [comments, setComments] = useState(post.comments || []);
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editCommentContent, setEditCommentContent] = useState('');

    const isOwner = currentUser?.id === post.user.id;

    // --- Post Actions ---
    const toggleLike = async () => {
        const prevLiked = isLiked;
        const prevCount = likesCount;
        setIsLiked(!prevLiked);
        setLikesCount(prevLiked ? prevCount - 1 : prevCount + 1);
        try {
            await api.post(`posts/${post.id}/like/`);
        } catch (err) {
            setIsLiked(prevLiked);
            setLikesCount(prevCount);
        }
    };

    const deleteMutation = useMutation({
        mutationFn: () => api.delete(`posts/${post.id}/`),
        onSuccess: () => queryClient.invalidateQueries(['posts'])
    });

    const editMutation = useMutation({
        mutationFn: () => api.patch(`posts/${post.id}/`, { content: editContent }),
        onSuccess: () => {
            setIsEditing(false);
            setShowActions(false);
            queryClient.invalidateQueries(['posts']);
        }
    });

    const shareMutation = useMutation({
        mutationFn: () => api.post(`posts/${post.id}/share/`),
        onSuccess: () => {
            setShowShareModal(false);
            alert('Post shared to your profile!');
            queryClient.invalidateQueries(['posts']);
        }
    });

    const copyLink = () => {
        const url = `${window.location.origin}/post/${post.id}`;
        navigator.clipboard.writeText(url);
        setShowShareModal(false);
        alert('Link copied to clipboard!');
    };

    // --- Comment Actions ---
    const commentMutation = useMutation({
        mutationFn: (text) => api.post(`posts/${post.id}/comment/`, { content: text }),
        onSuccess: (res) => {
            setComments([...comments, res.data]);
            setCommentText('');
        }
    });

    const deleteCommentMutation = useMutation({
        mutationFn: (commentId) => api.delete(`comments/${commentId}/`),
        onSuccess: (_, commentId) => {
            setComments(comments.filter(c => c.id !== commentId));
        }
    });

    const editCommentMutation = useMutation({
        mutationFn: () => api.patch(`comments/${editingCommentId}/`, { content: editCommentContent }),
        onSuccess: (res) => {
            setComments(comments.map(c => c.id === editingCommentId ? res.data : c));
            setEditingCommentId(null);
        }
    });

    return (
        <article className="bg-brand-black border-b border-brand-green/20 pb-4 relative transition-colors duration-500 hover:bg-brand-dark/20">
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2">
                <Link to={`/profile/${post.user.username}`} className="flex items-center gap-3 group">
                    <img
                        src={post.user.profile?.profile_picture_url || '/img/default_profile.png'}
                        onError={(e) => e.target.src = '/img/default_profile.png'}
                        alt={post.user.username}
                        className="w-8 h-8 rounded-full object-cover border border-brand-green/50 group-hover:shadow-neon transition-all"
                    />
                    <span className="font-semibold text-sm text-white group-hover:text-brand-green transition-colors">{post.user.username}</span>
                </Link>

                <div className="relative">
                    <button onClick={() => setShowActions(!showActions)} className="text-gray-400 p-1">
                        <MoreHorizontal size={20} />
                    </button>
                    {showActions && (
                        <div className="absolute right-0 top-8 bg-gray-900 border border-gray-800 rounded-lg shadow-xl z-10 w-32 overflow-hidden">
                            {isOwner && (
                                <>
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-800 flex items-center gap-2"
                                    >
                                        <Edit2 size={14} /> Edit
                                    </button>
                                    <button
                                        onClick={() => { if (confirm('Delete post?')) deleteMutation.mutate(); }}
                                        className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-800 flex items-center gap-2"
                                    >
                                        <Trash2 size={14} /> Delete
                                    </button>
                                </>
                            )}
                            {!isOwner && (
                                <button className="w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-800">
                                    Report
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Content Display or Edit Mode */}
            {isEditing ? (
                <div className="px-3 pb-2">
                    <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white"
                        rows={3}
                    />
                    <div className="flex justify-end gap-2 mt-2">
                        <button onClick={() => setIsEditing(false)} className="text-sm text-gray-400">Cancel</button>
                        <button onClick={() => editMutation.mutate()} className="text-sm bg-blue-600 px-3 py-1 rounded text-white">Save</button>
                    </div>
                </div>
            ) : (
                <>
                    {/* Media */}
                    <div className="w-full bg-black">
                        {post.image_url && (
                            <div className="aspect-square bg-gray-900">
                                <img src={post.image_url} alt="Post" className="w-full h-full object-cover" />
                            </div>
                        )}
                        {post.video_url && (
                            <div className="aspect-square bg-gray-900">
                                <video src={post.video_url} controls className="w-full h-full object-cover" />
                            </div>
                        )}

                        {/* Text Only / Caption wrapper */}
                        {(!post.image_url && !post.video_url && !post.shared_post) && (
                            <div className="p-4 text-white text-lg min-h-[100px] flex items-center">
                                {post.content}
                            </div>
                        )}
                    </div>

                    {/* Shared Post Render */}
                    {post.shared_post && (
                        <div className="mx-3 my-2 border border-gray-800 rounded-lg overflow-hidden bg-gray-900/50">
                            <div className="flex items-center gap-2 p-2 border-b border-gray-800">
                                <img
                                    src={post.shared_post.user.profile?.profile_picture_url || '/img/default_profile.png'}
                                    className="w-6 h-6 rounded-full"
                                />
                                <span className="font-bold text-sm text-white">{post.shared_post.user.username}</span>
                                <span className="text-xs text-gray-400">
                                    {new Date(post.shared_post.created_at).toLocaleDateString()}
                                </span>
                            </div>
                            {post.shared_post.image_url && (
                                <img src={post.shared_post.image_url} className="w-full max-h-60 object-cover" />
                            )}
                            <p className="p-2 text-sm text-gray-300">{post.shared_post.content}</p>
                        </div>
                    )}
                </>
            )}

            {/* Action Buttons */}
            <div className="px-3 pt-3 pb-1 relative">
                <div className="flex items-center gap-4">
                    <button onClick={toggleLike} className="transition-transform active:scale-110 hover:drop-shadow-[0_0_5px_rgba(255,0,0,0.5)]">
                        <Heart
                            size={24}
                            className={isLiked ? "fill-red-600 text-red-600 drop-shadow-[0_0_8px_rgba(220,38,38,0.5)]" : "text-white hover:text-brand-green transition-colors"}
                        />
                    </button>
                    <button onClick={() => setShowComments(!showComments)}>
                        <MessageCircle size={24} className="text-white hover:text-brand-green transition-colors hover:drop-shadow-[0_0_5px_rgba(0,255,136,0.5)]" />
                    </button>
                    <button onClick={() => setShowShareModal(!showShareModal)}>
                        <Share2 size={24} className="text-white hover:text-brand-green transition-colors hover:drop-shadow-[0_0_5px_rgba(0,255,136,0.5)]" />
                    </button>
                </div>
                <div className="mt-2 font-semibold text-sm text-white">
                    {likesCount} likes
                </div>

                {/* Share Popup Modal */}
                {showShareModal && (
                    <>
                        <div
                            className="fixed inset-0 z-10"
                            onClick={() => setShowShareModal(false)}
                        />
                        <div className="absolute bottom-12 left-20 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-20 w-48 overflow-hidden animate-in fade-in zoom-in duration-200">
                            <button
                                onClick={() => shareMutation.mutate()}
                                className="w-full text-left px-4 py-3 text-sm text-white hover:bg-gray-700 flex items-center gap-3 border-b border-gray-700"
                            >
                                <Repeat size={16} /> Repost to Feed
                            </button>
                            <button
                                onClick={copyLink}
                                className="w-full text-left px-4 py-3 text-sm text-white hover:bg-gray-700 flex items-center gap-3"
                            >
                                <Copy size={16} /> Copy Link
                            </button>
                        </div>
                    </>
                )}
            </div>

            {/* Caption & Comments Section */}
            <div className="px-3 space-y-1">
                {(post.content && (post.image_url || post.video_url || post.shared_post)) && (
                    <div className="text-sm text-white">
                        <span className="font-semibold mr-2">{post.user.username}</span>
                        {post.content}
                    </div>
                )}

                <button onClick={() => setShowComments(!showComments)} className="text-gray-400 text-sm">
                    {showComments ? 'Hide comments' : `View all ${comments.length} comments`}
                </button>

                {showComments && (
                    <div className="space-y-4 mt-2 mb-4">
                        {comments.map(comment => (
                            <div key={comment.id} className="group flex items-start justify-between text-sm">
                                <div className="flex-1">
                                    <span className="font-semibold text-white mr-2">{comment.user.username}</span>

                                    {editingCommentId === comment.id ? (
                                        <div className="mt-1">
                                            <input
                                                value={editCommentContent}
                                                onChange={(e) => setEditCommentContent(e.target.value)}
                                                className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white text-xs mb-1 focus:outline-none focus:border-blue-500"
                                                autoFocus
                                            />
                                            <div className="flex gap-2">
                                                <button onClick={() => setEditingCommentId(null)} className="text-xs text-gray-400">Cancel</button>
                                                <button onClick={() => editCommentMutation.mutate()} className="text-xs text-blue-500">Save</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <span className="text-gray-300">{comment.content}</span>
                                    )}
                                </div>

                                {currentUser?.id === comment.user.id && !editingCommentId && (
                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => {
                                                setEditingCommentId(comment.id);
                                                setEditCommentContent(comment.content);
                                            }}
                                            className="text-gray-500 hover:text-white"
                                            title="Edit"
                                        >
                                            <Edit2 size={12} />
                                        </button>
                                        <button
                                            onClick={() => deleteCommentMutation.mutate(comment.id)}
                                            className="text-gray-500 hover:text-red-500"
                                            title="Delete"
                                        >
                                            <X size={12} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}

                        <div className="flex gap-2 mt-2 pt-2 border-t border-gray-800">
                            <input
                                type="text"
                                placeholder="Add a comment..."
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                className="flex-1 bg-transparent border-none text-sm text-white outline-none placeholder-gray-600"
                                onKeyDown={(e) => e.key === 'Enter' && commentText && commentMutation.mutate(commentText)}
                            />
                            {commentText && (
                                <button onClick={() => commentMutation.mutate(commentText)} className="text-blue-500 text-sm font-semibold">
                                    Post
                                </button>
                            )}
                        </div>
                    </div>
                )}

                <div className="text-gray-500 text-xs mt-1 uppercase">
                    {new Date(post.created_at).toLocaleDateString()}
                </div>
            </div>
        </article>
    );
}
