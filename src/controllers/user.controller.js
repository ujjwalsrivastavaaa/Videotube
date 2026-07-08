import {asyncHandler} from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import User from '../models/user.model.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import {uploadOnCloudinary} from '../utils/cloudinary.js';
import jwt from 'jsonwebtoken'
import {Subscription} from '../models/subscription.model.js'
import mongoose from 'mongoose';
const generateAccessAndRefreshToken=async(userId)=>{
    try{
    const user = await User.findById(userId)
    const accessToken= user.generateAccessToken()
    const refreshToken=user.generateRefreshToken()
    user.refreshToken=refreshToken
   await user.save({validateBeforeSave:false})
    return {accessToken,refreshToken};
    }


    catch(error){
        console.log(error);
        throw new ApiError(500,"something went wrong while generating the refresh token")
    }
}




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

    console.log("BODY =", req.body);
console.log("FILES =", req.files);
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

    console.log(req.files);
    const avatarLocalPath=req.files?.avatar[0]?.path;
    //const coverImageLocalPath=req.files?.coverImage[0]?.path;
  
    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage)&&req.files.coverImage.length>0){
     coverImageLocalPath=req.files.coverImage[0].path;
    }
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

const loginUser=asyncHandler(async (req,res)=>{
 //add username and password req.body
 //check from the database if the password and username is exist or not
 //if not throw error
 //if password in not correct but user exist so we throw an error of wrong passswrod
 // if password is correct provide access and refresh token
 //send them in cookies
 //send response login succesfully

 const {email,username,password}=req.body;
  if(!(username||email)){
   throw new ApiError(400,"username or email is required")
  }
 const user=await User.findOne({
    $or:[{username},{email}]
  })
if(!user){
    throw new ApiError(404,"user does not exist")
}
const isPasswordValid=await user.isPasswordCorrect(password);
 
if(!isPasswordValid){
    throw new ApiError(404,"enter the correct password")
  }

  const {accessToken,refreshToken}=await generateAccessAndRefreshToken(user._id)

  const loggedInUser= await User.findById(user._id).select("-password -refreshToken")

  const options={
    httpOnly:true,
    secure:true
  }

  return res.status(200)
  .cookie("accessToken",accessToken,options)
  .cookie("refreshToken",refreshToken,options)
  .json(
    new ApiResponse(200,{
        user:loggedInUser,accessToken,
        refreshToken
    },
"user logged in successfully ")
  )
});


const logoutUser=asyncHandler(async (req,res)=>{
  await  User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                refreshToken:undefined
            }
        }
    );

    const options={
        httpOnly:true,
        secure:true
    }
    return res.status(200).clearCookie("accessToken",options).clearCookie("refreshToken",options).json(
        new ApiResponse(200,{},"user loggedout")
    )

})

const refreshAccessToken=asyncHandler( async(req,res)=>{
   const incomingRefreshToken=req.cookies?.refreshToken||req.body?.refreshToken;
   console.log("Cookies:", req.cookies);
   console.log("Body:", req.body);
   if(!incomingRefreshToken){
    throw new ApiError(
        401,"no refresh token available"
    )
   }
    try {
        const decodedtoken=jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET)
       const user=await User.findById(decodedtoken?._id)
       if(!user){
        throw new ApiError(
            401,"no user available"
        )
    }
      if(incomingRefreshToken!==user?.refreshToken){
        throw new ApiError(401," refresh token is expired or used")
      }
    
      const options={
        httpOnly:true,
        secured:true
      }
      const {accessToken,refreshToken}= await generateAccessAndRefreshToken(user._id);
    
      return res.status(200).cookie("accessToken",accessToken,options)
      .cookie("refreshToken",refreshToken,options)
      .json(
        new ApiResponse(
            200,
            {accessToken,
            refreshToken},
            "access token refreshed"
        )
      );
    
    } catch (error) {
        throw new ApiError(401,error?.message||"invalid refresh token")
    }
})

const changeCurrentPassword=asyncHandler(async (req,res)=>{
    const {oldPassword,newPassword}=req.body;
    const user=await User.findById(req.user?._id)
   const isPasswordCorrect= user.isPasswordCorrect(oldPassword);

   if(!isPasswordCorrect){
    throw new ApiError(400,"invaliid old password")
   }

   user.password=newPassword;
   await user.save({validateBeforeSave:false})

   return res.status(200).json(
    new ApiResponse(200,{},"password changed succesfully")
   )
})


const getCurrentUser=asyncHandler(async(req,res)=>{
    const user=await User.findById(req.user?._id).select("-password -refreshToken");

    return res.status(200).json(
        new ApiResponse(200,user,"current user fetched successfully")
    )
})

const updateAccountDetails=asyncHandler(async(req,res)=>{
   const {fullName,email}=req.body;
   if(!fullName||!email){
    throw new ApiError(400,"all fields are required")
   }
 const user=await User.findByIdAndUpdate(req.user?._id,
    {
      $set:{
        fullName:fullName,
        email:email
      }  
    },
    {new:true}
 ).select("-password");

 return res.status(200).json(
    new ApiResponse(200,user,"account details updated succesfully")
 )

})

