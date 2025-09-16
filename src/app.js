import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();
const allowedOrigins = process.env.CLIENT_URL || "*";

app.use(
    cors({
        origin: allowedOrigins,
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
        credentials: true,
    })
);
app.use(express.json({ limit: "20kb" }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(cookieParser());

//  routes import
import userRouter from "./routes/user.routes.js";
import tweetRouter from "./routes/tweet.routes.js";
import healthRouter from "./routes/healthcheck.routes.js";


// router delclaration

app.use("/api/v1/user", userRouter);
app.use("/api/v1/tweet", tweetRouter);
app.use("/api/v1/healthcheack", healthRouter);

// example route
// http://localhost:8000/api/v1/user/register

export default app;
