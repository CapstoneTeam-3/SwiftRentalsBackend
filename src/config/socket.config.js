import { Server as SocketServer } from "socket.io";
import Chat from "../models/ChatModel.js";

export const startSocket = (httpServer) => {
  let activeMap = {};

  const io = new SocketServer(httpServer, {
    cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    socket.on("activeUser", ({ sender, socketId }) => {
      console.log(sender, socketId);
      activeMap[sender] = socketId;
    });

    socket.on("message", async (message) => {
      const { chatList_id, sender_id, receiver_id, content } = message;
      console.log("activeMap ", 1);
      const isReceiverActive = activeMap[receiver_id];
      console.log(message);
      const newMessage = new Chat({
        chatListId: chatList_id,
        sender_user: sender_id,
        receiver_user: receiver_id,
        content,
      });
      await newMessage.save();

      if (isReceiverActive) {
        console.log("fired");
        io.to(isReceiverActive).emit("receive-message", newMessage);
      }
    });
  });
};
