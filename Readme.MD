# Youtube Backend Project

## Overview

This project is a full-featured backend for a video hosting platform, similar to YouTube.  
It is built with **Node.js**, **Express.js**, **MongoDB**, **Mongoose**, **JWT**, **bcrypt**, and more.  
It supports user authentication, video management, comments, likes, playlists, subscriptions, tweets, and more.

---

## Features

- **User Authentication:** Register, login, logout, password change, JWT access/refresh tokens.
- **Video Management:** Upload, update, delete, publish/unpublish, view count.
- **Comments:** Add, update, delete, fetch comments for videos and tweets.
- **Likes:** Like/unlike videos, comments, tweets.
- **Playlists:** Create, update, delete playlists; add/remove videos.
- **Subscriptions:** Subscribe/unsubscribe to channels, view subscribers.
- **Tweets:** Create, update, delete tweets; fetch user tweets.
- **Dashboard:** Channel stats, channel videos.
- **Healthcheck:** Service status endpoint.
- **File Uploads:** Multer for local uploads, Cloudinary for cloud storage.
- **Watch History:** Track and fetch user watch history.

---

## Tech Stack

- **Node.js**
- **Express.js**
- **MongoDB** (with Mongoose ODM)
- **JWT** (Authentication)
- **bcrypt** (Password hashing)
- **Multer** (File uploads)
- **Cloudinary** (Image/video storage)
- **Cookie-Parser** (Cookie management)
- **CORS** (Cross-origin resource sharing)
- **dotenv** (Environment variables)

---

## Project Structure

```
src/
  controllers/      # Route handlers for all features
  models/           # Mongoose schemas for all entities
  routes/           # Express routers for each feature
  middlewares/      # Auth, multer, error handling
  utils/            # Helper classes (ApiError, ApiResponse, asyncHandler, cloudinary)
  DB/               # Database connection logic
  app.js            # Express app setup
  index.js          # Entry point
  constants.js      # Project constants
public/
  temp/             # Temporary file storage for uploads
.env                # Environment variables
```

---

## API Endpoints

### User

- `POST /api/v1/user/register` — Register a new user
- `POST /api/v1/user/login` — Login
- `POST /api/v1/user/logout` — Logout
- `POST /api/v1/user/refresh-token` — Refresh JWT tokens
- `POST /api/v1/user/change-password` — Change password
- `GET /api/v1/user/current-user` — Get current user info
- `PATCH /api/v1/user/update-account` — Update account details
- `PATCH /api/v1/user/update-avatar` — Update avatar
- `PATCH /api/v1/user/update-cover` — Update cover image
- `GET /api/v1/user/c/:username` — Get channel profile
- `GET /api/v1/user/history` — Get watch history

### Video

- `GET /api/v1/video/` — Get all videos
- `POST /api/v1/video/` — Upload a video
- `GET /api/v1/video/:videoId` — Get video by ID
- `DELETE /api/v1/video/:videoId` — Delete video
- `PATCH /api/v1/video/:videoId` — Update video
- `PATCH /api/v1/video/toggle/publish/:videoId` — Toggle publish status

### Tweet

- `POST /api/v1/tweet/` — Create tweet
- `GET /api/v1/tweet/user/:userId` — Get user tweets
- `PATCH /api/v1/tweet/:tweetId` — Update tweet
- `DELETE /api/v1/tweet/:tweetId` — Delete tweet

### Playlist

- `POST /api/v1/playlist/` — Create playlist
- `GET /api/v1/playlist/user/:userId` — Get user playlists
- `GET /api/v1/playlist/:playlistId` — Get playlist by ID
- `PATCH /api/v1/playlist/:playlistId` — Update playlist
- `DELETE /api/v1/playlist/:playlistId` — Delete playlist
- `PATCH /api/v1/playlist/add/:videoId/:playlistId` — Add video to playlist
- `PATCH /api/v1/playlist/remove/:videoId/:playlistId` — Remove video from playlist

### Comment

- `GET /api/v1/comment/:videoId` — Get comments for a video
- `POST /api/v1/comment/:videoId` — Add comment to a video
- `PATCH /api/v1/comment/c/:commentId` — Update comment
- `DELETE /api/v1/comment/c/:commentId` — Delete comment

### Like

- `POST /api/v1/like/toggle/v/:videoId` — Like/unlike video
- `POST /api/v1/like/toggle/c/:commentId` — Like/unlike comment
- `POST /api/v1/like/toggle/t/:tweetId` — Like/unlike tweet
- `GET /api/v1/like/videos` — Get liked videos

### Subscription

- `GET /api/v1/subscription/c/:channelId` — Get channel subscribers
- `POST /api/v1/subscription/c/:channelId` — Subscribe/unsubscribe to channel
- `GET /api/v1/subscription/u/:subscriberId` — Get channels user has subscribed to

### Dashboard

- `GET /api/v1/dashboard/stats` — Get channel stats
- `GET /api/v1/dashboard/videos` — Get channel videos

### Healthcheck

- `GET /api/v1/healthcheack` — Service status

---

## Setup Instructions

1. **Clone the repository**
2. **Install dependencies**
   ```
   npm install
   ```
3. **Configure environment variables**
   - Create a `.env` file with your MongoDB URI, JWT secrets, Cloudinary keys, etc.
4. **Run the server**
   ```
   npm run dev
   ```
5. **API available at:**  
   `http://localhost:8000/api/v1/`

---

## Environment Variables

Example `.env` file:
```
PORT=8000
MONGO_URL=your_mongodb_connection_string
ACCESS_TOKEN_SECRET=your_access_token_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret
ACCESS_TOKEN_EXPIRY=1h
REFRESH_TOKEN_EXPIRY=7d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLIENT_URL=http://localhost:3000
```

---

## Contributing

Feel free to fork, open issues, or submit pull requests!

---

## License

ISC

---

## Author

Bablu Arya