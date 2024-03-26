import { Router } from "express";
import { CreateChatList, DeleteChatLists, GetChatLists, ListMessages, SendMessage } from "../controllers/chatController.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const chat = Router();

chat.post("/send-message", SendMessage);
chat.get("/get-messages", ListMessages);

// Chat List API
chat.post("/create-chat-list", CreateChatList);
chat.get("/get-chat-list", GetChatLists);
chat.delete("/delete-chat-list/:id", DeleteChatLists);

export default chat;
