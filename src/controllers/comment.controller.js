import { asyncHandler } from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import Comment from '../models/comment.model.js';
import { ApiResponse } from '../utils/ApiResponse.js';

// @desc    Get all comments for a video
// @route   GET /api/v1/comments/:videoId
// @access  Private
const getVideoComments = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    const comments = await Comment.find({ video: videoId })
        .populate("owner", "username fullName avatar")
        .sort({ createdAt: -1 });

    return res.status(200).json(
        new ApiResponse(200, comments, "Comments fetched successfully")
    );
});

// @desc    Add a comment to a video
// @route   POST /api/v1/comments/:videoId
// @access  Private
const addComment = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { content } = req.body;

    if (!content?.trim()) {
        throw new ApiError(400, "Comment text is required");
    }

    const comment = await Comment.create({
        content: content.trim(),
        video: videoId,
        owner: req.user._id
    });

    // Populate owner details to send back to frontend
    const populatedComment = await Comment.findById(comment._id)
        .populate("owner", "username fullName avatar");

    return res.status(201).json(
        new ApiResponse(201, populatedComment, "Comment added successfully")
    );
});

// @desc    Delete a comment
// @route   DELETE /api/v1/comments/:commentId
// @access  Private
const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;

    const comment = await Comment.findById(commentId);

    if (!comment) {
        throw new ApiError(404, "Comment not found");
    }

    // Verify ownership
    if (comment.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You do not have permission to delete this comment");
    }

    await Comment.findByIdAndDelete(commentId);

    return res.status(200).json(
        new ApiResponse(200, {}, "Comment deleted successfully")
    );
});

export {
    getVideoComments,
    addComment,
    deleteComment
};
