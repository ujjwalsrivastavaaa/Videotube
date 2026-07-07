import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
    try {
        let uri = process.env.MONGODB_URI;
        if (uri.startsWith('mongodb+srv://') || !uri.includes('?')) {
            uri = uri.endsWith('/') ? `${uri}${DB_NAME}` : `${uri}/${DB_NAME}`;
        } else {
            const parts = uri.split('?');
            uri = parts[0].endsWith('/') ? `${parts[0]}${DB_NAME}?${parts[1]}` : `${parts[0]}/${DB_NAME}?${parts[1]}`;
        }

        const connectioninstance = await mongoose.connect(uri);

        console.log(
            `MongoDB connected successfully: ${connectioninstance.connection.host}`
        );
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        throw error;
    }
};

export default connectDB;