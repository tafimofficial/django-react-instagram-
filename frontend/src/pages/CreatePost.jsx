import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Image as ImageIcon, Video as VideoIcon, X, Upload } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function CreatePost() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [content, setContent] = useState('');
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [fileType, setFileType] = useState(null); // 'image' or 'video'
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (!selectedFile) return;

        setFile(selectedFile);
        setPreview(URL.createObjectURL(selectedFile));

        if (selectedFile.type.startsWith('image/')) {
            setFileType('image');
        } else if (selectedFile.type.startsWith('video/')) {
            setFileType('video');
        } else {
            setFileType(null);
            setError('Unsupported file type');
        }
    };

    const clearFile = () => {
        setFile(null);
        setPreview(null);
        setFileType(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!content && !file) {
            setError('Please add text or a file.');
            return;
        }

        setLoading(true);
        const formData = new FormData();
        formData.append('content', content);

        if (file) {
            if (fileType === 'image') {
                formData.append('image', file);
            } else if (fileType === 'video') {
                formData.append('video', file);
            }
        }

        try {
            await api.post('posts/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            navigate('/');
        } catch (err) {
            console.error(err);
            setError('Failed to create post');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-xl mx-auto p-4 text-white">
            <h1 className="text-3xl font-bold mb-8 font-serif italic text-glow">Create New Post</h1>

            {error && <div className="bg-red-900/50 border border-red-500/50 text-red-200 p-3 rounded mb-6 text-sm flex items-center gap-2"><X size={16} />{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Text Area */}
                <div className="bg-brand-dark/50 rounded-xl p-4 border border-brand-green/10 focus-within:border-brand-green/50 focus-within:shadow-neon transition-all">
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="What's making waves today?"
                        className="w-full bg-transparent text-white resize-none outline-none h-32 placeholder-gray-500 text-lg"
                    />
                </div>

                {/* File Preview */}
                {preview ? (
                    <div className="relative rounded-xl overflow-hidden bg-black border border-brand-green/20 shadow-neon">
                        <button
                            type="button"
                            onClick={clearFile}
                            className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-full hover:bg-red-600 hover:text-white text-gray-300 transition-colors z-10 backdrop-blur-sm"
                        >
                            <X size={20} />
                        </button>

                        {fileType === 'image' ? (
                            <img src={preview} alt="Preview" className="w-full max-h-[500px] object-contain bg-brand-dark/20" />
                        ) : (
                            <video src={preview} controls className="w-full max-h-[500px] bg-brand-dark/20" />
                        )}
                    </div>
                ) : (
                    /* File Select Buttons */
                    <div className="flex gap-4">
                        <label className="flex items-center gap-2 px-6 py-3 bg-brand-dark/50 border border-brand-green/10 rounded-xl cursor-pointer hover:bg-brand-dark hover:border-brand-green hover:shadow-neon transition-all group flex-1 justify-center">
                            <ImageIcon size={24} className="text-brand-green group-hover:scale-110 transition-transform" />
                            <span className="font-semibold group-hover:text-brand-green transition-colors">Photo</span>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                        </label>

                        <label className="flex items-center gap-2 px-6 py-3 bg-brand-dark/50 border border-brand-green/10 rounded-xl cursor-pointer hover:bg-brand-dark hover:border-brand-green hover:shadow-neon transition-all group flex-1 justify-center">
                            <VideoIcon size={24} className="text-brand-green group-hover:scale-110 transition-transform" />
                            <span className="font-semibold group-hover:text-brand-green transition-colors">Video</span>
                            <input
                                type="file"
                                accept="video/*"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                        </label>
                    </div>
                )}

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-brand-green rounded-xl font-bold text-black text-lg hover:bg-brand-green-dim disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-neon hover:shadow-[0_0_20px_rgba(0,255,136,0.4)] active:scale-95 flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <>
                            <span className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                            Posting...
                        </>
                    ) : (
                        <>
                            <Upload size={24} />
                            Post
                        </>
                    )}
                </button>
            </form>
        </div>
    );
}
