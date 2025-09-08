import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();
const allowedOrigins = process.env.CLIENT_URL || '*';
app.use(express.json({limit:'20kb'}));
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(cookieParser());
app.use(cors({
    origin:allowedOrigins,
    methods:["GET","POST","PUT","DELETE"],
    credentials:true,
}));

export default app;