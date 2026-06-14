import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
    try {
        const connectioninstance = await mongoose.connect(
            `${process.env.MONGODB_URI}/${DB_NAME}`
        );

        console.log(
            `MongoDB connected successfully: ${connectioninstance.connection.host}`
        );
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        throw error;
    }
};

export default connectDB;