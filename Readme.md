# Video Hosting Platform Backend

A production-ready backend project built with Node.js, Express, MongoDB, and Mongoose, following the "Chai aur Code" backend series. This application serves as a fully functional API backend for a video hosting platform (similar to YouTube) featuring user authentication, video management, subscription systems, and comments.
---

## Website Link - https://videotube-alpha-three.vercel.app/

---

## 🚀 Features

- **User Management**: Authentication using Access & Refresh JWT tokens. User registration, login, logout, password reset, profile updates (avatar/cover image via Cloudinary), and watch history tracking.
- **Video Management**: Publish, view, toggle publication status, search, paginate, and delete videos.
- **Subscription Model**: Subscriber/Subscribed-to channel relationship tracking.
- **Comment System**: Add, update, delete, and paginate comments on videos.
- **File Management**: Handle multipart file uploads (avatars, covers, and video files) using Multer and upload/host them via Cloudinary.
- **Data Modeling**: Aggregation pipelines for complex queries like watch history, subscribers list, etc.

---

## 🛠️ Tech Stack

- **Runtime Environment**: [Node.js](https://nodejs.org/)
- **Web Framework**: [Express.js](https://expressjs.com/) (v5.x)
- **Database**: [MongoDB](https://www.mongodb.com/) via [Mongoose ODM](https://mongoosejs.com/)
- **Media Hosting**: [Cloudinary](https://cloudinary.com/)
- **File Uploads Middleware**: [Multer](https://github.com/expressjs/multer)
- **Security**: [bcrypt](https://github.com/kelektiv/node.bcrypt.js) for password hashing & [JSON Web Tokens (JWT)](https://jwt.io/) for session tokens.
- **Development Tools**: [Nodemon](https://nodemon.io/) for auto-reload, [Prettier](https://prettier.io/) for code styling.

---

## ⚙️ Environment Variables

Create a `.env` file in the root directory (based on `.env.sample`) and configure the following variables:

```env
PORT=8000
MONGODB_URI=your_mongodb_connection_string
CORS_ORIGIN=*

# Authentication secrets
ACCESS_TOKEN_SECRET=your_access_token_secret
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=your_refresh_token_secret
REFRESH_TOKEN_EXPIRY=7d

# Cloudinary configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

---

## 📂 Project Structure

```text
Project01/
├── public/                  # Temporary local storage for uploads
│   └── temp/                
├── src/
│   ├── controllers/         # Request handling logic (User, Video, Comment, etc.)
│   ├── db/                  # Database connection setup
│   ├── middlewares/         # Custom Express middlewares (auth, multer, etc.)
│   ├── models/              # Mongoose schemas & models (User, Video, Comment, Subscription)
│   ├── routes/              # Express routing definitions
│   ├── utils/               # Helper utilities (ApiError, ApiResponse, asyncHandler, Cloudinary upload)
│   ├── app.js               # Express application initialization & middleware setups
│   ├── constants.js         # Project-wide constants (e.g. DB name)
│   └── index.js             # Main server execution entrypoint
├── .env.sample              # Environment variables template
├── .gitignore
├── .prettierrc              # Prettier config
├── package.json
└── Readme.md
```

---

## 🚦 Getting Started

Follow these steps to run the project locally:

### 1. Prerequisites

Make sure you have Node.js and MongoDB installed locally or have a MongoDB Atlas account setup.

### 2. Installation

Clone the repository and install dependencies:

```bash
npm install
```

### 3. Setup Environment File

Copy the sample environment file to `.env`:

```bash
cp .env.sample .env
```

Open `.env` and fill in your MongoDB URI, JWT Secrets, and Cloudinary credentials.

### 4. Run the Application

Start the server in development mode (with hot reloading enabled via Nodemon):

```bash
npm run dev
```

For production start:

```bash
npm start
```

---

## 🛣️ API Routes Overview

Below is an overview of the key API route endpoints:

### User Routes (`/api/v1/users`)
- `POST /register` - Register a new user (handles avatar and cover image uploads)
- `POST /login` - Log in a user (returns access and refresh tokens)
- `POST /logout` - Log out a user (requires authentication)
- `POST /refresh-token` - Refresh expired access token
- `POST /change-password` - Update password
- `GET /current-user` - Retrieve active user profile details
- `PATCH /update-account` - Update account details (email, fullname)
- `PATCH /avatar` - Update user avatar image
- `PATCH /cover-image` - Update user cover image
- `GET /c/:username` - Get channel profile details by username
- `GET /history` - Get user watch history

### Video Routes (`/api/v1/videos`)
- `GET /` - Retrieve all videos (with search query, page, limit, sort, userId filters)
- `POST /` - Publish a new video (handles video and thumbnail uploads)
- `GET /:videoId` - Get a video by ID
- `PATCH /:videoId` - Update video details (title, description, thumbnail)
- `DELETE /:videoId` - Delete a video
- `PATCH /toggle/publish/:videoId` - Toggle publication status

### Comment Routes (`/api/v1/comments`)
- `GET /:videoId` - Get all comments for a video (paginated)
- `POST /:videoId` - Add a comment to a video
- `PATCH /c/:commentId` - Edit a comment
- `DELETE /c/:commentId` - Delete a comment

---

## 📜 Available Scripts

- `npm run dev`: Runs the backend server using Nodemon configured for IPv4 resolving.
- `npm start`: Runs the backend server using standard Node.js.
- `npm test`: Runs the test suite (currently placeholder).