const  updateUserAvatar=asyncHandler(async (req,res)=>{
  

    const avatarLocalPath=req.file?.path
    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar file is missing")
    }

    const avatar=await uploadOnCloudinary(avatarLocalPath)

    if(!avatar.url){
        throw new ApiError(400,"error while uploading on avatar")
    }
  

    const user= await User.findByIdAndUpdate(req.user?._id,
        {$set:{
          avatar:avatar.url 
        }},
        {new:true}
    ).select("-password");
  
     return res.status(200).json(
         new ApiResponse(200,user,"avatar image updated successfully")
    )
})


const  updateUserCoverImage=asyncHandler(async (req,res)=>{
  

    const coverImageLocalPath=req.file?.path
    if(!coverImageLocalPath){
        throw new ApiError(400,"coverimage file is missing")
    }

    const coverImage= await uploadOnCloudinary(coverImageLocalPath)

    if(!coverImage.url){
        throw new ApiError(400,"error while uploading on cover image")
    }
  

    const user= await User.findByIdAndUpdate(req.user?._id,
        {$set:{
          coverImage:coverImage.url 
        }},
        {new:true}
    ).select("-password");

    
    return res.status(200).json(
         new ApiResponse(200,user,"cover image updated successfully")
    )


})

const getUserChannelProfile=asyncHandler( async(req,res)=>{
    const {username}=req.params

    if(!username?.trim()){
        throw new ApiError(400,"username does not exist")
    }
 const channel=await User.aggregate([
    {
        $match:{
           username: username?.toLowerCase()
        }
    },
    {
        $lookup:{
            from:"subscriptions",
            localField:"_id",
            foreignField:"channel",
            as:"subscribers"

        }
    },
    {
         $lookup:{
            from:"subscriptions",
            localField:"_id",
            foreignField:"subscriber",
            as:"subscribedTo"

        }
    },
    {
        $lookup:{
            from:"videos",
            localField:"_id",
            foreignField:"owner",
            as:"videos"
        }
    },
    {
        $addFields:{
            subscribersCount:{
                $size:"$subscribers"
            },
            channelsSubscribedToCount:{
                $size:"$subscribedTo"
            },
            totalViews:{
                $sum:"$videos.views"
            },
            isSubscribed:{
                $cond:{
                    if:{$in:[req.user?._id,"$subscribers.subscriber"]},
                    then:true,
                    else:false
                }
            }
        }
    },
    {
        $project:{
            fullName:1,
            username:1,
            subscribersCount:1,
            channelsSubscribedToCount:1,
            totalViews:1,
            avatar:1,
            email:1,
            isSubscribed:1
        }
    }
    
 ])

 if(!channel?.length){
    throw new ApiError(404,"channel does not exist")
 }

 return res.status(200).json(
    new ApiResponse(200,channel[0],"user channel fetched succcessfully")
 )
}
)

const getWatchhistory=asyncHandler(async(req,res)=>{
  const user=await User.aggregate(
    [
        {
            $match:{
                _id: new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup:{
                from:"videos",
                localField:"watchHistory",
                foreignField:"_id",
                as:"watchHistory",
                pipeline:[
                    {
                        $lookup:{
                            from:"users",
                            localField:"owner",
                            foreignField:"_id",
                            as:"owner",
                            pipeline:[
                                {
                                    $project:{
                                        fullName:1,
                                        username:1,
                                        avatar:1
                                    }
                                }
                            ],
                        }
                    },
                    {
                        $addFields:{
                            owner:{
                                $first:"$owner"
                            }
                        }
                    }
                ]
            }
        }
    ]
  )
  return res.status(200).json(
    new ApiResponse(
        200,user[0].watchHistory,"watch history fetched successfully"
        )
  )
})

// @desc    Toggle channel subscription
// @route   POST /api/v1/users/toggle-subscribe/:channelId
// @access  Private
const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
    const subscriberId = req.user._id;

    if (channelId.toString() === subscriberId.toString()) {
        throw new ApiError(400, "You cannot subscribe to your own channel");
    }

    const channelExists = await User.findById(channelId);
    if (!channelExists) {
        throw new ApiError(404, "Channel does not exist");
    }

    const existingSub = await Subscription.findOne({
        subscriber: subscriberId,
        channel: channelId
    });

    if (existingSub) {
        await Subscription.findByIdAndDelete(existingSub._id);
        return res.status(200).json(
            new ApiResponse(200, { isSubscribed: false }, "Unsubscribed successfully")
        );
    } else {
        await Subscription.create({
            subscriber: subscriberId,
            channel: channelId
        });
        return res.status(200).json(
            new ApiResponse(200, { isSubscribed: true }, "Subscribed successfully")
        );
    }
});

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile,
    getWatchhistory,
    toggleSubscription
};