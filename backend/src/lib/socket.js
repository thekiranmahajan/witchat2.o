import { Server } from "socket.io";
import http from "http";
import express from "express";
import User from "../models/user.model.js";

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

  socket.on("start-typing", ({ typingUserId, receiverId }) => {
    const receiverSocketId = getSocketIdFromUserId(receiverId);
    if (receiverSocketId && typingUserId !== receiverId) {
      io.to(receiverSocketId).emit("user-started-typing", { typingUserId });
    }
  });

  socket.on("stop-typing", ({ typingUserId, receiverId }) => {
    const receiverSocketId = getSocketIdFromUserId(receiverId);
    if (receiverSocketId && typingUserId !== receiverId) {
      io.to(receiverSocketId).emit("user-stopped-typing", { typingUserId });
    }
  });

  socket.on("disconnect", async () => {
    console.log("A user is disconnected", socket.id);

    // Update lastSeen for the user
    if (userId) {
      try {
        const updatedUser = await User.findByIdAndUpdate(
          userId,
          { lastSeen: new Date() },
          { new: true }
        );
        if (updatedUser) {
          io.emit("userLastSeenUpdated", {
            userId,
            lastSeen: updatedUser.lastSeen,
          });
        }
      } catch (err) {
        console.error("Failed to update lastSeen:", err);
      }
    }
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export function emitNewUserSignup(newUser) {
  io.emit("newUserSignup", newUser);
}

export { io, app, server };
