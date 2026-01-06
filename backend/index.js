const express = require("express");
const http = require("http");
const cors = require("cors");
const colors = require("colors");
const dotenv = require("dotenv");
dotenv.config();
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const { ConnectDB } = require("./config/dbConnect");

const socketIO = require("socket.io");
const BotRoute = require("./routes/BotRoute");
const CredentialRoute = require("./routes/CredentialRoute");
const MessageRoute = require("./routes/MessageRoute");
const GroupRoute = require("./routes/GroupRoute");
const PlanRoute = require("./routes/PlanRoute");
const AuthToken = require("./middleware/tokenAuth");
const Message = require("./model/MessageModel");
const onlineUsers = new Set();
const userSockets = new Map(); // userId -> socket.id

const server = express();

// Create http server and use it for both Express and Socket.IO
const server1 = http.createServer(server);
const io = socketIO(server1, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
  },
});

server.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
server.use(express.json());
server.use(cookieParser());
// server.use(morgan("dev"));

// DB Connect
ConnectDB();

server.use("/bot", BotRoute);
server.use("/user", CredentialRoute);
server.use("/message", AuthToken, MessageRoute);
server.use("/group", AuthToken, GroupRoute);
server.use("/plan", AuthToken, PlanRoute);

io.on("connection", (socket) => {
  console.log("🟢 Socket connected:", socket.id);

  // Log current online users and userSockets map
  console.log(`Current onlineUsers: ${Array.from(onlineUsers).join(", ")}`);
  console.log(`Current userSockets:`, [...userSockets.entries()]);

  // Send initial online users to this new socket
  socket.emit("online-user", Array.from(onlineUsers));

  // 🧩 When user comes online
  socket.on("user-online", (userId) => {
    userId = String(userId); // normalize to string
    onlineUsers.add(userId);
    userSockets.set(userId, socket.id);

    console.log(`${userId} is now online`);
    console.log(`Updated onlineUsers: ${Array.from(onlineUsers).join(", ")}`);

    // Emit to just the new user
    socket.emit("online-user", Array.from(onlineUsers));

    // Broadcast to others
    socket.broadcast.emit("online-user", Array.from(onlineUsers));
  });

  // Handle "typing" event
  socket.on("typing", ({ to, from }) => {
    const receiverSocketId = userSockets.get(to);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("typing", { from }); // send to receiver only
    }
  });

  // Handle "stopTyping" event
  socket.on("stopTyping", ({ to, from }) => {
    const receiverSocketId = userSockets.get(to);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("stopTyping", { from });
    }
  });

  // 🧩 Handle messages (no DB save here)
  socket.on("message", (data) => {
    console.log("📩 New message:", data);

    const receiverSocketId = userSockets.get(data.receiverId);

    // ✅ Send to receiver (if online)
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("message", data);
      console.log(`Message sent to receiver: ${data.receiverId}`);
    }
  });

  // Handle mark-messages-read event from frontend
  socket.on("mark-messages-read", async ({ senderId, receiverId }) => {
    try {
      await Message.updateMany(
        { senderId, receiverId, read: false },
        { $set: { read: true } }
      );

      // Notify sender that their messages were read
      const senderSocket = userSockets.get(senderId);
      if (senderSocket) {
        io.to(senderSocket).emit("messages-read", { receiverId });
      }
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  });

  // Add this new "read" event listener to mark messages as read
  socket.on("read", async ({ senderId, receiverId }) => {
    try {
      await Message.updateMany(
        { senderId, receiverId, read: false },
        { $set: { read: true } }
      );

      // Notify sender to update their UI about read messages
      const senderSocket = userSockets.get(senderId);
      if (senderSocket) {
        io.to(senderSocket).emit("messages-read", { receiverId });
      }
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  });

  // 🔹 GROUP SOCKET EVENTS

  // Join group room
  socket.on("join-group", (groupId) => {
    socket.join(groupId);
    console.log(`Socket ${socket.id} joined group: ${groupId}`);
  });

  // Leave group room
  socket.on("leave-group", (groupId) => {
    socket.leave(groupId);
    console.log(`Socket ${socket.id} left group: ${groupId}`);
  });

  // Handle group messages
  socket.on("group-message", (data) => {
    console.log("📩 New group message:", data);
    // Broadcast to all users in the group room (including sender)
    io.to(data.groupId).emit("group-message", data);
  });

  // Handle group typing
  socket.on("group-typing", ({ groupId, from, userName }) => {
    // Send to all users in group except sender
    socket.to(groupId).emit("group-typing", { from, userName });
  });

  // Handle group stop typing
  socket.on("group-stop-typing", ({ groupId, from, userName }) => {
    socket.to(groupId).emit("group-stop-typing", { from, userName });
  });

  // Handle plan events
  socket.on("plan-created", ({ groupId, plan, pollMessage }) => {
    io.to(groupId).emit("plan-created", { groupId, plan, pollMessage });
  });

  socket.on("plan-updated", ({ groupId, plan }) => {
    socket.to(groupId).emit("plan-updated", { groupId, plan });
  });

  socket.on("plan-deleted", ({ groupId, planId, pollMessageId }) => {
    io.to(groupId).emit("plan-deleted", { groupId, planId, pollMessageId });
  });

  // 🧩 Handle user logout
  socket.on("user-logout", (userId) => {
    onlineUsers.delete(userId);
    userSockets.delete(userId);
    io.emit("online-user", Array.from(onlineUsers));
    console.log(`${userId} logged out`);
  });

  // 🧩 Handle disconnect
  socket.on("disconnect", () => {
    const userId = [...userSockets.entries()].find(
      ([uid, sId]) => sId === socket.id
    )?.[0];

    if (userId) {
      onlineUsers.delete(userId);
      userSockets.delete(userId);
      io.emit("online-user", Array.from(onlineUsers));
    }

    console.log("🔴 Socket disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 9860;
server1.listen(PORT, () => {
  console.log(`Server is Started on port:${PORT}`.bgMagenta);
});
