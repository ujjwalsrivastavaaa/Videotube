import {asyncHandler} from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import User from '../models/user.model.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import {uploadOnCloudinary} from '../utils/cloudinary.js';
const registerUser=asyncHandler(async (req,res)=>{
    //get user detail from frontend
    //validation of user details
    //check if user already exists in database:username or email should be unique
    //is avatar provided by user
    //upload them to cloudinary and get the url of the uploaded image
    // create user object - create entry in db
    //remove passoword and refresh token filed from response
    //check for user creation success and send response to frontend
    //save the user to database
    const {username,email,password,fullName}=req.body

    
    console.log("User details received:", { username, email, password, fullName });
    if(fullName==""){
       throw new ApiError(400,"full name is required")
    }
    if(email==""){
       throw new ApiError(400,"email is required")
    }
    if(password==""){
       throw new ApiError(400,"password is required")
    }
    if(username==""){
       throw new ApiError(400,"username is required")
    }

    const existeduser=await User.findOne({
        $or:[{ username },{  email  }]
    })

    if(existeduser){
        throw new ApiError(409,"username or email already exist")
    }
    const avatarLocalPath=req.files?.avatar[0]?.path;
    const coverImageLocalPath=req.file?.coverImage[0]?.path;

    if(!avatarLocalPath){
        throw new ApiError(400,"avatar file is required")
    }
  
   const avatar=await uploadOnCloudinary(avatarLocalPath);
   const coverImage= await uploadOnCloudinary(coverImageLocalPath);

   if(!avatar){
        throw new ApiError(400,"avatar file is required")
    }
    const user=await User.create({
        fullName,
        avatar:avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username:username.toLowerCase()


    })
   const createdUser= await User.findById(user._id).select(
    "-password -refreshToken"
   );
   
   if(!createdUser){
    throw new ApiError(500,"something went wrong while registring the user")
   }
  return res.status(201).json(
    new ApiResponse(200,createdUser,"user registered succcessfully")
  )
})


export {registerUser};