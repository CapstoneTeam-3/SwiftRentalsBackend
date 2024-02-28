import { Schema, model } from "mongoose";

const ChatSchema = new Schema({
    content: { type: String, required: true },
    status: { type: String, enum: ["SENT", "READ"] },
    sender_user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    receiver_user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    chatListId: { type: Schema.Types.ObjectId, ref: 'ChatList', required: true },
    createdAt: { type: Date, default: Date.now }
});

const Chat = model("Chat", ChatSchema);

export default Chat;
