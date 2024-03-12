// app.js or index.js
import bodyParser from "body-parser";
import { log } from "console";
import cors from "cors";
import express from "express";
import http from "http";
import mongoose from "mongoose";
import { Server as SocketServer } from "socket.io";
import { MONGODB_URI, PORT } from "./src/config/index.js";
import authRoutes from "./src/routes/auth.js";
import bookingRoutes from "./src/routes/booking.router.js";
import carRoutes from "./src/routes/car.js";
import chatRoutes from "./src/routes/chat.js";

const app = express();
const httpServer = http.createServer(app);
const io = new SocketServer(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cors());

mongoose.connect(MONGODB_URI, {});

const db = mongoose.connection;

db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => {
  console.log("Connected to MongoDB");
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});
let activeMap = {};
io.on("connection", (socket) => {
  socket.emit("howdy", "Hii");

  socket.on("activeUser", ({ sender, socketId }) => {
    // activeUsers = [...activeUsers, { id: sender, socketId }];
    console.log(sender, socketId);
    activeMap[sender] = socketId;
  });

  socket.on("message", (message) => {
    const { chatList_id, sender_id, receiver_id, content } = message;
    console.log("activeMap ", 1);
    const isReceiverActive = activeMap[receiver_id];
    if (isReceiverActive) {
      console.log("fired");
      io.to(isReceiverActive).emit("receive-message", message);
    }
    // db add
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/car", carRoutes);
app.use("/api/booking", bookingRoutes);
app.use("/api/chat", chatRoutes);

httpServer.listen(PORT, () => {
  console.log(`\x1b[36m listening on port ${PORT}...\x1b[0m`);
});
