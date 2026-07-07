import { Router } from 'express';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import {
    getVideoComments,
    addComment,
    deleteComment
} from '../controllers/comment.controller.js';

const router = Router();

// Secure all routes
router.use(verifyJWT);

router.route('/:videoId')
    .get(getVideoComments)
    .post(addComment);

router.route('/:commentId')
    .delete(deleteComment);

export default router;
