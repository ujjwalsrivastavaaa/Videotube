
console.log("Hello world! This is the entry point of the application.");

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app=express();

app.use(cors({
    origin:process.env.CORS_ORIGIN, // Allow requests from this origin
}));

app.use(express.json());//to parse incoming JSON data in the request body, with a size limit of 16 kilobytes.

app.use(express.urlencoded({
    extended:true,//giving access to nested objects in the request body
    limit:"16kb"
}));

app.use(express.static("public"));//to serve static files from the "public" directory. This allows you to access files like images, CSS, and JavaScript directly from the "public" folder.

app.use(cookieParser());//to parse cookies from incoming requests, making them accessible through req.cookies in your route handlers.


app.get("/app", (req, res) => {
    res.send("Route Working");
});





// Importing routes
import userRouter from './routes/user.routes.js';
import videoRouter from './routes/video.routes.js';

//routes declaration 
app.use("/api/v1/users",userRouter);
app.use("/api/v1/videos",videoRouter);
//http://localhost:8000/api/v1/users/register this is the endpoint to register a user, and it will respond with a JSON message indicating that the user was registered successfully.
export default app;