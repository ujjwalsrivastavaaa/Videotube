import { Router } from 'express';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/multer.middleware.js';
import {
    publishAVideo,
    getAllVideos,
    getVideoById,
    deleteVideo
} from '../controllers/video.controller.js';

const router = Router();

// Get all videos is public, but uploading requires authentication
router.route('/')
    .get(getAllVideos)
    .post(
        verifyJWT,
        upload.fields([
            {
                name: 'videoFile',
                maxCount: 1
            },
            {
                name: 'thumbnail',
                maxCount: 1
            }
        ]),
        publishAVideo
    );

// Fetching single video (watching) and deleting require authentication
router.route('/:videoId')
    .get(verifyJWT, getVideoById)
    .delete(verifyJWT, deleteVideo);

export default router;
