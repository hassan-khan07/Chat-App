import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
// import { app } from "./utils/socket.js";
const app = express();

// cors aur cookie parser configure hota hain app banna ka baad tab hi app.use aur app.get kar sakta hain
// const app = express();

import path from "path";

// jab bi async method complete hota ha wo promise return karta ha
// app.use ham tab use karta jab middleware ya configuration setting karni hoo

app.use(
  cors({
    // origin: process.env.CORS_ORIGIN,
    origin: "http://localhost:5173",
    credentials: true,
  })
);

const __dirname = path.resolve();

// json pa limit is lya lagaye ha ta ka server crash na hoo
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

//routes import
import userRouter from "./routes/user.routes.js";
import messageRoutes from "./routes/message.routes.js";
import groupRoutes from "./routes/group.routes.js";
import groupMessagesRoutes from "./routes/groupMessages.routes.js";

import { ApiError } from "./utils/ApiError.js";

//routes declaration

app.use("/api/users", userRouter);
app.use("/api/messages", messageRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/group-messages", groupMessagesRoutes);

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  });
}

// Global error handling middleware
app.use((err, req, res, next) => {
  let error = err;

  // If error is not an instance of ApiError, convert it
  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || 500;
    const message = error.message || "Something went wrong";
    error = new ApiError(statusCode, message, error?.errors || [], err.stack);
  }

  const response = {
    success: false,
    message: error.message,
    statusCode: error.statusCode,
    ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
  };

  return res.status(error.statusCode).json(response);
});

// http://localhost:8000/api/v1/users/register

export { app };
