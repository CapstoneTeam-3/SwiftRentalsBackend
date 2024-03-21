import { Types } from "mongoose";
import ChatList from "../models/ChatListModel.js";
import Chat from "../models/ChatModel.js";
import User from "../models/userModel.js";

export const SendMessage = async (req, res) => {
    const {
        chatList_id,
        sender_id,
        receiver_id,
        content,
    } = req.body;

    try {
        if (!chatList_id || !Types.ObjectId.isValid(chatList_id)) {
            return res.status(400).json({ error: "Chat list id is required" });
        } else {
            const chatList = await ChatList.findById(chatList_id);
            if (!chatList) {
                return res.status(400).json({ error: "Chat list is not valid" });;
            }
        }
        if (!sender_id || !Types.ObjectId.isValid(sender_id)) {
            return res.status(400).json({ error: "Sender id is required" });
        } else {
            const sender = await User.findById(sender_id);
            if (!sender) {
                return res.status(400).json({ error: "Sender is not valid" });;
            }
        }
        if (!receiver_id || !Types.ObjectId.isValid(receiver_id)) {
            return res.status(400).json({ error: "Receiver id is required" });
        } else {
            const receiver = await User.findById(receiver_id);
            if (!receiver) {
                return res.status(400).json({ error: "Receiver is not valid" });;
            }
        }
        if (sender_id == receiver_id) {
            return res.status(400).json({ error: "Sender and receiver needs to be different" });;
        }
        if (!content) {
            return res.status(400).json({ error: "Content is required" });
        }

        const newMessage = new Chat({
            chatListId: chatList_id,
            sender_user: sender_id,
            receiver_user: receiver_id,
            content
        });

        await newMessage.save();

        res.json({ message: "Successfully sent message." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

export const ListMessages = async (req, res) => {
    try {
        const { chatList_id } = req.query;
        if (chatList_id) {
            const chats = await Chat.find({ chatListId: chatList_id });
            return res.status(200).json({ chats });
        }
        const chats = await Chat.find();

        return res.status(200).json({ chats });
    } catch (error) {
        console.error("Error updating availability:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}

// Chat List
export const CreateChatList = async (req, res) => {
    const {
        user1,
        user2,
    } = req.body;

    try {
        if (!user1 || !Types.ObjectId.isValid(user1)) {
            return res.status(400).json({ error: "User1 is required" });
        } else {
            const user_1 = await User.findById(user1);
            if (!user_1) {
                return res.status(400).json({ error: "User1 is not valid" });;
            }
        }
        if (!user2 || !Types.ObjectId.isValid(user2)) {
            return res.status(400).json({ error: "User2 is required" });
        } else {
            const user_2 = await User.findById(user2);
            if (!user_2) {
                return res.status(400).json({ error: "User2 is not valid" });;
            }
        }

        const chatList = await Chat.find({ $or: [{ user1, user2 }, { user1: user2, user2: user1 }] });
        console.log("chatList", chatList);

        if (chatList.length) {
            return res.status(200).json({ message: "Chat already exists" });
        }

        const newChatList = new ChatList({
            user1,
            user2
        });

        await newChatList.save();

        res.json({ chatList: newChatList, message: "Successfully created chatList." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

export const GetChatLists = async (req, res) => {
    try {
        const { user_id } = req.query;
        if (user_id) {
            const chatList = await ChatList.find({ $or: [{ user1: user_id }, { user2: user_id }] }).populate('user1').populate('user2');
            const oppositeUserChatList = chatList.map(chat => {
                return {
                    _id: chat._id,
                    user: chat.user1._id.toString() === user_id.toString() ? chat.user2 : chat.user1,
                };
            });

            return res.status(200).json({ chatList: oppositeUserChatList });
        }
        const chatList = await ChatList.find()
            .populate("user1")
            .populate("user2");

        return res.status(200).json({ chatList });
    } catch (error) {
        console.error("Error updating availability:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}

export const DeleteChatLists = async (req, res) => {
    try {
        const chatList_id = req.params.id;
        console.log('chatList_id ', chatList_id);
        if (!chatList_id || !Types.ObjectId.isValid(chatList_id)) {
            console.log('chatList_id ', Types.ObjectId.isValid(chatList_id));
            return res.status(400).json({ error: "ChatList id is required" });
        }

        const chatList = await ChatList.findByIdAndDelete(chatList_id);
        return res.status(200).json({ message: "ChatList deleted", chatList });
    } catch (error) {
        console.error("Error updating availability:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}