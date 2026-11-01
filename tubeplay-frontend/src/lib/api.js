
import axios from "axios";

const baseURL = `${
    import.meta.env.VITE_API_URL || "http://localhost:8000"
}/api/v1`;

export const api = axios.create({
    baseURL,
    withCredentials: true,
    timeout: 30000,
});

// Prevent multiple simultaneous refresh requests
let refreshPromise = null;

// Attach access token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("tubeplay_access_token");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

// Automatically refresh expired access tokens
api.interceptors.response.use(
    (response) => response,

    async (error) => {
        const original = error.config;

        if (
            error.response?.status !== 401 ||
            !original ||
            original._retried ||
            original.url?.includes("/user/login") ||
            original.url?.includes("/user/refresh-token")
        ) {
            return Promise.reject(error);
        }

        original._retried = true;

        try {
            if (!refreshPromise) {
                refreshPromise = axios
                    .post(
                        `${baseURL}/user/refresh-token`,
                        {},
                        { withCredentials: true }
                    )
                    .then((response) => {
                        const accessToken = response.data?.data?.accessToken;

                        if (!accessToken) {
                            throw new Error(
                                "Access token missing from refresh response"
                            );
                        }

                        localStorage.setItem(
                            "tubeplay_access_token",
                            accessToken
                        );

                        return accessToken;
                    })
                    .finally(() => {
                        refreshPromise = null;
                    });
            }

            const newAccessToken = await refreshPromise;

            original.headers = original.headers || {};
            original.headers.Authorization = `Bearer ${newAccessToken}`;

            return api(original);

        } catch (refreshError) {
            localStorage.removeItem("tubeplay_access_token");

            return Promise.reject(refreshError);
        }
    }
);

// Response helpers
export const payload = (res) => res?.data?.data ?? res?.data;

export const messageOf = (err) =>
    err?.response?.data?.message ||
    err?.message ||
    "Something went wrong";

// API endpoints
export const endpoints = {
    currentUser: () => api.get("/user/current-user"),
      searchUsers: (query) =>
        api.get("/user/search", { params: { query } }),

    refreshSession: () => api.post("/user/refresh-token", {}),

    videos: (params = {}) => api.get("/video/", { params }),
    video: (id) => api.get(`/video/${id}`),
    addToHistory: (id) => api.post(`/video/${id}/history`),
    comments: (id, params = {}) =>
        api.get(`/comment/${id}`, { params }),

    addComment: (id, content) =>
        api.post(`/comment/${id}`, { content }),

    toggleVideoLike: (id) => api.post(`/likes/toggle/v/${id}`),
    likedVideos: () => api.get("/likes/videos"),

    channel: (username) => api.get(`/user/c/${username}`),
    history: () => api.get("/user/history"),

    dashboardStats: () => api.get("/dashboard/stats"),
    dashboardVideos: () => api.get("/dashboard/videos"),

    upload: (form) => api.post("/video/", form),
    updateVideo: (id, form) => api.patch(`/video/${id}`, form),
    deleteVideo: (id) => api.delete(`/video/${id}`),
    togglePublish: (id) =>
        api.patch(`/video/toggle/publish/${id}`),

    playlists: (userId) => api.get(`/playlist/user/${userId}`),
    playlist: (id) => api.get(`/playlist/${id}`),
    createPlaylist: (body) => api.post("/playlist/", body),
    updatePlaylist: (id, body) => api.patch(`/playlist/${id}`, body),
    deletePlaylist: (id) => api.delete(`/playlist/${id}`),

    addToPlaylist: (videoId, playlistId) =>
        api.patch(`/playlist/add/${videoId}/${playlistId}`),

    removeFromPlaylist: (videoId, playlistId) =>
        api.patch(`/playlist/remove/${videoId}/${playlistId}`),

    tweets: (userId) => api.get(`/tweet/user/${userId}`),
    createTweet: (content) => api.post("/tweet/", { content }),
    updateTweet: (id, content) =>
        api.patch(`/tweet/${id}`, { content }),
    deleteTweet: (id) => api.delete(`/tweet/${id}`),

    toggleTweetLike: (id) => api.post(`/likes/toggle/t/${id}`),
    toggleSubscribe: (id) =>
        api.post(`/subscription/toggle/${id}`),

    subscribers: (id) =>
        api.get(`/subscription/subscribers/${id}`),

    subscriptions: (id) =>
        api.get(`/subscription/user/${id}`),

    register: (form) => api.post("/user/register", form),
    login: (body) => api.post("/user/login", body),
    logout: () => api.post("/user/logout"),

    updateAccount: (body) =>
        api.patch("/user/update-account", body),

    updateAvatar: (form) =>
        api.patch("/user/update-avatar", form),

    updateCover: (form) =>
        api.patch("/user/update-cover", form),

    changePassword: (body) =>
        api.post("/user/change-password", body),

    health: () => api.get("/healthcheck/"),
};
