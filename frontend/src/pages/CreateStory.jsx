import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Upload, Image as ImageIcon, Video as VideoIcon } from 'lucide-react';
import api from '../api/axios';

export default function CreateStory() {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);

    const handleFileSelect = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setPreview(URL.createObjectURL(selectedFile));
            setError(null);
        }
    };

    const handleUpload = async () => {
        if (!file) {
            setError("Please select a file first.");
            return;
        }

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            // Set Content-Type to undefined so the browser sets it to multipart/form-data with the correct boundary
            await api.post('stories/', formData, {
                headers: { 'Content-Type': undefined }
            });
            navigate('/');
        } catch (err) {
            console.error("Story upload failed", err);
            const errorMessage = err.response?.data?.detail || err.response?.data?.file?.[0] || "Failed to upload story. Please try again.";
            setError(errorMessage);
            setUploading(false);
        }
    };

    const clearFile = () => {
        setFile(null);
        setPreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="min-h-screen bg-brand-black text-white flex flex-col items-center p-4 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-[-20%] left-[-20%] w-[800px] h-[800px] bg-brand-green/5 rounded-full blur-[150px] animate-pulse pointer-events-none"></div>

            <div className="w-full max-w-lg flex items-center justify-between mb-6 relative z-10">
                <h1 className="text-2xl font-bold font-serif italic text-glow">Add to Story</h1>
                <button onClick={() => navigate('/')} className="p-2 bg-brand-dark rounded-full hover:bg-brand-dark-lighter hover:text-red-500 transition-colors border border-transparent hover:border-red-500/50">
                    <X size={20} />
                </button>
            </div>

            <div className="w-full max-w-lg flex-1 flex flex-col gap-4 relative z-10">
                {error && (
                    <div className="p-3 bg-red-900/50 border border-red-500/50 text-red-200 rounded-lg text-sm text-center animate-in fade-in slide-in-from-top-2">
                        {error}
                    </div>
                )}

                <div className="flex-1 bg-brand-dark/30 backdrop-blur-md border border-brand-green/20 rounded-2xl overflow-hidden relative flex flex-col items-center justify-center min-h-[400px] shadow-neon">
                    {preview ? (
                        <div className="relative w-full h-full bg-black/50 flex items-center justify-center">
                            {file?.type.startsWith('video') ? (
                                <video src={preview} autoPlay loop muted playsInline className="max-h-[70vh] w-auto object-contain" />
                            ) : (
                                <img src={preview} className="max-h-[70vh] w-auto object-contain" />
                            )}
                            <button
                                onClick={clearFile}
                                className="absolute top-4 right-4 p-2 bg-black/60 rounded-full hover:bg-red-500/80 hover:text-white transition backdrop-blur-sm"
                            >
                                <X size={20} />
                            </button>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-4 p-8 text-center text-gray-400">
                            <div className="flex gap-4">
                                <label className="flex flex-col items-center gap-2 p-6 bg-brand-dark/50 border border-brand-green/10 rounded-2xl cursor-pointer hover:bg-brand-dark hover:border-brand-green/50 hover:shadow-neon transition-all group">
                                    <ImageIcon size={32} className="text-brand-green group-hover:scale-110 transition-transform" />
                                    <span className="text-sm group-hover:text-brand-green transition-colors">Photo</span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleFileSelect}
                                    />
                                </label>
                                <label className="flex flex-col items-center gap-2 p-6 bg-brand-dark/50 border border-brand-green/10 rounded-2xl cursor-pointer hover:bg-brand-dark hover:border-brand-green/50 hover:shadow-neon transition-all group">
                                    <VideoIcon size={32} className="text-brand-green group-hover:scale-110 transition-transform" />
                                    <span className="text-sm group-hover:text-brand-green transition-colors">Video</span>
                                    <input
                                        type="file"
                                        accept="video/*"
                                        className="hidden"
                                        onChange={handleFileSelect}
                                    />
                                </label>
                            </div>
                            <p className="text-sm text-gray-500">Select media to share to your story</p>
                        </div>
                    )}
                </div>

                <button
                    onClick={handleUpload}
                    disabled={!file || uploading}
                    className="w-full py-4 bg-brand-green rounded-xl font-bold text-black hover:bg-brand-green-dim disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-neon hover:shadow-[0_0_20px_rgba(0,255,136,0.4)] active:scale-95 mb-safe"
                >
                    {uploading ? (
                        <span className="flex items-center justify-center gap-2">
                            <span className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                            Sharing...
                        </span>
                    ) : (
                        <span className="flex items-center justify-center gap-2 text-lg">
                            <Upload size={24} />
                            Share to Story
                        </span>
                    )}
                </button>
            </div>
        </div>
    );
}
