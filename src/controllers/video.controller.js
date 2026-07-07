import { asyncHandler } from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import Video from '../models/video.model.js';
import User from '../models/user.model.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';

// @desc    Publish a new video
// @route   POST /api/v1/videos
// @access  Private
const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body;

    if (!title?.trim() || !description?.trim()) {
        throw new ApiError(400, "Title and description are required");
    }

    const videoFileLocalPath = req.files?.videoFile?.[0]?.path;
    const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;

    if (!videoFileLocalPath) {
        throw new ApiError(400, "Video file is required");
    }
    if (!thumbnailLocalPath) {
        throw new ApiError(400, "Thumbnail is required");
    }

    // Upload to Cloudinary
    console.log("Uploading video to Cloudinary...");
    const videoFile = await uploadOnCloudinary(videoFileLocalPath);
    console.log("Uploading thumbnail to Cloudinary...");
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

    if (!videoFile) {
        throw new ApiError(400, "Failed to upload video file");
    }
    if (!thumbnail) {
        throw new ApiError(400, "Failed to upload thumbnail image");
    }

    const video = await Video.create({
        videoFile: videoFile.url,
        thumbnail: thumbnail.url,
        title,
        description,
        duration: videoFile.duration || 0, // Cloudinary returns duration for media files
        owner: req.user._id,
        isPublished: true
    });

    return res.status(201).json(
        new ApiResponse(201, video, "Video published successfully")
    );
});

// @desc    Get all videos
// @route   GET /api/v1/videos
// @access  Public
const getAllVideos = asyncHandler(async (req, res) => {
    const { query } = req.query;
    let filter = { isPublished: true };

    if (query) {
        filter.$or = [
            { title: { $regex: query, $options: "i" } },
            { description: { $regex: query, $options: "i" } }
        ];
    }

    const videos = await Video.find(filter)
        .populate("owner", "fullName username avatar email")
        .sort({ createdAt: -1 });

    return res.status(200).json(
        new ApiResponse(200, videos, "Videos fetched successfully")
    );
});

// @desc    Get video by ID (watches the video)
// @route   GET /api/v1/videos/:videoId
// @access  Private
const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    const video = await Video.findById(videoId).populate("owner", "fullName username avatar");

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    // Increment view count
    video.views += 1;
    await video.save({ validateBeforeSave: false });

    // Append to authenticated user's watch history
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $addToSet: { watchHistory: video._id }
        }
    );

    return res.status(200).json(
        new ApiResponse(200, video, "Video fetched and watch registered")
    );
});

// @desc    Delete video
// @route   DELETE /api/v1/videos/:videoId
// @access  Private
const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    // Verify ownership
    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You do not have permission to delete this video");
    }

    await Video.findByIdAndDelete(videoId);

    return res.status(200).json(
        new ApiResponse(200, {}, "Video deleted successfully")
    );
});

// @desc    Toggle Like on a video
// @route   POST /api/v1/videos/:videoId/toggle-like
// @access  Private
const toggleLikeVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const userId = req.user._id;

    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    const hasLiked = video.likes.includes(userId);

    if (hasLiked) {
        video.likes.pull(userId);
    } else {
        video.likes.push(userId);
        video.dislikes.pull(userId);
    }

    await video.save({ validateBeforeSave: false });

    return res.status(200).json(
        new ApiResponse(200, {
            likesCount: video.likes.length,
            dislikesCount: video.dislikes.length,
            isLiked: !hasLiked,
            isDisliked: false
        }, "Like toggled successfully")
    );
});

// @desc    Toggle Dislike on a video
// @route   POST /api/v1/videos/:videoId/toggle-dislike
// @access  Private
const toggleDislikeVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const userId = req.user._id;

    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    const hasDisliked = video.dislikes.includes(userId);

    if (hasDisliked) {
        video.dislikes.pull(userId);
    } else {
        video.dislikes.push(userId);
        video.likes.pull(userId);
    }

    await video.save({ validateBeforeSave: false });

    return res.status(200).json(
        new ApiResponse(200, {
            likesCount: video.likes.length,
            dislikesCount: video.dislikes.length,
            isLiked: false,
            isDisliked: !hasDisliked
        }, "Dislike toggled successfully")
    );
});

export {
    publishAVideo,
    getAllVideos,
    getVideoById,
    deleteVideo,
    toggleLikeVideo,
    toggleDislikeVideo
};
