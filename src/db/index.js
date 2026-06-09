import mongoose from "mongoose";
import {DB_NAME} from "../constants.js";
import express from "express";

const app=express();
const connectDB=async()=>{
    try{
       const connectioninstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);

        console.log(`MongoDB connected successfully${connectioninstance.connection.host}`);
        app.on("error",(error)=>{
            console.error("Error in Express server:", error);   
            throw error
        })
        app.listen(process.env.PORT, () => {
            console.log(`Server is running on port ${process.env.PORT}`);
        });
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        throw error;
    }
}

export default connectDB;