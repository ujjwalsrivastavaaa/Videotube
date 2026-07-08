import React, { useState, useRef } from 'react';
import { X, Film, Image as ImageIcon, AlertCircle, CheckCircle, Radio } from 'lucide-react';
import { apiRequest } from '../utils/api';

const UploadModal = ({ isOpen, onClose, onUploadSuccess }) => {
  const [uploadMode, setUploadMode] = useState('file'); // file or live
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);
  const [category, setCategory] = useState('All');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const videoInputRef = useRef(null);
  const thumbnailInputRef = useRef(null);

  if (!isOpen) return null;

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file) setVideoFile(file);
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) setThumbnail(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!title.trim() || !description.trim()) {
      setError('Title and description are required');
      return;
    }
    if (uploadMode === 'file' && !videoFile) {
      setError('Please select a video file (MP4/WebM)');
      return;
    }
    if (!thumbnail) {
      setError('Please select a cover thumbnail image');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', title.trim() + (uploadMode === 'live' ? ' [LIVE]' : ''));
      formData.append('description', description.trim());
      formData.append('category', uploadMode === 'live' ? 'Live' : category);
      if (uploadMode === 'file') {
        formData.append('videoFile', videoFile);
      }
      formData.append('thumbnail', thumbnail);

      await apiRequest('/videos', {
        method: 'POST',
        body: formData
      });

      setSuccess(uploadMode === 'live' ? 'Broadcast started! Live Stream is active.' : 'Video uploaded successfully!');
      setTimeout(() => {
        onUploadSuccess();
        onClose();
        // Reset states
        setTitle('');
        setDescription('');
        setVideoFile(null);
        setThumbnail(null);
        setCategory('All');
        setUploadMode('file');
      }, 1500);
    } catch (err) {
      setError(err.message || 'Action failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-brand-text/45 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-brand-card border border-brand-border rounded-md p-6 sm:p-8 shadow-lg relative text-left">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-brand-border pb-3 mb-4">
          <h2 className="font-extrabold text-base tracking-tight text-brand-text">
            {uploadMode === 'file' ? 'Upload Video' : 'Go Live on VideoTube'}
          </h2>
          <button 
            onClick={onClose} 
            disabled={loading}
            className="p-1 hover:bg-brand-bg rounded text-brand-secondary hover:text-brand-text transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-brand-border mb-6">
          <button
            type="button"
            disabled={loading}
            onClick={() => { setUploadMode('file'); setError(''); }}
            className={`flex-1 py-2 text-center text-xs font-bold border-b-2 transition-all cursor-pointer ${
              uploadMode === 'file' 
                ? 'border-brand-accent text-brand-accent' 
                : 'border-transparent text-brand-secondary hover:text-brand-text'
            }`}
          >
            Upload File
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => { setUploadMode('live'); setError(''); }}
            className={`flex-1 py-2 text-center text-xs font-bold border-b-2 transition-all cursor-pointer ${
              uploadMode === 'live' 
                ? 'border-brand-accent text-brand-accent' 
                : 'border-transparent text-brand-secondary hover:text-brand-text'
            }`}
          >
            <span className="flex items-center justify-center gap-1.5">
              <Radio size={13} className={uploadMode === 'live' ? 'animate-pulse' : ''} />
              Go Live
            </span>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-brand-accent text-xs font-semibold rounded-md flex items-center gap-2">
            <AlertCircle size={14} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 text-brand-accent text-xs font-semibold rounded-md flex items-center gap-2">
            <CheckCircle size={14} />
            <span>{success}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-brand-secondary uppercase tracking-wider">
              {uploadMode === 'file' ? 'Video Title' : 'Stream Title'}
            </label>
            <input
              type="text"
              placeholder={uploadMode === 'file' ? "Give your stream an engaging title..." : "Enter live broadcast title..."}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={loading}
              className="bg-brand-bg border border-brand-border focus:border-brand-text focus:outline-none rounded-md px-3 py-2 text-xs transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-brand-secondary uppercase tracking-wider">Description</label>
            <textarea
              placeholder={uploadMode === 'file' ? "What is this video about?" : "Tell your subscribers what you are broadcasting..."}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={loading}
              rows={3}
              className="bg-brand-bg border border-brand-border focus:border-brand-text focus:outline-none rounded-md p-3 text-xs resize-none h-20 transition-colors"
            />
          </div>

          {/* Category Selector (Only for File Upload, forced to Live in livestream mode) */}
          {uploadMode === 'file' && (
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-brand-secondary uppercase tracking-wider">Video Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                disabled={loading}
                className="bg-brand-bg border border-brand-border focus:border-brand-text focus:outline-none rounded-md px-3 py-2 text-xs transition-colors cursor-pointer"
              >
                <option value="All">General / All</option>
                <option value="Music">Music</option>
                <option value="Gaming">Gaming</option>
                <option value="Education">Education</option>
                <option value="Podcasts">Podcasts</option>
                <option value="Live">Live</option>
              </select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            {/* Left side input */}
            {uploadMode === 'file' ? (
              <div 
                onClick={() => !loading && videoInputRef.current?.click()} 
                className="border border-dashed border-brand-border hover:border-brand-accent hover:bg-brand-accent/5 rounded-md p-4 flex flex-col items-center justify-center min-h-[110px] cursor-pointer transition-colors text-center"
              >
                <input
                  type="file"
                  ref={videoInputRef}
                  accept="video/*"
                  onChange={handleVideoChange}
                  disabled={loading}
                  className="hidden-file-input"
                />
                <Film size={20} className={videoFile ? 'text-brand-accent' : 'text-brand-secondary'} />
                <span className="text-[10px] font-bold text-brand-text mt-2 truncate max-w-full px-1">
                  {videoFile ? videoFile.name : 'Select Video File'}
                </span>
                <span className="text-[9px] text-brand-secondary mt-0.5">MP4 or WebM</span>
              </div>
            ) : (
              <div className="border border-brand-border bg-brand-bg rounded-md p-4 flex flex-col items-center justify-center min-h-[110px] text-center">
                <Radio size={20} className="text-brand-accent animate-pulse" />
                <span className="text-[10px] font-bold text-brand-text mt-2">
                  Live Feed Simulator
                </span>
                <span className="text-[9px] text-brand-secondary mt-0.5">Camera feed is ready</span>
              </div>
            )}

            {/* Thumbnail Image Input */}
            <div 
              onClick={() => !loading && thumbnailInputRef.current?.click()} 
              className="border border-dashed border-brand-border hover:border-brand-accent hover:bg-brand-accent/5 rounded-md p-4 flex flex-col items-center justify-center min-h-[110px] cursor-pointer transition-colors text-center relative"
            >
              <input
                type="file"
                ref={thumbnailInputRef}
                accept="image/*"
                onChange={handleThumbnailChange}
                disabled={loading}
                className="hidden-file-input"
              />
              {thumbnail ? (
                <>
                  <img src={URL.createObjectURL(thumbnail)} alt="" className="w-12 h-12 object-cover rounded border border-brand-border" />
                  <span className="text-[9px] font-bold text-brand-accent mt-2">Change Cover</span>
                </>
              ) : (
                <>
                  <ImageIcon size={20} className="text-brand-secondary" />
                  <span className="text-[10px] font-bold text-brand-text mt-2">
                    {uploadMode === 'file' ? 'Select Thumbnail *' : 'Stream Cover *'}
                  </span>
                  <span className="text-[9px] text-brand-secondary mt-0.5">JPG or PNG</span>
                </>
              )}
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-brand-accent hover:bg-brand-hover text-white text-xs font-bold py-2.5 px-4 rounded-md transition-colors cursor-pointer flex items-center justify-center"
          >
            {loading ? (uploadMode === 'file' ? 'Publishing video...' : 'Starting broadcast...') : (uploadMode === 'file' ? 'Publish Video' : 'Start Live Broadcast')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UploadModal;
