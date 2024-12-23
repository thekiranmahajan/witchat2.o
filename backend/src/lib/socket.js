import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"],
  },
});

export function getSocketIdFromUserId(userId) {
  return userSocketMap[userId];
}

// Online users e.g. userId: socketId
const userSocketMap = {};

io.on("connection", (socket) => {
  console.log("A user is connected", socket.id);

  const userId = socket.handshake.query.userId;

  if (userId) userSocketMap[userId] = socket.id;
  // broadcast to all users
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    console.log("A user is disconnected", socket.id);

    delete userSocketMap[userId];
    // broadcast to all users
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { io, app, server };
