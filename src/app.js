import express from 'express';
import cors from 'cors';
import cockieParser from 'cookie-parser';

const app=express();

app.use(cors({
    origin:process.env.CORS_ORIGIN
}));

app.use(express.json({
    limit:"16kb"
}));//to parse incoming JSON data in the request body, with a size limit of 16 kilobytes.

app.use(express.urlencoded({
    extended:true,//giving access to nested objects in the request body
    limit:"16kb"
}));

app.use(express.static("public"));//to serve static files from the "public" directory. This allows you to access files like images, CSS, and JavaScript directly from the "public" folder.

app.use(cookieParser());//to parse cookies from incoming requests, making them accessible through req.cookies in your route handlers.

export default app;