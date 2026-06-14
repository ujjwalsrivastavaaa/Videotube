import {Router} from 'express';
import {upload} from '../middlewares/multer.middleware.js';
import {registerUser} from '../controllers/user.controller.js';
const router=Router();

router.route('/register').post(registerUser);//to handle POST requests to the /register endpoint, invoking the registerUser controller function when a request is made to that endpoint.

export default router;