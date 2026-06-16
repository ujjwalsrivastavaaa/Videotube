import {Router} from 'express';
import {upload} from '../middlewares/multer.middleware.js';
import {loginUser, logoutUser, registerUser} from '../controllers/user.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
const router=Router();

router.route('/register').post(
   upload.fields([
    {
        name:"avatar",
        maxCount:1
    },{
        name:"coverImage",
        maxCount:1
    }
   ]),registerUser);//to handle POST requests to the /register endpoint, invoking the registerUser controller function when a request is made to that endpoint.

router.route("/login").post(loginUser);

//secured routes
router.route("/logout").post(verifyJWT ,logoutUser);

export default router;