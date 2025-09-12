// import express from "express";
// import cors from "cors";
// import cookieParser from "cookie-parser";
// // import { app } from "./utils/socket.js";
// import path from "path";

// // cors aur cookie parser configure hota hain app banna ka baad tab hi app.use aur app.get kar sakta hain
// const app = express();

// // jab bi async method complete hota ha wo promise return karta ha
// // app.use ham tab use karta jab middleware ya configuration setting karni hoo

// app.use(
//   cors({
//     // origin: process.env.CORS_ORIGIN,
//     // origin: "http://localhost:5173",
//     origin: process.env.CORS_ORIGIN || "http://localhost:5173",
//     credentials: true,
//   })
// );

// const __dirname = path.resolve();

// // json pa limit is lya lagaye ha ta ka server crash na hoo
// app.use(express.json({ limit: "16kb" }));
// app.use(express.urlencoded({ extended: true, limit: "16kb" }));
// app.use(express.static("public"));
// app.use(cookieParser());

// //routes import
// import userRouter from "./routes/user.routes.js";
// import messageRoutes from "./routes/message.routes.js";
// import groupRoutes from "./routes/group.routes.js";
// import groupMessagesRoutes from "./routes/groupMessages.routes.js";

// import { ApiError } from "./utils/ApiError.js";

// //routes declaration

// app.use("/api/users", userRouter);
// app.use("/api/messages", messageRoutes);
// app.use("/api/groups", groupRoutes);
// app.use("/api/group-messages", groupMessagesRoutes);

// if (process.env.NODE_ENV === "production") {
//   app.use(express.static(path.join(__dirname, "../frontend/dist")));

//   app.get("*", (req, res) => {
//     res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
//   });
// }

// // Global error handling middleware
// app.use((err, req, res, next) => {
//   let error = err;

//   // If error is not an instance of ApiError, convert it
//   if (!(error instanceof ApiError)) {
//     const statusCode = error.statusCode || 500;
//     const message = error.message || "Something went wrong";
//     error = new ApiError(statusCode, message, error?.errors || [], err.stack);
//   }

//   const response = {
//     success: false,
//     message: error.message,
//     statusCode: error.statusCode,
//     ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
//   };

//   return res.status(error.statusCode).json(response);
// });

// // http://localhost:8000/api/v1/users/register

// export { app };


import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
  })
);

const __dirname = path.resolve();

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// 🔥 DEBUGGING: ALL ROUTES COMMENTED OUT
console.log("🔥 DEBUGGING MODE: All routes disabled");

// STEP 1: Test with NO routes first - uncomment ONE by ONE to find the problem

/*
console.log("Loading user routes...");
import userRouter from "./routes/user.routes.js";
app.use("/api/users", userRouter);
console.log("✅ User routes loaded");
*/

/*
console.log("Loading message routes...");
import messageRoutes from "./routes/message.routes.js";
app.use("/api/messages", messageRoutes);
console.log("✅ Message routes loaded");
*/

/*
console.log("Loading group routes...");
import groupRoutes from "./routes/group.routes.js";
app.use("/api/groups", groupRoutes);
console.log("✅ Group routes loaded");
*/

/*
console.log("Loading group message routes...");
import groupMessagesRoutes from "./routes/groupMessages.routes.js";
app.use("/api/group-messages", groupMessagesRoutes);
console.log("✅ Group message routes loaded");
*/

import { ApiError } from "./utils/ApiError.js";

// Basic health check route
app.get("/health", (req, res) => {
  res.json({ status: "Server is running!", message: "All routes disabled for debugging" });
});

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  });
}

// Global error handling middleware
app.use((err, req, res, next) => {
  let error = err;
  
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

console.log("🔥 Server starting with NO routes for debugging...");
export { app };