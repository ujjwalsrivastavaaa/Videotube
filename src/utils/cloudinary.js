import {v2 as cloudinary} from 'cloudinary';
import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config();    

cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
    });

const uploadOnCloudinary=async (localFilePath)=>{
    try{
        if(!localfilePath){
           return null;
        }
        //upload file on the cloudianry server
         const response=await cloudinary.uploader.upload(localFilePath, {
            resource_type: 'auto'
        });
        //file uploaded successfully, now we can remove the file from the server
         console.log("File uploaded successfully on Cloudinary");  
         return response;
   
    } catch (error) {
        fs.unlinkSync(localFilePath);//remove the file from the server if there is an error while uploading on cloudinary
        console.error('Error uploading to Cloudinary:', error);
        return null;
    }
};
//export default uploadOnCloudinary //we can also export the cloudinary instance if we want to use it directly in other files without using the uploadOnCloudinary function
export {uploadOnCloudinary};//we can also export the cloudinary instance if we want to use it directly in other files without using the uploadOnCloudinary function