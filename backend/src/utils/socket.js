import { Server } from "socket.io";
import http from "http";
import express from "express";
import { app } from "../app.js";

// const app = express();
const server = http.createServer(app);

// io = new Server(server); → Socket.IO server instance (handles real-time connections).
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"],
  },
});
// if you want to send a private message to a user, you need their socket ID.
export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

// used to store online users
// This helps us track who is online and how to send them messages.
const userSocketMap = {}; // {userId: socketId}

// io is our server instance and .on is like event listener that will listen event like connection and it will run every time client connects to the server
io.on("connection", (socket) => {
  console.log("A user connected", socket.id);

  // socket.handshake.query → reads data sent by the client when connecting.
  const userId = socket.handshake.query.userId;
  if (userId) userSocketMap[userId] = socket.id;

  // io.emit() is used to send events to all the connected clients
  // Object.keys(userSocketMap) → gives all user IDs currently online.
  // So whenever a new user joins, everyone gets updated list.
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  //  Join group rooms
  socket.on("joinGroup", (groupId) => {
    socket.join(groupId);
    console.log(`User ${userId} joined group ${groupId}`);
  });

  //  Leave group rooms
  socket.on("leaveGroup", (groupId) => {
    socket.leave(groupId);
    console.log(`User ${userId} left group ${groupId}`);
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected", socket.id);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { io, app, server };

// diff between socket and io

// io → Global (server-wide) or all clients
// Used when you want to send/receive events involving all clients.like sending a message to everyone in a group chat.
// socket = local, single client
// Used when you want to send/receive events involving just one client.like sending a private message to a specific user.

// diff between io and emit
// Pressing the doorbell button = emit (sending signal).
// Hearing the “ding-dong” sound inside = on (listening for signal).
// Real life: emit is pressing → on is reacting to the sound.
// EMIT IS LIKE SENDING A MESSAGE AND ON IS LIKE RECEIVING A MESSAGE LIKE THEY LISTEN FOR ON

// diff between io.emit and socket.emit
// io.emit() = broadcasting to everyone (all clients).
// socket.emit() = sending to one specific client (the one connected via that socket).like this
