import User from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"
import ApiError from "../utils/ApiError.js";



export const verifyJWT=asyncHandler(async (req,res,next)=>{

try {
    const token= req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")
    
    console.log(token);
    if(!token){
    throw new ApiError(401,"unauthorized error")
    }
    
    const decodedToken=jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
    
    console.log(decodedToken);


    const user=await User.findById(decodedToken?._id).select(" -password -refreshToken");
     console.log(user); 
    if(!user){
        //next_video:discuss about frontend
        throw new ApiError(
            401,"invalid access token"
        )
    }
    
    req.user=user;
    
    next()  // it is use in middlewares to tell that it runs first
} catch (error) {
    console.log(error)
  throw new ApiError(401,error?.message|| "invalid access token")  
}


})